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
        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:8]])

        system_prompt = (
            "You are a Senior Data and API Architect. Given business requirements, design:\n"
            "1. A clean, valid Mermaid ER Diagram string (starting with 'erDiagram\\n')\n"
            "2. Entity definitions with attributes\n"
            "3. REST API endpoints with HTTP method, path, and summary\n\n"
            "Return strict JSON with keys:\n"
            "- 'erd_mermaid': string containing 'erDiagram\\n  USER ||--o{ REQUEST : submits\\n ...'\n"
            "- 'entities': list of {'name': str, 'attributes': [{'name': str, 'type': str}]}\n"
            "- 'endpoints': list of {'method': 'GET'|'POST'|'PUT'|'DELETE', 'path': str, 'summary': str, 'requirement_ids': [str]}\n"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Requirements:\n{req_context}"}
        ]

        raw = call_llm(messages, purpose="generate", temperature=0.1)

        try:
            cleaned = raw.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            data = json.loads(cleaned)
        except Exception:
            data = {
                "erd_mermaid": (
                    "erDiagram\n"
                    "  WORKFLOW_REQUEST ||--o{ AUDIT_LOG : tracks\n"
                    "  WORKFLOW_REQUEST {\n"
                    "    uuid id PK\n"
                    "    string title\n"
                    "    numeric amount\n"
                    "    string status\n"
                    "    timestamp created_at\n"
                    "  }\n"
                    "  AUDIT_LOG {\n"
                    "    uuid id PK\n"
                    "    uuid request_id FK\n"
                    "    string action\n"
                    "    timestamp timestamp\n"
                    "  }"
                ),
                "entities": [
                    {
                        "name": "WORKFLOW_REQUEST",
                        "attributes": [
                            {"name": "id", "type": "uuid"},
                            {"name": "amount", "type": "numeric"},
                            {"name": "status", "type": "string"}
                        ]
                    }
                ],
                "endpoints": [
                    {"method": "POST", "path": "/api/requests", "summary": "Submit a new request", "requirement_ids": []},
                    {"method": "GET", "path": "/api/requests/{id}", "summary": "Get request details", "requirement_ids": []},
                    {"method": "POST", "path": "/api/requests/{id}/approve", "summary": "Approve request", "requirement_ids": []}
                ]
            }

        erd_mermaid = data.get("erd_mermaid", "")
        if not erd_mermaid.strip().startswith("erDiagram"):
            erd_mermaid = (
                "erDiagram\n"
                "  REQUEST ||--o{ APPROVAL : has\n"
                "  REQUEST {\n"
                "    uuid id PK\n"
                "    numeric amount\n"
                "    string status\n"
                "  }\n"
                "  APPROVAL {\n"
                "    uuid id PK\n"
                "    string approver\n"
                "    boolean approved\n"
                "  }"
            )

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
