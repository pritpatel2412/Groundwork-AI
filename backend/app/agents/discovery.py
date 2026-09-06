import json
from typing import List
from app.llm_clients.router import call_llm
from app.models.schemas import DiscoveryOutput, Claim, SourceChunk

class DiscoveryAgent:
    """
    Discovery Agent: Structures raw ingested material into a coherent context summary.
    (BUILD_BRIEF.md §4.4)
    """
    def run(self, chunks: List[SourceChunk]) -> DiscoveryOutput:
        context_text = "\n\n".join([f"[Chunk {c.chunk_index}]: {c.text}" for c in chunks[:12]])

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a Discovery Agent in a Business Transformation Copilot.\n"
                    "Your task is to analyze the provided raw business documents/notes and extract:\n"
                    "1. A concise business summary (2-3 paragraphs)\n"
                    "2. Identified business domains (e.g., Procurement, Approvals, Billing)\n"
                    "3. Key actors and personas involved\n"
                    "4. Key operational notes\n\n"
                    "Output strict JSON with keys: 'summary' (str), 'identified_domains' (list of str), "
                    "'key_actors' (list of str), 'extracted_notes' (list of str)."
                )
            },
            {
                "role": "user",
                "content": f"Source Material:\n{context_text}"
            }
        ]

        raw_response = call_llm(messages, purpose="generate", temperature=0.1, json_mode=True)

        try:
            # Parse JSON
            import re
            cleaned = raw_response.strip()
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
            data = {
                "summary": raw_response[:300].strip() if raw_response else "Business discovery context initialized.",
                "identified_domains": [],
                "key_actors": [],
                "extracted_notes": []
            }

        claims = []
        for note in data.get("extracted_notes", []):
            claims.append(Claim(
                text=note,
                status="inferred",
                citations=[],
                confidence=0.8
            ))

        return DiscoveryOutput(
            summary=data.get("summary", "Business discovery completed."),
            identified_domains=data.get("identified_domains", []),
            key_actors=data.get("key_actors", []),
            extracted_notes=data.get("extracted_notes", []),
            claims=claims
        )
