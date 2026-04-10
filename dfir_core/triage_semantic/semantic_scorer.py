# 2:22 DFIR Framework — Semantic Scorer
# Computes semantic similarity between artifact content and investigation goal

import numpy as np
from triage_semantic.embedding_engine import GenerateEmbedding
from triage_semantic.semantic_config import EMBEDDING_MODEL


def CosineSimilarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    if vec1 is None or vec2 is None:
        return 0.0
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / (norm1 * norm2))


def SemanticScore(artifact_text: str, investigation_goal: str) -> float:
    """
    Compute semantic similarity score between artifact content
    and the investigation goal. Returns 0.0 - 1.0.
    """
    artifact_vec = GenerateEmbedding(artifact_text, EMBEDDING_MODEL)
    goal_vec = GenerateEmbedding(investigation_goal, EMBEDDING_MODEL)
    score = CosineSimilarity(artifact_vec, goal_vec)
    # Clamp to 0-1 range (cosine can be negative)
    return round(max(0.0, min(1.0, score)), 4)
