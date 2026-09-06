import json
from typing import List
from app.llm_clients.router import call_llm
from app.models.schemas import DataOutput, EREntity, APIEndpoint, Claim

class DataAgent:
    """
    Data Agent: Generates Mermaid ER diagrams and REST API definitions.
    (BUILD_BRIEF.md §4.4, CLAUDE.md §2.5)
    """
    def run(self, requirements: List[Claim]) -> DataOutput:
        if not requirements:
            raise ValueError("Cannot generate data schemas without grounded business requirements.")

        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:16]])

        system_prompt = (
            "You are a Senior Data and API Architect. Given domain business requirements, design:\n"
            "1. A clean, valid Mermaid ER Diagram string (starting with 'erDiagram\\n') modeling the domain entities.\n"
            "2. Entity definitions with attributes and relationships reflecting the actual domain concepts in the requirements.\n"
            "3. 6 to 8 core REST API endpoints with HTTP method, path, and summary directly linked to requirement IDs.\n\n"
            "CRITICAL: Do NOT output generic USER/REQUEST/RESPONSE entities. Model the actual domain entities, attributes, and "
            "relationships directly specified or implied by the requirements (e.g., VENDOR, VENDOR_ADDRESS, TAX_PROFILE, "
            "PURCHASE_ORDER, APPROVAL_RECORD, CONTRACT).\n"
            "CRITICAL: Output ONLY valid raw JSON. Do NOT write any reasoning, thinking, preambles, or explanations before or after the JSON.\n\n"
            "Return strict JSON with keys:\n"
            "- 'erd_mermaid': string containing valid Mermaid syntax starting with 'erDiagram\\n'\n"
            "- 'entities': list of {'name': str, 'attributes': [{'name': str, 'type': str}]}\n"
            "- 'endpoints': list of {'method': 'GET'|'POST'|'PUT'|'DELETE', 'path': str, 'summary': str, 'requirement_ids': [str]}\n"
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
            raise RuntimeError(f"DataAgent failed to parse LLM JSON: {e}. Raw response snippet: {raw[:300]}")

        erd_mermaid = data.get("erd_mermaid", "")
        if not erd_mermaid or not erd_mermaid.strip().startswith("erDiagram"):
            raise RuntimeError(f"DataAgent failed to generate valid Mermaid erDiagram syntax. Raw snippet: {erd_mermaid[:200]}")

        entities: List[EREntity] = []
        for ent in data.get("entities", []):
            entities.append(EREntity(
                name=ent.get("name", "ENTITY"),
                attributes=ent.get("attributes", [])
            ))

        endpoints: List[APIEndpoint] = []
        claims: List[Claim] = []

        for ep in data.get("endpoints", []):
            req_ids = ep.get("requirement_ids", [])
            method = ep.get("method", "GET").upper()
            if method not in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                method = "GET"

            endpoints.append(APIEndpoint(
                method=method,
                path=ep.get("path", "/api/resource"),
                summary=ep.get("summary", "Resource action"),
                requirement_ids=req_ids
            ))

            matched_cits = []
            for rid in req_ids:
                matched = [r for r in requirements if r.id == rid]
                if matched:
                    matched_cits.extend(matched[0].citations)

            claims.append(Claim(
                text=f"API Endpoint {method} {ep.get('path')}: {ep.get('summary')}",
                status="verified" if matched_cits else "inferred",
                citations=matched_cits,
                confidence=0.85
            ))

        return DataOutput(
            erd_mermaid=erd_mermaid,
            entities=entities,
            endpoints=endpoints,
            claims=claims
        )
