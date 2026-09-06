import asyncio
import json
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, Depends
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
from app.auth import get_current_user_with_query_fallback, AuthenticatedUser

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

    try:
        analyst_out = analyst_agent.run(chunks)
    except Exception as e:
        error_msg = f"Analyst Agent error: {str(e)}"
        yield sse_event("trace", {
            "stage": "analyst",
            "status": "error",
            "message": error_msg,
            "claims_count": 0
        })
        yield sse_event("error", {"stage": "analyst", "message": error_msg})
        return

    # Invariant 7 Enforcement Gate (CLAUDE.md §2.7):
    # If Analyst produces zero requirements or zero citations, halt pipeline immediately.
    total_citations = sum(len(r.citations) for r in analyst_out.requirements)
    if len(analyst_out.requirements) == 0 or total_citations == 0:
        error_msg = "Could not extract grounded requirements from your source material — try uploading more detail, or a different format."
        yield sse_event("trace", {
            "stage": "analyst",
            "status": "error",
            "message": error_msg,
            "claims_count": 0,
            "data": {
                "error": error_msg,
                "requirements_count": len(analyst_out.requirements),
                "citations_count": total_citations
            }
        })
        yield sse_event("error", {
            "stage": "analyst",
            "message": error_msg
        })
        return

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

    # 3. STAGE 3: Solution Architect
    yield sse_event("trace", {
        "stage": "architect",
        "status": "running",
        "message": "Synthesizing target system architecture and Mermaid topology...",
        "claims_count": len(all_claims)
    })
    try:
        arch_out = await asyncio.to_thread(architect_agent.run, analyst_out.requirements)
    except Exception as e:
        error_msg = f"Architect Agent failed: {str(e)}"
        yield sse_event("trace", {"stage": "architect", "status": "error", "message": error_msg, "claims_count": len(all_claims)})
        yield sse_event("error", {"stage": "architect", "message": error_msg})
        return

    db_client.save_artifact(workspace_id, "architecture", arch_out.model_dump(), arch_out.claims)
    all_claims.extend(arch_out.claims)
    yield sse_event("trace", {
        "stage": "architect",
        "status": "done",
        "message": f"Architecture topology mapped with {len(arch_out.decisions)} key architectural decisions.",
        "claims_count": len(all_claims),
        "data": {"decisions_count": len(arch_out.decisions)}
    })

    # 4. STAGE 4: UX Designer
    yield sse_event("trace", {
        "stage": "ux",
        "status": "running",
        "message": "Designing component wireframes and interactive layouts under closed schema...",
        "claims_count": len(all_claims)
    })
    try:
        ux_out = await asyncio.to_thread(ux_agent.run, analyst_out.requirements)
    except Exception as e:
        error_msg = f"UX Agent failed: {str(e)}"
        yield sse_event("trace", {"stage": "ux", "status": "error", "message": error_msg, "claims_count": len(all_claims)})
        yield sse_event("error", {"stage": "ux", "message": error_msg})
        return

    db_client.save_artifact(workspace_id, "wireframe", ux_out.model_dump(), ux_out.claims)
    all_claims.extend(ux_out.claims)
    yield sse_event("trace", {
        "stage": "ux",
        "status": "done",
        "message": f"Generated {len(ux_out.screens)} structured wireframe screens.",
        "claims_count": len(all_claims),
        "data": {"screens_count": len(ux_out.screens)}
    })

    # 5. STAGE 5: Data Engineer
    yield sse_event("trace", {
        "stage": "data",
        "status": "running",
        "message": "Specifying entity-relationship data schemas and storage engines...",
        "claims_count": len(all_claims)
    })
    try:
        data_out = await asyncio.to_thread(data_agent.run, analyst_out.requirements)
    except Exception as e:
        error_msg = f"Data Agent failed: {str(e)}"
        yield sse_event("trace", {"stage": "data", "status": "error", "message": error_msg, "claims_count": len(all_claims)})
        yield sse_event("error", {"stage": "data", "message": error_msg})
        return

    db_client.save_artifact(workspace_id, "erd", data_out.model_dump(), data_out.claims)
    all_claims.extend(data_out.claims)
    yield sse_event("trace", {
        "stage": "data",
        "status": "done",
        "message": f"Engineered {len(data_out.entities)} relational entities and relationships.",
        "claims_count": len(all_claims),
        "data": {"entities_count": len(data_out.entities)}
    })

    # 6. STAGE 6: Estimator
    yield sse_event("trace", {
        "stage": "estimator",
        "status": "running",
        "message": "Calibrating timeline and effort ranges against reference enterprise benchmarks...",
        "claims_count": len(all_claims)
    })
    await asyncio.sleep(0.3)

    try:
        estimator_out = estimator_agent.run(analyst_out.requirements, arch_out.claims)
    except Exception as e:
        error_msg = f"Estimator Agent failed: {str(e)}"
        yield sse_event("trace", {"stage": "estimator", "status": "error", "message": error_msg, "claims_count": len(all_claims)})
        yield sse_event("error", {"stage": "estimator", "message": error_msg})
        return

    db_client.save_artifact(workspace_id, "estimate", estimator_out.model_dump(), estimator_out.claims)
    all_claims.extend(estimator_out.claims)

    yield sse_event("trace", {
        "stage": "estimator",
        "status": "done",
        "message": f"Estimated: {estimator_out.estimate.optimistic_weeks} - {estimator_out.estimate.pessimistic_weeks} weeks (Realistic: {estimator_out.estimate.realistic_weeks}w).",
        "claims_count": len(all_claims)
    })

    # 7. STAGE 7: Dual-Model Consensus Verifier
    yield sse_event("trace", {
        "stage": "verifier",
        "status": "running",
        "message": f"Auditing {len(all_claims)} claims via independent NVIDIA NIM consensus (Nemotron & Llama)...",
        "claims_count": len(all_claims)
    })

    # Verify all claims
    verified_results = await asyncio.to_thread(verifier_agent.verify_all, all_claims)

    verified_count = sum(1 for c in verified_results if c.status == "verified")
    inferred_count = sum(1 for c in verified_results if c.status == "inferred")
    contested_count = sum(1 for c in verified_results if c.status == "contested")
    unsupported_count = sum(1 for c in verified_results if c.status == "unsupported")

    yield sse_event("trace", {
        "stage": "verifier",
        "status": "done",
        "message": f"Consensus complete: {verified_count} Verified, {inferred_count} Inferred, {contested_count} Contested, {unsupported_count} Unsupported.",
        "claims_count": len(all_claims),
        "verified_count": verified_count,
        "inferred_count": inferred_count,
        "contested_count": contested_count,
        "unsupported_count": unsupported_count
    })

    # Pipeline Complete Event
    yield sse_event("complete", {
        "workspace_id": workspace_id,
        "total_claims": len(all_claims),
        "verified": verified_count,
        "inferred": inferred_count,
        "contested": contested_count,
        "unsupported": unsupported_count
    })

@router.post("/{workspace_id}/generate")
@router.get("/{workspace_id}/generate")
async def trigger_generation_stream(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user_with_query_fallback)
):
    """
    Triggers end-to-end multi-agent pipeline and streams Server-Sent Events (SSE)
    to power the Agent Trace Panel (BUILD_BRIEF.md §4.5, §5.3).
    Gated by authentication and workspace ownership check.
    """
    ws = db_client.get_workspace(workspace_id, current_user.id)
    if not ws:
        raise HTTPException(
            status_code=404,
            detail=f"Workspace '{workspace_id}' not found or you do not have permission to access it."
        )

    return StreamingResponse(
        orchestrate_workspace_pipeline(workspace_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
