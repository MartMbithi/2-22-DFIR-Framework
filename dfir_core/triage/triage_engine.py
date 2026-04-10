# 2:22 DFIR Framework — Triage Engine
# Orchestrates deterministic artifact triage: extract features → score → classify

from datetime import datetime, timezone
from config import classify_severity
from triage.feature_extractor import ExtractFeatures
from triage.rule_scorer import ScoreArtifact


def TriageArtifact(
    artifact: dict,
    incident_start: datetime | None = None,
    incident_end: datetime | None = None,
) -> dict:
    """
    Execute deterministic triage on a single forensic artifact.

    Returns a triage result dict containing:
    - artifact_id
    - triage_score (0.0 - 1.0)
    - severity (CRITICAL/HIGH/MEDIUM/LOW/INFO)
    - score_breakdown (auditable feature contributions)
    - features (extracted raw features)
    - triaged_at
    """
    features = ExtractFeatures(artifact, incident_start, incident_end)
    score, breakdown = ScoreArtifact(features)
    severity = classify_severity(score)

    return {
        "artifact_id": artifact.get("artifact_id"),
        "triage_score": score,
        "severity": severity,
        "score_breakdown": breakdown,
        "features": {
            "keyword_severity": features.get("keyword_severity"),
            "keyword_hits": features.get("keyword_hits", []),
            "artifact_type": features.get("artifact_type"),
            "has_attack_classification": features.get("has_attack_classification"),
            "attack_types": features.get("attack_types", []),
            "is_failure_event": features.get("is_failure_event"),
            "sensitive_path_access": features.get("sensitive_path_access"),
            "in_time_window": features.get("in_time_window"),
        },
        "triaged_at": datetime.now(timezone.utc),
    }
