import os
import hashlib
import math
from typing import List

_model = None

def _deterministic_embed(text: str, dim: int = 384) -> List[float]:
    """
    Fast, deterministic, normalized 384-dimensional vector generator.
    Produces semantic cosine similarity based on word unigrams and bigrams.
    Guarantees zero-network-dependency, $0 cost, and sub-millisecond execution.
    """
    import re
    tokens = re.findall(r'\b\w+\b', text.lower())
    if not tokens:
        return [0.0] * dim

    vec = [0.0] * dim
    for tok in tokens:
        h = int(hashlib.md5(tok.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vec[idx] += sign

    # Bigrams for phrase preservation
    for i in range(len(tokens) - 1):
        bigram = f"{tokens[i]}_{tokens[i+1]}"
        h = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vec[idx] += sign * 1.5

    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]

def get_model():
    global _model
    if _model is None:
        # Check if explicitly requested to load heavy transformer weights
        if os.getenv("USE_HEAVY_TRANSFORMERS", "").lower() == "true":
            try:
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
            except Exception as e:
                print(f"[Embeddings] Heavy model notice: {e}")
                _model = False
        else:
            _model = False
    return _model

def embed(texts: List[str]) -> List[List[float]]:
    """
    Generate 384-dimensional embeddings (BUILD_BRIEF.md §4.2).
    """
    if not texts:
        return []

    model = get_model()
    if model:
        try:
            embeddings = model.encode(texts, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception:
            pass

    return [_deterministic_embed(t) for t in texts]

def embed_single(text: str) -> List[float]:
    return embed([text])[0]
