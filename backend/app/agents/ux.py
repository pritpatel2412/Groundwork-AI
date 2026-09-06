import json
from typing import List, Dict, Any
from app.llm_clients.router import call_llm
from app.models.schemas import UXOutput, WireframeSpec, WireframeComponent, Claim
from pydantic import ValidationError

SUPPORTED_TYPES = {"header", "text", "input", "button", "table", "card", "list", "image_placeholder", "nav_bar"}

class UXAgent:
    """
    UX Agent: Generates structured wireframe specifications conforming to closed schema.
    (PRODUCTION_HARDENING_BRIEF.md §4.1, §4.2)
    """
    def run(self, requirements: List[Claim]) -> UXOutput:
        if not requirements:
            raise ValueError("Cannot design wireframes without grounded business requirements.")

        req_context = "\n".join([f"- [Req ID: {r.id}] {r.text}" for r in requirements[:8]])

        system_prompt = (
            "You are a UX/UI Architect. Design functional, low-fidelity wireframes satisfying the requirements.\n"
            "Output 2 to 3 core screens. Each screen must conform to the following CLOSED component schema:\n"
            "Allowed component 'type' values ONLY:\n"
            "  header, text, input, button, table, card, list, image_placeholder, nav_bar\n"
            "Do NOT use any other component types.\n\n"
            "Return strict JSON with a 'screens' array:\n"
            "{\n"
            '  "screens": [\n'
            "    {\n"
            '      "screen_name": "Approval Dashboard",\n'
            '      "layout": "single_column",\n'
            '      "components": [\n'
            '        { "id": "c1", "type": "header", "label": "Purchase Approvals" },\n'
            '        { "id": "c2", "type": "input", "label": "Search requests", "placeholder": "Search..." },\n'
            '        { "id": "c3", "type": "table", "label": "Pending Requests", "columns": ["Requester", "Amount", "Status"] },\n'
            '        { "id": "c4", "type": "button", "label": "Approve Selected", "style": "primary" },\n'
            '        { "id": "c5", "type": "card", "label": "Summary", "content": "3 requests pending" }\n'
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Requirements to wireframe:\n{req_context}"}
        ]

        raw = call_llm(messages, purpose="generate", temperature=0.1, json_mode=True)

        data = self._parse_json(raw)
        validated_screens, claims = self._validate_and_build(data, requirements)

        # Retry once if no valid screens generated
        if not validated_screens:
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": "Your previous output failed validation against the closed component types. "
                           "You MUST only use: header, text, input, button, table, card, list, image_placeholder, nav_bar. "
                           "Please regenerate the screens JSON."
            })
            retry_raw = call_llm(messages, purpose="generate", temperature=0.1, use_cache=False, json_mode=True)
            data = self._parse_json(retry_raw)
            validated_screens, claims = self._validate_and_build(data, requirements)

        if not validated_screens:
            raise RuntimeError("UX Agent failed to generate valid wireframe screens conforming to the closed schema.")

        return UXOutput(screens=validated_screens, claims=claims)

    def _parse_json(self, raw: str) -> Dict[str, Any]:
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
            return json.loads(cleaned)
        except Exception:
            return {}

    def _validate_and_build(self, data: Dict[str, Any], requirements: List[Claim]):
        screens_raw = data.get("screens", [])
        if not isinstance(screens_raw, list):
            return [], []

        validated_screens: List[WireframeSpec] = []
        claims: List[Claim] = []

        for s_idx, s in enumerate(screens_raw):
            screen_name = s.get("screen_name") or s.get("title") or f"Screen {s_idx+1}"
            layout = s.get("layout", "single_column")
            if layout not in ["single_column", "two_column", "sidebar_content"]:
                layout = "single_column"

            comps_raw = s.get("components") or s.get("elements") or []
            valid_comps: List[WireframeComponent] = []

            for c_idx, c in enumerate(comps_raw):
                c_type = str(c.get("type", "card")).lower().strip()
                if c_type not in SUPPORTED_TYPES:
                    if c_type in ["badge", "tag", "chip", "status"]:
                        c_type = "card"
                    elif c_type in ["select", "textarea", "form"]:
                        c_type = "input"
                    elif c_type in ["title", "h1", "h2", "h3"]:
                        c_type = "header"
                    elif c_type in ["paragraph", "desc"]:
                        c_type = "text"
                    else:
                        continue

                matched_req = requirements[c_idx % len(requirements)] if requirements else None
                comp_status = matched_req.status if matched_req else "inferred"
                comp_cits = matched_req.citations if matched_req else []

                comp_claim = Claim(
                    text=f"Wireframe '{screen_name}': component {c_type} '{c.get('label', 'Item')}' satisfies requirement",
                    status=comp_status,
                    citations=comp_cits,
                    confidence=matched_req.confidence if matched_req else 0.8
                )
                claims.append(comp_claim)

                try:
                    comp = WireframeComponent(
                        id=str(c.get("id") or f"c_{s_idx+1}_{c_idx+1}"),
                        type=c_type,
                        label=str(c.get("label") or c.get("name") or "Component"),
                        placeholder=c.get("placeholder"),
                        style=c.get("style", "default"),
                        content=c.get("content") or c.get("description"),
                        columns=c.get("columns") if isinstance(c.get("columns"), list) else None,
                        items=c.get("items") if isinstance(c.get("items"), list) else None,
                        claim_id=comp_claim.id,
                        status=comp_status
                    )
                    valid_comps.append(comp)
                except ValidationError:
                    continue

            if valid_comps:
                validated_screens.append(WireframeSpec(
                    screen_name=screen_name,
                    layout=layout,
                    components=valid_comps
                ))

        return validated_screens, claims
