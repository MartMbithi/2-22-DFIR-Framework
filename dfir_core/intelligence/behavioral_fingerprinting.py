# 2:22 DFIR Framework — Behavioral Fingerprinting
# Profiles attacker behavior patterns from triaged forensic artifacts

from collections import Counter
from datetime import datetime


def behavioral_fingerprint(triaged: list[dict]) -> dict:
    """
    Generate a behavioral fingerprint of the observed attack activity.
    Analyzes temporal patterns, attack velocity, tooling consistency,
    and automation likelihood.
    """
    times = []
    for a in triaged:
        ts = a.get("artifact_timestamp")
        if ts:
            try:
                if isinstance(ts, str):
                    ts = datetime.fromisoformat(str(ts))
                times.append(ts)
            except (ValueError, TypeError):
                pass

    hours = [t.hour for t in times]
    days = [t.strftime("%A") for t in times]

    # ── Attack Velocity ─────────────────────────────────────────
    total = len(triaged)
    if total > 500:
        velocity = "critical"
    elif total > 100:
        velocity = "high"
    elif total > 20:
        velocity = "medium"
    else:
        velocity = "low"

    # ── Temporal Pattern ────────────────────────────────────────
    if hours:
        night_count = sum(1 for h in hours if h < 6 or h >= 22)
        business_count = sum(1 for h in hours if 8 <= h <= 17)
        night_ratio = night_count / len(hours) if hours else 0
        business_ratio = business_count / len(hours) if hours else 0

        if night_ratio > 0.5:
            time_pattern = "off-hours-dominant"
        elif business_ratio > 0.7:
            time_pattern = "business-hours"
        else:
            time_pattern = "distributed"
    else:
        time_pattern = "unknown"

    # ── Peak Activity ───────────────────────────────────────────
    peak_hour = Counter(hours).most_common(1)[0] if hours else (None, 0)
    peak_day = Counter(days).most_common(1)[0] if days else (None, 0)

    # ── Tooling Consistency ─────────────────────────────────────
    summaries = Counter(a.get("content_summary", "")[:60] for a in triaged)
    max_repeat = max(summaries.values()) if summaries else 0
    unique_ratio = len(summaries) / max(total, 1)

    if max_repeat > 50 or unique_ratio < 0.1:
        tooling = "highly-automated"
    elif max_repeat > 10 or unique_ratio < 0.3:
        tooling = "semi-automated"
    else:
        tooling = "manual-or-varied"

    # ── Automation Likelihood ───────────────────────────────────
    if velocity in ("critical", "high") and tooling == "highly-automated":
        automation = "high"
    elif velocity == "medium" or tooling == "semi-automated":
        automation = "medium"
    else:
        automation = "low"

    # ── Time Span ───────────────────────────────────────────────
    time_span_hours = None
    if len(times) >= 2:
        sorted_times = sorted(times)
        delta = sorted_times[-1] - sorted_times[0]
        time_span_hours = round(delta.total_seconds() / 3600, 2)

    # ── Attack Diversity ────────────────────────────────────────
    artifact_types = Counter(a.get("artifact_type") for a in triaged)
    attack_types = set()
    for a in triaged:
        meta = a.get("metadata") or {}
        for at in meta.get("attack_types", []):
            attack_types.add(at)

    return {
        "total_artifacts": total,
        "attack_velocity": velocity,
        "time_pattern": time_pattern,
        "peak_activity_hour": peak_hour[0],
        "peak_activity_day": peak_day[0],
        "tooling_consistency": tooling,
        "automation_likelihood": automation,
        "time_span_hours": time_span_hours,
        "unique_event_ratio": round(unique_ratio, 3),
        "artifact_type_distribution": dict(artifact_types.most_common()),
        "distinct_attack_types": sorted(attack_types),
        "distinct_attack_count": len(attack_types),
    }
