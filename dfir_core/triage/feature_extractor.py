# 2:22 DFIR Framework — Feature Extractor for Triage Scoring
# Extracts forensic features from artifacts for deterministic scoring

from datetime import datetime, timezone
from config import SUSPICIOUS_KEYWORDS


def ExtractFeatures(
    artifact: dict,
    incident_start: datetime | None = None,
    incident_end: datetime | None = None,
) -> dict:
    """
    Extract forensic-relevant features from an artifact for triage scoring.

    Features extracted:
    - Temporal relevance (within incident window)
    - Keyword severity (high/medium/low suspicious terms)
    - Artifact type weight
    - Attack metadata signals
    - Failure indicators
    - Sensitive path access
    - Network indicators
    """
    features = {}
    content = (artifact.get("content_summary") or "").lower()
    raw = (artifact.get("raw_content") or "").lower()
    combined = f"{content} {raw}"
    metadata = artifact.get("metadata") or {}
    if isinstance(metadata, str):
        metadata = {}

    # ── Temporal Relevance ──────────────────────────────────────
    features["in_time_window"] = False
    if incident_start and incident_end:
        ts = artifact.get("artifact_timestamp")
        if ts:
            try:
                if isinstance(ts, str):
                    ts = datetime.fromisoformat(ts)
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                features["in_time_window"] = incident_start <= ts <= incident_end
            except (ValueError, TypeError):
                pass

    # ── Keyword Severity Scoring ────────────────────────────────
    features["keyword_severity"] = "none"
    features["keyword_hits"] = []

    for severity in ("high", "medium", "low"):
        for term in SUSPICIOUS_KEYWORDS[severity]:
            if term in combined:
                features["keyword_severity"] = severity
                features["keyword_hits"].append(term)
                if severity == "high":
                    break
        if features["keyword_severity"] == "high":
            break

    # ── Artifact Type ───────────────────────────────────────────
    features["artifact_type"] = artifact.get("artifact_type", "unknown")

    # ── Attack Type Signals from Metadata ───────────────────────
    attack_types = metadata.get("attack_types", [])
    features["has_attack_classification"] = len(attack_types) > 0
    features["attack_types"] = attack_types

    # ── Failure / Denial Indicators ─────────────────────────────
    features["is_failure_event"] = any(
        kw in combined for kw in [
            "failed", "failure", "denied", "blocked", "rejected",
            "unauthorized", "forbidden", "invalid",
        ]
    )

    # ── Sensitive Path Access ───────────────────────────────────
    features["sensitive_path_access"] = metadata.get("sensitive_path_access", False)
    if not features["sensitive_path_access"]:
        features["sensitive_path_access"] = any(
            sp in combined for sp in [
                "/etc/passwd", "/etc/shadow", ".ssh/", "authorized_keys",
                "id_rsa", "wp-config", ".env", ".htaccess",
                "sam", "ntds.dit", "security",
            ]
        )

    # ── Network Indicators ──────────────────────────────────────
    features["suspicious_port"] = metadata.get("suspicious_port", False)
    features["has_external_ip"] = False
    indicators = metadata.get("indicators", {})
    if indicators:
        ips = indicators.get("source_ips", [])
        features["has_external_ip"] = any(
            not ip.startswith(("10.", "172.16.", "172.17.", "172.18.",
                               "192.168.", "127."))
            for ip in ips
        )

    # ── Event Outcome ───────────────────────────────────────────
    features["event_outcome"] = metadata.get("outcome", "UNKNOWN")

    # ── Repeated Pattern (high volume indicator) ────────────────
    features["high_volume_indicator"] = False

    return features


def compute_feature_vector(features: dict) -> dict:
    """
    Convert extracted features into a numeric scoring vector.
    Returns dict of feature_name: float between 0.0 and 1.0.
    """
    vector = {}

    # Time window
    vector["temporal"] = 1.0 if features.get("in_time_window") else 0.0

    # Keyword severity
    kw_map = {"high": 1.0, "medium": 0.6, "low": 0.3, "none": 0.0}
    vector["keyword"] = kw_map.get(features.get("keyword_severity", "none"), 0.0)

    # Artifact type weight
    type_weights = {
        "web_security_event": 0.9,
        "auth_event": 0.85,
        "process_event": 0.95,
        "network_event": 0.75,
        "file_event": 0.65,
        "system_event": 0.55,
    }
    vector["type_weight"] = type_weights.get(
        features.get("artifact_type", "unknown"), 0.4
    )

    # Attack classification
    vector["attack_signal"] = 0.8 if features.get("has_attack_classification") else 0.0

    # Failure events (brute force, access denied etc.)
    vector["failure_signal"] = 0.5 if features.get("is_failure_event") else 0.0

    # Sensitive path access
    vector["sensitive_access"] = 0.7 if features.get("sensitive_path_access") else 0.0

    # Suspicious port
    vector["suspicious_port"] = 0.6 if features.get("suspicious_port") else 0.0

    # External IP
    vector["external_ip"] = 0.3 if features.get("has_external_ip") else 0.0

    return vector
