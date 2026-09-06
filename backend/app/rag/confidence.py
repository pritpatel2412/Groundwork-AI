import math
from typing import List, Union
from app.rag.embeddings import embed_single

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def calibrated_confidence(
    claim_embedding_or_text: Union[List[float], str],
    cited_chunk_embeddings_or_texts: List[Union[List[float], str]]
) -> float:
    """
    Computes calibrated confidence from retrieval cosine similarity
    between claim embedding and cited chunk embedding(s) (PRODUCTION_HARDENING_BRIEF.md §6.5.2).
    Returns normalized confidence score (0.0 to 1.0).
    """
    if not cited_chunk_embeddings_or_texts:
        return 0.50

    claim_vec = (
        claim_embedding_or_text
        if isinstance(claim_embedding_or_text, list)
        else embed_single(claim_embedding_or_text)
    )

    chunk_vecs = [
        c if isinstance(c, list) else embed_single(c)
        for c in cited_chunk_embeddings_or_texts
    ]

    sims = [cosine_similarity(claim_vec, cv) for cv in chunk_vecs]
    if not sims:
        return 0.50

    max_sim = max(sims)
    # Cosine similarity ranges from 0.0 (no overlap) to 1.0 (identical)
    # Map 0.0 -> 0.45 baseline, 0.25+ -> 0.88+, capped at 0.99
    scaled = 0.45 + (max_sim * 1.8)
    calibrated = max(0.40, min(0.99, round(scaled, 3)))
    return calibrated
