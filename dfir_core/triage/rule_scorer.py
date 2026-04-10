# 2:22 DFIR Framework — Deterministic Rule-Based Scorer
# Computes artifact triage scores from extracted feature vectors
# Scoring is fully auditable and reproducible

from triage.feature_extractor import compute_feature_vector

# Feature weights — define how much each signal contributes to the final score
# These are calibrated for government information system log analysis
FEATURE_WEIGHTS = {
    "temporal":          0.10,   # Within incident time window
    "keyword":           0.25,   # Suspicious keyword severity
    "type_weight":       0.15,   # Artifact type relevance
    "attack_signal":     0.20,   # Classified attack type
    "failure_signal":    0.10,   # Authentication/access failure
    "sensitive_access":  0.10,   # Sensitive file/path access
    "suspicious_port":   0.05,   # Known suspicious port
    "external_ip":       0.05,   # External IP involvement
}


def ScoreArtifact(features: dict) -> tuple[float, dict]:
    """
    Compute a deterministic triage score from extracted features.

    Returns:
        (score, breakdown) where score is 0.0-1.0 and breakdown
        shows each feature's contribution.
    """
    vector = compute_feature_vector(features)
    score = 0.0
    breakdown = {}

    for feature_name, weight in FEATURE_WEIGHTS.items():
        feature_value = vector.get(feature_name, 0.0)
        contribution = weight * feature_value
        breakdown[feature_name] = {
            "raw_value": round(feature_value, 3),
            "weight": weight,
            "contribution": round(contribution, 4),
        }
        score += contribution

    # Normalize to 0.0 - 1.0 range
    score = min(1.0, max(0.0, score))

    return round(score, 4), breakdown
