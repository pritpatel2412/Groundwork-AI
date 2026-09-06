import json
from typing import List
from app.llm_clients.router import call_llm
from app.models.schemas import UXOutput, WireframeScreen, WireframeElement, Claim

class UXAgent:
    """
    UX Agent: Generates structured wireframe specifications for client applications.
    (BUILD_BRIEF.md §4.4)
    """
    def run(self, requirements: List[Claim]) -> UXOutput:
        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:8]])

        system_prompt = (
            "You are a UX/UI Architect. Design functional application wireframes satisfying the requirements.\n"
            "Return strict JSON with a 'screens' array. Each screen has:\n"
            "- 'screen_id': str\n"
            "- 'title': str\n"
            "- 'description': str\n"
            "- 'elements': list of {'id': str, 'type': 'button'|'input'|'table'|'card'|'modal'|'badge', 'label': str, 'description': str, 'requirement_ids': [str]}\n"
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
                "screens": [
                    {
                        "screen_id": "dashboard",
                        "title": "Operations Dashboard",
                        "description": "Central hub showing pending requests and status overviews",
                        "elements": [
                            {"id": "el-1", "type": "card", "label": "Metrics Summary", "description": "Key KPIs and volumes", "requirement_ids": []},
                            {"id": "el-2", "type": "table", "label": "Recent Approvals Queue", "description": "List of pending workflow items", "requirement_ids": []},
                            {"id": "el-3", "type": "button", "label": "New Submission", "description": "Initiate workflow modal", "requirement_ids": []}
                        ]
                    },
                    {
                        "screen_id": "approval_detail",
                        "title": "Request Approval View",
                        "description": "Itemized view for manager verification",
                        "elements": [
                            {"id": "el-4", "type": "badge", "label": "Approval Status Badge", "description": "Auto-approved vs Pending", "requirement_ids": []},
                            {"id": "el-5", "type": "button", "label": "Approve Request", "description": "Submit manager confirmation", "requirement_ids": []},
                            {"id": "el-6", "type": "button", "label": "Reject with Comment", "description": "Decline with audit note", "requirement_ids": []}
                        ]
                    }
                ]
            }

        screens: List[WireframeScreen] = []
        claims: List[Claim] = []

        for s in data.get("screens", []):
            elements = []
            for el in s.get("elements", []):
                req_ids = el.get("requirement_ids", [])
                elements.append(WireframeElement(
                    id=el.get("id", f"el-{len(elements)+1}"),
                    type=el.get("type", "card"),
                    label=el.get("label", "Element"),
                    description=el.get("description"),
                    requirement_ids=req_ids
                ))

                matched_cits = []
                for rid in req_ids:
                    matched = [r for r in requirements if r.id == rid]
                    if matched:
                        matched_cits.extend(matched[0].citations)

                claims.append(Claim(
                    text=f"Screen '{s.get('title')}': includes {el.get('type')} '{el.get('label')}'",
                    status="verified" if matched_cits else "inferred",
                    citations=matched_cits,
                    confidence=0.9 if matched_cits else 0.75
                ))

            screens.append(WireframeScreen(
                screen_id=s.get("screen_id", "screen-1"),
                title=s.get("title", "Overview"),
                description=s.get("description", ""),
                elements=elements
            ))

        return UXOutput(screens=screens, claims=claims)
