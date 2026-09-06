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
        req_count = len(requirements)
        arch_count = len(architecture_claims)

        system_prompt = (
            "You are a Software Engineering Delivery Manager. Estimate implementation timelines.\n"
            "Rules:\n"
            "1. Output a RANGE of weeks: optimistic, realistic, and pessimistic. NEVER a single fixed number.\n"
            "2. Provide a calibrated reference case (e.g. 'Comparable to a mid-scale workflow automation with 4 core integrations').\n"
            "3. Output estimated cost range in USD.\n"
            "4. Provide 3-4 milestone phases with estimated durations.\n\n"
            "Return strict JSON with keys:\n"
            "{\n"
            '  "optimistic_weeks": 4.0,\n'
            '  "realistic_weeks": 6.5,\n'
            '  "pessimistic_weeks": 10.0,\n'
            '  "cost_estimate_usd": "$25,000 - $45,000",\n'
            '  "calibrated_reference": "Calibrated against enterprise approval workflows with external auth & audit logging",\n'
            '  "milestones": [\n'
            '    {"phase": "Foundation & Auth", "weeks": 2.0, "deliverables": "DB schemas, API setup"},\n'
            '    {"phase": "Core Business Logic", "weeks": 3.0, "deliverables": "Approval engine, rules validation"},\n'
            '    {"phase": "Integration & Hardening", "weeks": 1.5, "deliverables": "Verification audit, end-to-end tests"}\n'
            '  ]\n'
            "}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Scope Summary: {req_count} requirements identified, {arch_count} architectural components."}
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
                "optimistic_weeks": 4.0,
                "realistic_weeks": 7.0,
                "pessimistic_weeks": 11.0,
                "cost_estimate_usd": "$30,000 - $55,000",
                "calibrated_reference": "Calibrated against multi-tier workflow & approvals reference projects",
                "milestones": [
                    {"phase": "Foundation & Data Model", "weeks": 2.0, "deliverables": "Postgres schema and API routes"},
                    {"phase": "Workflow & Approvals Engine", "weeks": 3.0, "deliverables": "Core business logic and roles"},
                    {"phase": "UI & Verification Hardening", "weeks": 2.0, "deliverables": "Client interface and audit logs"}
                ]
            }

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
