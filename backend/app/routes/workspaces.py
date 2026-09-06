from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel

from app.db.client import db_client
from app.models.schemas import Workspace, Claim, Contradiction
from app.llm_clients.sarvam_client import sarvam_client
from app.auth import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/workspaces", tags=["Workspaces & Artifacts"])

def check_workspace_access(workspace_id: str, current_user: AuthenticatedUser) -> Workspace:
    ws = db_client.get_workspace(workspace_id, current_user.id)
    if not ws:
        raise HTTPException(
            status_code=404,
            detail=f"Workspace '{workspace_id}' not found or you do not have permission to access it."
        )
    return ws

class CreateWorkspaceRequest(BaseModel):
    name: str

class ExportRequest(BaseModel):
    human_confirmed: bool = False # CLAUDE.md §2.4 invariant: nothing auto-publishes

class TranslateRequest(BaseModel):
    text: str
    target_language_code: str = "hi-IN" # e.g. hi-IN, gu-IN, ta-IN, mr-IN, etc.

@router.post("", response_model=Workspace)
async def create_workspace(
    req: CreateWorkspaceRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return db_client.create_workspace(req.name, current_user.id)

@router.get("", response_model=List[Workspace])
async def list_workspaces(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return db_client.list_workspaces(current_user.id)

@router.get("/{workspace_id}", response_model=Workspace)
async def get_workspace(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return check_workspace_access(workspace_id, current_user)

@router.get("/{workspace_id}/requirements", response_model=List[Claim])
async def get_requirements(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    check_workspace_access(workspace_id, current_user)
    return db_client.get_requirements(workspace_id)

@router.get("/{workspace_id}/contradictions", response_model=List[Contradiction])
async def get_contradictions(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    check_workspace_access(workspace_id, current_user)
    return db_client.get_contradictions(workspace_id)

@router.get("/{workspace_id}/artifacts/{artifact_type}")
async def get_artifact(
    workspace_id: str,
    artifact_type: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    check_workspace_access(workspace_id, current_user)
    art = db_client.get_artifact(workspace_id, artifact_type)
    if not art:
        raise HTTPException(status_code=404, detail=f"Artifact '{artifact_type}' not found for this workspace")

    # PRODUCTION_HARDENING_BRIEF.md §6.5.3: Server-side classDef styling injection
    if artifact_type == "architecture" and isinstance(art.get("content"), dict):
        content_dict = dict(art["content"])
        diagram = content_dict.get("diagram", "")
        if diagram:
            from app.agents.diagram_styler import style_mermaid_diagram
            content_dict["diagram"] = style_mermaid_diagram(diagram, art.get("claims", []))
            art["content"] = content_dict

    return art

@router.get("/{workspace_id}/claims/summary")
async def get_claims_summary(
    workspace_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Returns the workspace-level breakdown of Verified, Inferred, and Unsupported claims
    for the Verifier Summary screen (BUILD_BRIEF.md §5.1 #9).
    """
    check_workspace_access(workspace_id, current_user)
    requirements = db_client.get_requirements(workspace_id)
    all_claims: List[Claim] = list(requirements)

    for art_type in ["architecture", "wireframe", "erd", "estimate"]:
        art = db_client.get_artifact(workspace_id, art_type)
        if art and "claims" in art:
            all_claims.extend(art["claims"])

    verified = [c for c in all_claims if c.status == "verified"]
    inferred = [c for c in all_claims if c.status == "inferred"]
    contested = [c for c in all_claims if c.status == "contested"]
    unsupported = [c for c in all_claims if c.status == "unsupported"]

    total = len(all_claims)
    grounded_rate = round((len(verified) / total * 100), 1) if total > 0 else 0.0

    return {
        "workspace_id": workspace_id,
        "total_claims": total,
        "verified_count": len(verified),
        "inferred_count": len(inferred),
        "contested_count": len(contested),
        "unsupported_count": len(unsupported),
        "grounded_rate_percent": grounded_rate,
        "claims": all_claims
    }

@router.post("/{workspace_id}/export")
async def export_workspace_blueprint(
    workspace_id: str,
    req: ExportRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Export blueprint as Markdown.
    Enforces CLAUDE.md §2.4 invariant: 'Nothing auto-publishes. Every export or final
    action requires an explicit human confirmation step.'
    """
    if not req.human_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Export requires explicit human confirmation (human_confirmed: true). Auto-publishing is prohibited."
        )

    ws = check_workspace_access(workspace_id, current_user)

    requirements = db_client.get_requirements(workspace_id)
    contradictions = db_client.get_contradictions(workspace_id)
    arch = db_client.get_artifact(workspace_id, "architecture")
    wireframes = db_client.get_artifact(workspace_id, "wireframe")
    erd = db_client.get_artifact(workspace_id, "erd")
    estimate = db_client.get_artifact(workspace_id, "estimate")

    all_claims: List[Claim] = list(requirements)
    for art in [arch, wireframes, erd, estimate]:
        if art and "claims" in art:
            all_claims.extend(art["claims"])

    verified_count = sum(1 for c in all_claims if c.status == "verified")
    inferred_count = sum(1 for c in all_claims if c.status == "inferred")
    contested_count = sum(1 for c in all_claims if c.status == "contested")
    unsupported_count = sum(1 for c in all_claims if c.status == "unsupported")
    total_claims = len(all_claims)
    total_citations = sum(len(c.citations) for c in all_claims)

    has_real_verification = total_claims > 0 and (verified_count > 0 or total_citations > 0)

    lines = [
        f"# GroundWork AI — Transformation Blueprint",
        f"**Workspace:** {ws.name}",
        f"**Generated:** {ws.created_at or 'Recently'}",
    ]

    if has_real_verification:
        grounded_pct = round((verified_count / total_claims * 100), 1) if total_claims > 0 else 0.0
        lines.append(
            f"**Verification Protocol:** Independently Audited via NVIDIA NIM Verifier "
            f"({grounded_pct}% Grounded | {verified_count} Verified, {inferred_count} Inferred, "
            f"{contested_count} Contested, {unsupported_count} Unsupported across {total_claims} claims "
            f"with {total_citations} source citations)"
        )
    else:
        lines.append(
            f"**Verification Protocol:** Unverified — No grounded source citations or verifier audit records found"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 1. Requirements & Evidence Grounding",
        ""
    ])

    for idx, r in enumerate(requirements, 1):
        status_tag = f"[{r.status.upper()}]"
        citations_str = f"(Citations: {', '.join(r.citations)})" if r.citations else "(No Citation)"
        lines.append(f"{idx}. {status_tag} {r.text} {citations_str}")
        if r.explanation:
            lines.append(f"   > Verifier Note: {r.explanation}")

    if contradictions:
        lines.append("")
        lines.append("### Surfaced Source Contradictions (Review Required)")
        for c in contradictions:
            lines.append(f"- **Contradiction:** {c.description} (Sources: {c.source_chunk_ids})")

    if arch:
        lines.append("")
        lines.append("## 2. Solution Architecture")
        lines.append("```mermaid")
        lines.append(arch.get("content", {}).get("diagram", ""))
        lines.append("```")

    if erd:
        lines.append("")
        lines.append("## 3. Data Model & ER Diagram")
        lines.append("```mermaid")
        lines.append(erd.get("content", {}).get("erd_mermaid", ""))
        lines.append("```")

    if estimate:
        est_data = estimate.get("content", {}).get("estimate", {})
        lines.append("")
        lines.append("## 4. Delivery Estimation & Roadmap")
        lines.append(f"- **Optimistic Timeline:** {est_data.get('optimistic_weeks', 'N/A')} weeks")
        lines.append(f"- **Realistic Timeline:** {est_data.get('realistic_weeks', 'N/A')} weeks")
        lines.append(f"- **Pessimistic Timeline:** {est_data.get('pessimistic_weeks', 'N/A')} weeks")
        lines.append(f"- **Estimated Budget:** {est_data.get('cost_estimate_usd', 'N/A')}")
        lines.append(f"- **Benchmark Calibration:** {est_data.get('calibrated_reference', 'N/A')}")

    content = "\n".join(lines)
    return {
        "workspace_id": workspace_id,
        "filename": f"GroundWork_Blueprint_{ws.name.replace(' ', '_')}.md",
        "markdown": content
    }

@router.post("/{workspace_id}/translate")
async def translate_content(
    workspace_id: str,
    req: TranslateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Sarvam AI Mayura Translation layer for Indic language output (BUILD_BRIEF.md §6).
    """
    check_workspace_access(workspace_id, current_user)
    translated = sarvam_client.translate(
        text=req.text,
        target_language_code=req.target_language_code
    )
    return {
        "original_text": req.text,
        "translated_text": translated,
        "target_language_code": req.target_language_code
    }
