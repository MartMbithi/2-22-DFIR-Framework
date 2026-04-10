# 2:22 DFIR Framework — Hybrid Scorer
# Combines deterministic rule-based scoring with semantic similarity scoring
# This is the core innovation of the 2:22 DFIR Framework

from triage_semantic.semantic_scorer import SemanticScore
from triage_semantic.semantic_config import RULE_WEIGHT, SEMANTIC_WEIGHT
from triage_semantic.embedding_engine import is_fallback_mode


def HybridScore(
    rule_score: float,
    artifact_text: str,
    investigation_goal: str,
) -> dict:
    """
    Compute the hybrid triage score combining:
    - Deterministic rule-based score (weighted)
    - Semantic similarity score (weighted)

    This approach ensures:
    1. Reproducible, auditable deterministic analysis
    2. Contextual intelligence through semantic reasoning
    3. Evidence integrity (semantic layer never modifies evidence)

    Returns dict with rule_score, semantic_score, final_score, and explanation.
    """
    semantic_score = SemanticScore(artifact_text, investigation_goal)

    final_score = (RULE_WEIGHT * rule_score) + (SEMANTIC_WEIGHT * semantic_score)
    final_score = round(min(1.0, max(0.0, final_score)), 4)

    return {
        "rule_score": round(rule_score, 4),
        "semantic_score": semantic_score,
        "final_score": final_score,
        "rule_weight": RULE_WEIGHT,
        "semantic_weight": SEMANTIC_WEIGHT,
        "semantic_method": "hash_fallback" if is_fallback_mode() else "sentence_transformer",
        "semantic_explanation": (
            "Hybrid score combining deterministic rule-based analysis "
            f"(weight={RULE_WEIGHT}) with semantic similarity to investigation "
            f"goal (weight={SEMANTIC_WEIGHT}). Semantic layer provides contextual "
            "relevance scoring without modifying underlying evidence."
        ),
    }
