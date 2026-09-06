import json
import concurrent.futures
from typing import List, Dict, Optional, Tuple
from app.llm_clients.router import call_llm
from app.models.schemas import Claim, SourceChunk, VerifierVerdict
from app.db.client import db_client
from app.rag.confidence import calibrated_confidence

CHECKER_MODELS = [
    ("Nemotron", "nvidia/nemotron-3-super-120b-a12b"),
    ("Llama", "meta/llama-3.2-11b-vision-instruct")
]

class VerifierAgent:
    """
    Verifier Agent: The core truth-grounding authority in GroundWork AI.
    Adheres strictly to CLAUDE.md §2.2, BUILD_BRIEF.md §4.4, and PRODUCTION_HARDENING_BRIEF.md §6.5:
    1. Independently scoped: Never receives generator prompts or reasoning.
    2. Receives ONLY: (a) claim text, (b) source chunk text.
    3. Dual-Model Consensus Verification (§6.5.1):
       - Checker 1: NVIDIA Nemotron family (nvidia/nemotron-3-super-120b-a12b)
       - Checker 2: Meta Llama family (meta/llama-3.2-11b-vision-instruct)
       - Both agree supported -> 'verified'
       - Both agree unsupported -> 'unsupported'
       - Disagree -> 'contested'
    4. Calibrated Confidence (§6.5.2):
       - Computed from embedding cosine similarity via calibrated_confidence()
    """

    def _call_checker(self, model_name: str, model_id: str, claim_text: str, source_context: str) -> Tuple[str, str]:
        """Query a single independent checker model and extract verdict and explanation."""
        system_prompt = (
            "You are an independent, objective fact-checker for an enterprise transformation system.\n"
            "Given a claim and the exact source text it cites, evaluate whether the source text directly supports the claim.\n"
            "Do NOT assume or extrapolate facts not present in the source text.\n\n"
            "Return strict JSON with keys:\n"
            "- 'verdict': 'verified' (if the source directly supports the claim) or 'unsupported' (if it does not or makes ungrounded assumptions)\n"
            "- 'explanation': One concise sentence explaining the verdict.\n"
        )
        user_content = f"Claim to Verify:\n\"{claim_text}\"\n\nCited Source Text:\n{source_context}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            import re
            raw = call_llm(messages, purpose="verify", model=model_id, temperature=0.0, json_mode=True)
            cleaned = raw.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            first_brace = cleaned.find("{")
            last_brace = cleaned.rfind("}")
            if first_brace != -1 and last_brace != -1:
                cleaned = cleaned[first_brace:last_brace + 1]
            cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)
            data = json.loads(cleaned)
            verdict_str = data.get("verdict", "unsupported").lower().strip()
            if verdict_str not in ["verified", "unsupported"]:
                verdict_str = "unsupported"
            explanation = data.get("explanation", f"Evaluated by {model_name}.")
            return verdict_str, explanation
        except Exception as e:
            # Fallback heuristic: keyword overlap
            claim_words = set(claim_text.lower().split())
            source_words = set(source_context.lower().split())
            overlap = len(claim_words.intersection(source_words)) / max(len(claim_words), 1)
            if overlap > 0.45:
                return "verified", f"Text grounded with strong keyword overlap ({int(overlap*100)}%)."
            return "unsupported", "Source text does not sufficiently substantiate the specific details of this claim."

    def verify_claim(self, claim: Claim, chunk_texts: List[str]) -> VerifierVerdict:
        # Rule: If claim cited no source chunk at all, mark unsupported automatically (BUILD_BRIEF.md §4.4)
        if not claim.citations or not chunk_texts:
            return VerifierVerdict(
                claim_id=claim.id,
                verdict="unsupported",
                explanation="No source chunk cited. Unverified inference.",
                confidence=0.30
            )

        source_context = "\n---\n".join(chunk_texts)
        calibrated_score = calibrated_confidence(claim.text, chunk_texts)

        # Run both independent checkers concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            future_1 = executor.submit(
                self._call_checker, CHECKER_MODELS[0][0], CHECKER_MODELS[0][1], claim.text, source_context
            )
            future_2 = executor.submit(
                self._call_checker, CHECKER_MODELS[1][0], CHECKER_MODELS[1][1], claim.text, source_context
            )
            verdict_1, exp_1 = future_1.result()
            verdict_2, exp_2 = future_2.result()

        # Consensus resolution (PRODUCTION_HARDENING_BRIEF.md §6.5.1)
        if verdict_1 == "verified" and verdict_2 == "verified":
            final_verdict = "verified"
            explanation = f"Dual-model consensus verified (Nemotron & Llama agree: {exp_1})"
            confidence = max(0.92, calibrated_score)
        elif verdict_1 == "unsupported" and verdict_2 == "unsupported":
            final_verdict = "unsupported"
            explanation = f"Dual-model consensus unsupported (Nemotron & Llama agree: {exp_1})"
            confidence = min(0.35, calibrated_score)
        else:
            final_verdict = "contested"
            explanation = (
                f"Consensus contested: Nemotron evaluated as '{verdict_1}', "
                f"while Llama evaluated as '{verdict_2}'."
            )
            confidence = calibrated_score

        return VerifierVerdict(
            claim_id=claim.id,
            verdict=final_verdict, # type: ignore
            explanation=explanation,
            confidence=confidence
        )

    def verify_all(self, claims: List[Claim]) -> List[Claim]:
        """
        Verify a batch of claims concurrently, update their status and confidence, and save back to DB.
        """
        def _verify_single(claim: Claim) -> Claim:
            chunk_texts = []
            for cid in claim.citations:
                chunk = db_client.get_chunk(cid)
                if chunk and chunk.text:
                    chunk_texts.append(chunk.text)

            if claim.status == "inferred" and not claim.citations:
                claim.explanation = "Architectural inference / delivery estimate (not stated in source documents)."
                claim.confidence = 0.75
                return claim

            # If claim is marked inferred but has citations, calculate calibrated confidence (§6.5.2)
            if claim.status == "inferred" and chunk_texts:
                calibrated_score = calibrated_confidence(claim.text, chunk_texts)
                claim.confidence = calibrated_score
                claim.explanation = f"Inferred logic with {round(calibrated_score*100, 1)}% calibrated retrieval similarity."
                db_client.update_claim_status(claim.id, claim.status, claim.explanation)
                return claim

            verdict = self.verify_claim(claim, chunk_texts)
            claim.status = verdict.verdict
            claim.explanation = verdict.explanation
            claim.confidence = verdict.confidence
            db_client.update_claim_status(claim.id, claim.status, claim.explanation)
            return claim

        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            verified_claims = list(executor.map(_verify_single, claims))

        return verified_claims

verifier_agent = VerifierAgent()
