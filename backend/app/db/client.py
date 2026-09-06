import os
import json
import math
from typing import List, Optional, Dict, Any
from uuid import uuid4
from dotenv import load_dotenv

from app.models.schemas import (
    Workspace, SourceDocument, SourceChunk, Claim, Contradiction
)

# Load environment
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

LOCAL_DB_FILE = os.path.join(os.path.dirname(__file__), ".local_db.json")

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class DBClient:
    def __init__(self):
        self.supabase = None
        self._workspaces: Dict[str, Workspace] = {}
        self._documents: Dict[str, SourceDocument] = {}
        self._chunks: Dict[str, SourceChunk] = {}
        self._requirements: Dict[str, List[Claim]] = {}
        self._contradictions: Dict[str, List[Contradiction]] = {}
        self._artifacts: Dict[str, Dict[str, Any]] = {}

        if SUPABASE_URL and SUPABASE_KEY:
            try:
                from supabase import create_client
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            except Exception as e:
                print(f"[DBClient] Supabase client init notice: {e}")

        self._load_local_db()

    def _load_local_db(self):
        if os.path.exists(LOCAL_DB_FILE):
            try:
                with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for k, v in data.get("workspaces", {}).items():
                    self._workspaces[k] = Workspace(**v)
                for k, v in data.get("documents", {}).items():
                    self._documents[k] = SourceDocument(**v)
                for k, v in data.get("chunks", {}).items():
                    self._chunks[k] = SourceChunk(**v)
                for k, v in data.get("requirements", {}).items():
                    self._requirements[k] = [Claim(**item) for item in v]
                for k, v in data.get("contradictions", {}).items():
                    self._contradictions[k] = [Contradiction(**item) for item in v]
                self._artifacts = data.get("artifacts", {})
            except Exception as e:
                print(f"[DBClient] Error reading local db: {e}")

    def _save_local_db(self):
        try:
            data = {
                "workspaces": {k: v.model_dump() for k, v in self._workspaces.items()},
                "documents": {k: v.model_dump() for k, v in self._documents.items()},
                "chunks": {k: v.model_dump() for k, v in self._chunks.items()},
                "requirements": {k: [item.model_dump() for item in v] for k, v in self._requirements.items()},
                "contradictions": {k: [item.model_dump() for item in v] for k, v in self._contradictions.items()},
                "artifacts": self._artifacts
            }
            with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f)
        except Exception as e:
            print(f"[DBClient] Error saving local db: {e}")

    # Workspaces
    def create_workspace(self, name: str) -> Workspace:
        self._load_local_db()
        ws = Workspace(name=name)
        if self.supabase:
            try:
                res = self.supabase.table("workspaces").insert({"id": ws.id, "name": ws.name}).execute()
                if res.data:
                    ws = Workspace(**res.data[0])
            except Exception:
                pass
        self._workspaces[ws.id] = ws
        self._save_local_db()
        return ws

    def list_workspaces(self) -> List[Workspace]:
        self._load_local_db()
        if self.supabase:
            try:
                res = self.supabase.table("workspaces").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return [Workspace(**row) for row in res.data]
            except Exception:
                pass
        return list(self._workspaces.values())

    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        self._load_local_db()
        if self.supabase:
            try:
                res = self.supabase.table("workspaces").select("*").eq("id", workspace_id).execute()
                if res.data:
                    return Workspace(**res.data[0])
            except Exception:
                pass
        return self._workspaces.get(workspace_id)

    # Documents
    def save_source_document(self, workspace_id: str, filename: str, raw_text: str, source_type: str) -> SourceDocument:
        self._load_local_db()
        doc = SourceDocument(
            workspace_id=workspace_id,
            filename=filename,
            raw_text=raw_text,
            source_type=source_type # type: ignore
        )
        if self.supabase:
            try:
                res = self.supabase.table("source_documents").insert({
                    "id": doc.id,
                    "workspace_id": doc.workspace_id,
                    "filename": doc.filename,
                    "raw_text": doc.raw_text,
                    "source_type": doc.source_type
                }).execute()
                if res.data:
                    doc = SourceDocument(**res.data[0])
            except Exception:
                pass
        self._documents[doc.id] = doc
        self._save_local_db()
        return doc

    def get_documents_by_workspace(self, workspace_id: str) -> List[SourceDocument]:
        self._load_local_db()
        if self.supabase:
            try:
                res = self.supabase.table("source_documents").select("*").eq("workspace_id", workspace_id).execute()
                if res.data:
                    return [SourceDocument(**r) for r in res.data]
            except Exception:
                pass
        return [d for d in self._documents.values() if d.workspace_id == workspace_id]

    # Chunks
    def save_source_chunks(self, chunks: List[SourceChunk]) -> List[SourceChunk]:
        self._load_local_db()
        for c in chunks:
            self._chunks[c.id] = c
            if self.supabase:
                try:
                    payload = {
                        "id": c.id,
                        "source_document_id": c.source_document_id,
                        "workspace_id": c.workspace_id,
                        "chunk_index": c.chunk_index,
                        "text": c.text,
                        "embedding": c.embedding
                    }
                    self.supabase.table("source_chunks").insert(payload).execute()
                except Exception:
                    pass
        self._save_local_db()
        return chunks

    def get_chunks_by_workspace(self, workspace_id: str) -> List[SourceChunk]:
        self._load_local_db()
        chunks = [c for c in self._chunks.values() if c.workspace_id == workspace_id]
        if not chunks and self.supabase:
            try:
                res = self.supabase.table("source_chunks").select("*").eq("workspace_id", workspace_id).execute()
                if res.data:
                    return [SourceChunk(**r) for r in res.data]
            except Exception:
                pass
        return chunks

    def get_chunk(self, chunk_id: str) -> Optional[SourceChunk]:
        self._load_local_db()
        if chunk_id in self._chunks:
            return self._chunks[chunk_id]
        if self.supabase:
            try:
                res = self.supabase.table("source_chunks").select("*").eq("id", chunk_id).execute()
                if res.data:
                    return SourceChunk(**res.data[0])
            except Exception:
                pass
        return None

    def search_chunks(self, workspace_id: str, query_embedding: List[float], top_k: int = 5) -> List[SourceChunk]:
        self._load_local_db()
        workspace_chunks = [c for c in self._chunks.values() if c.workspace_id == workspace_id]
        if not workspace_chunks and self.supabase:
            try:
                res = self.supabase.table("source_chunks").select("*").eq("workspace_id", workspace_id).execute()
                if res.data:
                    workspace_chunks = [SourceChunk(**r) for r in res.data]
            except Exception:
                pass

        if not workspace_chunks:
            return []

        scored = []
        for chunk in workspace_chunks:
            score = 0.0
            if chunk.embedding and query_embedding:
                score = cosine_similarity(query_embedding, chunk.embedding)
            scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored[:top_k]]

    # Requirements & Contradictions
    def save_requirements(self, workspace_id: str, requirements: List[Claim], contradictions: List[Contradiction]):
        self._load_local_db()
        self._requirements[workspace_id] = requirements
        self._contradictions[workspace_id] = contradictions
        if self.supabase:
            try:
                for req in requirements:
                    self.supabase.table("requirements").insert({
                        "id": req.id,
                        "workspace_id": workspace_id,
                        "text": req.text,
                        "status": req.status,
                        "confidence": req.confidence,
                        "citation_chunk_ids": req.citations
                    }).execute()
                for c in contradictions:
                    self.supabase.table("contradictions").insert({
                        "id": c.id,
                        "workspace_id": workspace_id,
                        "description": c.description,
                        "source_chunk_ids": c.source_chunk_ids
                    }).execute()
            except Exception:
                pass
        self._save_local_db()

    def get_requirements(self, workspace_id: str) -> List[Claim]:
        self._load_local_db()
        if workspace_id in self._requirements:
            return self._requirements[workspace_id]
        if self.supabase:
            try:
                res = self.supabase.table("requirements").select("*").eq("workspace_id", workspace_id).execute()
                if res.data:
                    return [Claim(
                        id=r["id"],
                        text=r["text"],
                        status=r.get("status", "unsupported"),
                        confidence=r.get("confidence", 0.0),
                        citations=r.get("citation_chunk_ids", []) or []
                    ) for r in res.data]
            except Exception:
                pass
        return []

    def get_contradictions(self, workspace_id: str) -> List[Contradiction]:
        self._load_local_db()
        if workspace_id in self._contradictions:
            return self._contradictions[workspace_id]
        if self.supabase:
            try:
                res = self.supabase.table("contradictions").select("*").eq("workspace_id", workspace_id).execute()
                if res.data:
                    return [Contradiction(
                        id=r["id"],
                        description=r["description"],
                        source_chunk_ids=r.get("source_chunk_ids", []) or []
                    ) for r in res.data]
            except Exception:
                pass
        return []

    # Artifacts
    def save_artifact(self, workspace_id: str, artifact_type: str, content: Any, claims: List[Claim]) -> str:
        self._load_local_db()
        artifact_id = str(uuid4())
        self._artifacts[artifact_id] = {
            "id": artifact_id,
            "workspace_id": workspace_id,
            "type": artifact_type,
            "content": content,
            "claims": [c.model_dump() for c in claims]
        }
        if self.supabase:
            try:
                self.supabase.table("artifacts").insert({
                    "id": artifact_id,
                    "workspace_id": workspace_id,
                    "type": artifact_type,
                    "content": content
                }).execute()
                for claim in claims:
                    self.supabase.table("artifact_claims").insert({
                        "id": claim.id,
                        "artifact_id": artifact_id,
                        "text": claim.text,
                        "status": claim.status,
                        "confidence": claim.confidence,
                        "citation_chunk_ids": claim.citations
                    }).execute()
            except Exception:
                pass
        self._save_local_db()
        return artifact_id

    def get_artifact(self, workspace_id: str, artifact_type: str) -> Optional[Dict[str, Any]]:
        self._load_local_db()
        for art in self._artifacts.values():
            if art["workspace_id"] == workspace_id and art["type"] == artifact_type:
                return {
                    **art,
                    "claims": [Claim(**c) if isinstance(c, dict) else c for c in art.get("claims", [])]
                }
        if self.supabase:
            try:
                res = self.supabase.table("artifacts").select("*").eq("workspace_id", workspace_id).eq("type", artifact_type).order("created_at", desc=True).limit(1).execute()
                if res.data:
                    art = res.data[0]
                    claims_res = self.supabase.table("artifact_claims").select("*").eq("artifact_id", art["id"]).execute()
                    art["claims"] = [Claim(
                        id=c["id"],
                        text=c["text"],
                        status=c.get("status", "unsupported"),
                        confidence=c.get("confidence", 0.0),
                        citations=c.get("citation_chunk_ids", []) or []
                    ) for c in (claims_res.data or [])]
                    return art
            except Exception:
                pass
        return None

    def update_claim_status(self, claim_id: str, status: str, explanation: Optional[str] = None):
        self._load_local_db()
        for claims_list in self._requirements.values():
            for c in claims_list:
                if c.id == claim_id:
                    c.status = status # type: ignore
                    c.explanation = explanation
        for art in self._artifacts.values():
            for c in art.get("claims", []):
                if (isinstance(c, dict) and c.get("id") == claim_id):
                    c["status"] = status
                    c["explanation"] = explanation
                elif hasattr(c, "id") and c.id == claim_id:
                    c.status = status
                    c.explanation = explanation

        if self.supabase:
            try:
                self.supabase.table("requirements").update({"status": status}).eq("id", claim_id).execute()
                self.supabase.table("artifact_claims").update({"status": status}).eq("id", claim_id).execute()
            except Exception:
                pass
        self._save_local_db()

db_client = DBClient()
