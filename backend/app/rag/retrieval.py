from typing import List
from app.rag.embeddings import embed_single
from app.db.client import db_client
from app.models.schemas import SourceChunk

def retrieve_relevant_chunks(workspace_id: str, query: str, top_k: int = 5) -> List[SourceChunk]:
    """
    RAG retrieval: Embed query and return top-k matching source chunks for the given workspace.
    (BUILD_BRIEF.md §4.2)
    """
    if not query.strip():
        # If empty query, return any available chunks from workspace
        chunks = [c for c in db_client._CHUNKS.values() if c.workspace_id == workspace_id]
        return chunks[:top_k]

    query_vec = embed_single(query)
    results = db_client.search_chunks(workspace_id, query_vec, top_k=top_k)
    return results
