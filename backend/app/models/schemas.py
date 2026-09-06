from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from uuid import UUID, uuid4

# Non-negotiable claim shape (CLAUDE.md §6)
# Every agent's output must contain claims: list[Claim]
class Claim(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str
    status: Literal["verified", "inferred", "unsupported"] = "unsupported"
    citations: List[str] = Field(default_factory=list) # source chunk IDs
    confidence: float = 0.0
    explanation: Optional[str] = None

class Contradiction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    description: str
    source_chunk_ids: List[str] = Field(default_factory=list)

class SourceChunk(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    source_document_id: str
    workspace_id: str
    chunk_index: int
    text: str
    embedding: Optional[List[float]] = None

class SourceDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    workspace_id: str
    filename: str
    raw_text: str
    source_type: Literal["document", "voice_transcript", "screenshot_ocr", "free_text"]
    uploaded_at: Optional[str] = None

class Workspace(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    created_at: Optional[str] = None

# Discovery Agent Output
class DiscoveryOutput(BaseModel):
    summary: str
    identified_domains: List[str] = Field(default_factory=list)
    key_actors: List[str] = Field(default_factory=list)
    extracted_notes: List[str] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# Analyst Agent Output (BUILD_BRIEF.md §4.4)
class AnalystOutput(BaseModel):
    requirements: List[Claim] = Field(default_factory=list)
    open_questions: List[str] = Field(default_factory=list)
    contradictions: List[Contradiction] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# Architect Agent Output
class ArchitectureDecision(BaseModel):
    text: str
    status: Literal["verified", "inferred", "unsupported"] = "inferred"
    requirement_ids: List[str] = Field(default_factory=list)
    confidence: float = 0.8

class ArchitectOutput(BaseModel):
    diagram: str # Mermaid string
    decisions: List[ArchitectureDecision] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# UX Agent Output (Wireframes)
class WireframeElement(BaseModel):
    id: str
    type: str # button, input, table, card, modal
    label: str
    description: Optional[str] = None
    requirement_ids: List[str] = Field(default_factory=list)

class WireframeScreen(BaseModel):
    screen_id: str
    title: str
    description: str
    elements: List[WireframeElement] = Field(default_factory=list)

class UXOutput(BaseModel):
    screens: List[WireframeScreen] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# Data Agent Output (ERD + API)
class EREntity(BaseModel):
    name: str
    attributes: List[Dict[str, str]] = Field(default_factory=list) # e.g. [{"name": "id", "type": "uuid"}]

class APIEndpoint(BaseModel):
    method: Literal["GET", "POST", "PUT", "DELETE", "PATCH"]
    path: str
    summary: str
    requirement_ids: List[str] = Field(default_factory=list)

class DataOutput(BaseModel):
    erd_mermaid: str # Mermaid erDiagram
    entities: List[EREntity] = Field(default_factory=list)
    endpoints: List[APIEndpoint] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# Estimator Agent Output
class EstimateRange(BaseModel):
    optimistic_weeks: float
    realistic_weeks: float
    pessimistic_weeks: float
    cost_estimate_usd: str
    calibrated_reference: str

class EstimatorOutput(BaseModel):
    estimate: EstimateRange
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    claims: List[Claim] = Field(default_factory=list)

# Verifier Agent Output (BUILD_BRIEF.md §4.4)
class VerifierVerdict(BaseModel):
    claim_id: str
    verdict: Literal["verified", "unsupported"]
    explanation: str
    confidence: float = 1.0

# Generation Pipeline Stage Event for SSE Trace Panel
class AgentTraceEvent(BaseModel):
    stage: str # "discovery" | "analyst" | "architect" | "ux" | "data" | "estimator" | "verifier"
    status: Literal["pending", "running", "done", "error"]
    message: str
    claims_count: int = 0
    verified_count: int = 0
    inferred_count: int = 0
    unsupported_count: int = 0
    data: Optional[Dict[str, Any]] = None
