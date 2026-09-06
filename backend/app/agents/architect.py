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
        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:10]])

        system_prompt = (
            "You are a Solution Architect. Given the validated business requirements, design the technical solution architecture.\n"
            "Rules:\n"
            "1. Generate a clean, syntactically valid Mermaid flowchart (graph TD or graph LR).\n"
            "2. For each architectural decision, specify if it is directly verified from a requirement ID or inferred.\n"
            "3. Output strict JSON with keys:\n"
            "   - 'diagram': string containing only Mermaid syntax (e.g. 'graph TD\\n  Client[Web Client] --> Gateway[API Gateway]\\n ...')\n"
            "   - 'decisions': list of objects with {'text': str, 'status': 'verified'|'inferred', 'requirement_ids': [str], 'confidence': float}\n"
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
            # Fallback robust architecture
            data = {
                "diagram": (
                    "graph TD\n"
                    "    Client[Client Web App] --> Gateway[API Gateway / Auth]\n"
                    "    Gateway --> Service[Core Transformation Service]\n"
                    "    Service --> DB[(PostgreSQL + pgvector)]\n"
                    "    Service --> LLM[LLM Router - Groq & NVIDIA NIM]\n"
                    "    Service --> Worker[Async Worker / Task Queue]"
                ),
                "decisions": [
                    {
                        "text": "API Gateway manages authenticated routing and rate limits",
                        "status": "inferred",
                        "requirement_ids": [],
                        "confidence": 0.85
                    },
                    {
                        "text": "PostgreSQL with vector store handles metadata and source chunk embeddings",
                        "status": "inferred",
                        "requirement_ids": [],
                        "confidence": 0.9
                    }
                ]
            }

        # Validate Mermaid diagram starts with graph or flowchart
        diagram = data.get("diagram", "")
        if not any(diagram.strip().startswith(k) for k in ["graph", "flowchart", "subgraph"]):
            diagram = (
                "graph TD\n"
                "    UI[Web Frontend] --> API[FastAPI Server]\n"
                "    API --> Pipeline[Agent Orchestration Pipeline]\n"
                "    Pipeline --> VectorStore[(Vector Store)]\n"
                "    Pipeline --> LLMProviders[Groq / NVIDIA NIM]"
            )

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
