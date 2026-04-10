# 2:22 DFIR Framework — Embedding Engine
# Generates sentence embeddings for semantic similarity scoring
# Falls back gracefully if sentence-transformers is unavailable

import hashlib
import numpy as np
from functools import lru_cache

_MODEL_CACHE = {}
_FALLBACK_MODE = False


def _load_model(model_name: str):
    global _FALLBACK_MODE
    if model_name in _MODEL_CACHE:
        return _MODEL_CACHE[model_name]
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(model_name)
        _MODEL_CACHE[model_name] = model
        return model
    except ImportError:
        _FALLBACK_MODE = True
        print("[WARN] sentence-transformers not available — using hash-based fallback")
        return None
    except Exception as e:
        _FALLBACK_MODE = True
        print(f"[WARN] Failed to load embedding model: {e}")
        return None


def _hash_embedding(text: str, dim: int = 384) -> np.ndarray:
    """
    Deterministic fallback: generate a pseudo-embedding from text hash.
    Not semantically meaningful but ensures pipeline doesn't break.
    """
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    np.random.seed(int(h[:8], 16))
    return np.random.randn(dim).astype(np.float32)


def GenerateEmbedding(text: str, model_name: str) -> np.ndarray:
    """Generate an embedding vector for the given text."""
    if not text:
        text = ""

    model = _load_model(model_name)
    if model is None:
        return _hash_embedding(text)

    return model.encode(text)


def is_fallback_mode() -> bool:
    return _FALLBACK_MODE
