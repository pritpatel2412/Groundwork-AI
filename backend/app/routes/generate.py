import asyncio
import json
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.db.client import db_client
from app.models.schemas import AgentTraceEvent, Claim
from app.agents.discovery import DiscoveryAgent
from app.agents.analyst import AnalystAgent
from app.agents.architect import ArchitectAgent
from app.agents.ux import UXAgent
from app.agents.data import DataAgent
from app.agents.estimator import EstimatorAgent
from app.agents.verifier import verifier_agent

router = APIRouter(prefix="/workspaces", tags=["Generation & Orchestration"])

discovery_agent = DiscoveryAgent()
analyst_agent = AnalystAgent()
architect_agent = ArchitectAgent()
ux_agent = UXAgent()
data_agent = DataAgent()
estimator_agent = EstimatorAgent()

def sse_event(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

async def orchestrate_workspace_pipeline(workspace_id: str) -> AsyncGenerator[str, None]:
    """
    Orchestration pipeline running agents in exact BUILD_BRIEF.md §4.5 order:
    1. Discovery -> Analyst (sequential)
    2. Architect, UX, Data (in parallel via asyncio.gather)
    3. Estimator
    4. Independent Verifier (highest priority) over all generated claims
    5. SSE streaming to Agent Trace Panel
    """
    ws = db_client.get_workspace(workspace_id)
    if not ws:
        yield sse_event("error", {"message": f"Workspace {workspace_id} not found."})
        return

    # Fetch ingested chunks
    chunks = db_client.get_chunks_by_workspace(workspace_id)

    if not chunks:
        yield sse_event("error", {"message": "No source documents ingested. Upload documents or paste text first."})
        return

    all_claims: list[Claim] = []

    # 1. STAGE 1: Discovery
    yield sse_event("trace", {
        "stage": "discovery",
        "status": "running",
        "message": f"Analyzing {len(chunks)} source chunks and structuring business domain context...",
        "claims_count": 0
    })
    await asyncio.sleep(0.5)

    discovery_out = discovery_agent.run(chunks)
    db_client.save_artifact(workspace_id, "discovery", discovery_out.model_dump(), discovery_out.claims)

    yield sse_event("trace", {
        "stage": "discovery",
        "status": "done",
        "message": f"Context structured: {len(discovery_out.identified_domains)} domains, {len(discovery_out.key_actors)} actors identified.",
        "claims_count": len(discovery_out.claims),
        "data": discovery_out.model_dump()
    })

    # 2. STAGE 2: Analyst (Cite-or-abstain contract enforcement)
    yield sse_event("trace", {
        "stage": "analyst",
        "status": "running",
        "message": "Extracting grounded requirements and checking for source contradictions...",
        "claims_count": 0
    })
    await asyncio.sleep(0.5)

    analyst_out = analyst_agent.run(chunks)
    db_client.save_requirements(workspace_id, analyst_out.requirements, analyst_out.contradictions)
    all_claims.extend(analyst_out.requirements)

    yield sse_event("trace", {
        "stage": "analyst",
        "status": "done",
        "message": f"Extracted {len(analyst_out.requirements)} requirements, {len(analyst_out.contradictions)} contradictions surfaced.",
        "claims_count": len(analyst_out.requirements),
        "data": {
            "requirements_count": len(analyst_out.requirements),
            "contradictions_count": len(analyst_out.contradictions),
            "open_questions_count": len(analyst_out.open_questions)
        }
    })

    # 3. STAGE 3: Parallel Generation (Architect, UX, Data)
    yield sse_event("trace", {
        "stage": "architect_ux_data",
        "status": "running",
        "message": "Synthesizing Architecture diagram, UI wireframes, and Data/ER models in parallel...",
        "claims_count": len(all_claims)
    })

    # Run in parallel using asyncio to_thread for non-blocking I/O
    arch_task = asyncio.to_thread(architect_agent.run, analyst_out.requirements)
    ux_task = asyncio.to_thread(ux_agent.run, analyst_out.requirements)
    data_task = asyncio.to_thread(data_agent.run, analyst_out.requirements)

    arch_out, ux_out, data_out = await asyncio.gather(arch_task, ux_task, data_task)

    db_client.save_artifact(workspace_id, "architecture", arch_out.model_dump(), arch_out.claims)
    db_client.save_artifact(workspace_id, "wireframe", ux_out.model_dump(), ux_out.claims)
    db_client.save_artifact(workspace_id, "erd", data_out.model_dump(), data_out.claims)

    all_claims.extend(arch_out.claims)
    all_claims.extend(ux_out.claims)
    all_claims.extend(data_out.claims)

    yield sse_event("trace", {
        "stage": "architect_ux_data",
        "status": "done",
        "message": "Architecture flowchart, 2 wireframe screens, and ERD models generated.",
        "claims_count": len(all_claims)
    })

    # 4. STAGE 4: Estimator
    yield sse_event("trace", {
        "stage": "estimator",
        "status": "running",
        "message": "Calibrating timeline and effort ranges against reference enterprise benchmarks...",
        "claims_count": len(all_claims)
    })
    await asyncio.sleep(0.3)

    estimator_out = estimator_agent.run(analyst_out.requirements, arch_out.claims)
    db_client.save_artifact(workspace_id, "estimate", estimator_out.model_dump(), estimator_out.claims)
    all_claims.extend(estimator_out.claims)

    yield sse_event("trace", {
        "stage": "estimator",
        "status": "done",
        "message": f"Estimated: {estimator_out.estimate.optimistic_weeks} - {estimator_out.estimate.pessimistic_weeks} weeks (Realistic: {estimator_out.estimate.realistic_weeks}w).",
        "claims_count": len(all_claims)
    })

    # 5. STAGE 5: Verifier (Independent verification of every claim)
    yield sse_event("trace", {
        "stage": "verifier",
        "status": "running",
        "message": f"Independently auditing {len(all_claims)} claims using secondary NVIDIA NIM Verifier...",
        "claims_count": len(all_claims)
    })

    # Verify all claims
    verified_results = await asyncio.to_thread(verifier_agent.verify_all, all_claims)

    verified_count = sum(1 for c in verified_results if c.status == "verified")
    inferred_count = sum(1 for c in verified_results if c.status == "inferred")
    unsupported_count = sum(1 for c in verified_results if c.status == "unsupported")

    yield sse_event("trace", {
        "stage": "verifier",
        "status": "done",
        "message": f"Verification complete: {verified_count} Verified, {inferred_count} Inferred, {unsupported_count} Unsupported.",
        "claims_count": len(all_claims),
        "verified_count": verified_count,
        "inferred_count": inferred_count,
        "unsupported_count": unsupported_count
    })

    # Pipeline Complete Event
    yield sse_event("complete", {
        "workspace_id": workspace_id,
        "total_claims": len(all_claims),
        "verified": verified_count,
        "inferred": inferred_count,
        "unsupported": unsupported_count
    })

@router.post("/{workspace_id}/generate")
async def trigger_generation_stream(workspace_id: str):
    """
    Triggers end-to-end multi-agent pipeline and streams Server-Sent Events (SSE)
    to power the Agent Trace Panel (BUILD_BRIEF.md §4.5, §5.3).
    """
    return StreamingResponse(
        orchestrate_workspace_pipeline(workspace_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
