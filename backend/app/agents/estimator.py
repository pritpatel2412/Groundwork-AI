import json
from typing import List
from app.llm_clients.router import call_llm
from app.models.schemas import EstimatorOutput, EstimateRange, Claim

class EstimatorAgent:
    """
    Estimator Agent: Produces realistic range-based estimates and milestone roadmaps.
    Outputs a range (never a single number) plus calibrated reference cases.
    (BUILD_BRIEF.md §4.4)
    """
    def run(self, requirements: List[Claim], architecture_claims: List[Claim]) -> EstimatorOutput:
        if not requirements:
            raise ValueError("Cannot calibrate delivery estimates without grounded business requirements.")

        req_count = len(requirements)
        arch_count = len(architecture_claims)

        system_prompt = (
            "You are a Software Engineering Delivery Manager. Estimate implementation timelines.\n"
            "Rules:\n"
            "1. Output a RANGE of weeks: optimistic, realistic, and pessimistic. NEVER a single fixed number.\n"
            "2. Provide a calibrated reference case comparing directly to scope complexity.\n"
            "3. Output estimated cost range in USD.\n"
            "4. Provide 3-4 milestone phases with estimated durations.\n\n"
            "Return strict JSON with keys:\n"
            "{\n"
            '  "optimistic_weeks": float,\n'
            '  "realistic_weeks": float,\n'
            '  "pessimistic_weeks": float,\n'
            '  "cost_estimate_usd": "$XX,XXX - $XX,XXX",\n'
            '  "calibrated_reference": "Specific reference case description",\n'
            '  "milestones": [\n'
            '    {"phase": "Phase Name", "weeks": float, "deliverables": "Key deliverables"}\n'
            '  ]\n'
            "}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Scope Summary: {req_count} requirements identified, {arch_count} architectural components."}
        ]

        raw = call_llm(messages, purpose="generate", temperature=0.1, json_mode=True)

        try:
            import re
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
        except Exception as e:
            raise RuntimeError(f"EstimatorAgent failed to parse LLM JSON: {e}. Raw response snippet: {raw[:300]}")

        if not all(k in data for k in ["optimistic_weeks", "realistic_weeks", "pessimistic_weeks"]):
            raise RuntimeError(f"EstimatorAgent returned incomplete timeline keys: {data}")

        estimate = EstimateRange(
            optimistic_weeks=float(data.get("optimistic_weeks", 4.0)),
            realistic_weeks=float(data.get("realistic_weeks", 7.0)),
            pessimistic_weeks=float(data.get("pessimistic_weeks", 11.0)),
            cost_estimate_usd=str(data.get("cost_estimate_usd", "$30,000 - $55,000")),
            calibrated_reference=str(data.get("calibrated_reference", "Calibrated reference workflow"))
        )

        claims = [
            Claim(
                text=f"Realistic delivery window: {estimate.realistic_weeks} weeks (range: {estimate.optimistic_weeks} - {estimate.pessimistic_weeks} weeks)",
                status="inferred",
                citations=[],
                confidence=0.85
            ),
            Claim(
                text=f"Estimated budget range: {estimate.cost_estimate_usd}",
                status="inferred",
                citations=[],
                confidence=0.8
            )
        ]

        return EstimatorOutput(
            estimate=estimate,
            milestones=data.get("milestones", []),
            claims=claims
        )
