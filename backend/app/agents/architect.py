import json
from typing import List
from app.llm_clients.router import call_llm
from app.models.schemas import ArchitectOutput, ArchitectureDecision, Claim

class ArchitectAgent:
    """
    Architect Agent: Generates Mermaid architecture diagrams and architecture decisions.
    Every decision cites a requirement ID or is labeled 'inferred'.
    (BUILD_BRIEF.md §4.4, CLAUDE.md §2.5)
    """
    def run(self, requirements: List[Claim]) -> ArchitectOutput:
        if not requirements:
            raise ValueError("Cannot design architecture without grounded business requirements.")

        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:16]])

        system_prompt = (
            "You are a Solution Architect. Given validated business requirements, design the technical solution architecture.\n"
            "Rules:\n"
            "1. Generate a clean, syntactically valid Mermaid flowchart (graph TD or graph LR).\n"
            "2. For each architectural decision, specify if it is directly verified from a requirement ID or inferred.\n"
            "3. Base all components, services, data stores, and workflows STRICTLY on the domain concepts in the provided requirements "
            "(e.g., vendor directory/lookup, approval routing engines, W-9/tax compliance checks, external ERP/KFS integrations). "
            "Do NOT output a generic textbook 3-tier template (Client/Gateway/Auth/DB).\n"
            "4. Output strict JSON with keys:\n"
            "   - 'diagram': string containing only Mermaid syntax starting with 'graph TD' or 'graph LR'\n"
            "   - 'decisions': list of objects with {'text': str, 'status': 'verified'|'inferred', 'requirement_ids': [str], 'confidence': float}\n"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Domain Requirements:\n{req_context}"}
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
            raise RuntimeError(f"ArchitectAgent failed to parse LLM JSON: {e}. Raw response snippet: {raw[:300]}")

        diagram = data.get("diagram", "")
        if not diagram or not any(diagram.strip().startswith(k) for k in ["graph", "flowchart", "subgraph"]):
            raise RuntimeError(f"ArchitectAgent failed to generate valid Mermaid diagram syntax. Raw diagram snippet: {diagram[:200]}")

        decisions: List[ArchitectureDecision] = []
        claims: List[Claim] = []

        for d in data.get("decisions", []):
            dec = ArchitectureDecision(
                text=d.get("text", ""),
                status=d.get("status", "inferred"),
                requirement_ids=d.get("requirement_ids", []),
                confidence=float(d.get("confidence", 0.8))
            )
            decisions.append(dec)

            # Map requirement citations
            req_cits = []
            for rid in dec.requirement_ids:
                matching = [r for r in requirements if r.id == rid]
                if matching:
                    req_cits.extend(matching[0].citations)

            claims.append(Claim(
                text=dec.text,
                status=dec.status,
                citations=req_cits,
                confidence=dec.confidence
            ))

        return ArchitectOutput(
            diagram=diagram,
            decisions=decisions,
            claims=claims
        )
