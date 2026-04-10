# 2:22 DFIR Framework — Case Intelligence Aggregator
# Combines attack channel classification, MITRE mapping, kill chain analysis,
# and behavioral fingerprinting into a unified intelligence report

from collections import Counter
from intelligence.attack_channel_classifier import (
    classify_attack_channels,
    classify_channel_evidence,
    map_artifacts_to_mitre,
    map_to_kill_chain,
    compute_tactic_distribution,
)
from intelligence.behavioral_fingerprinting import behavioral_fingerprint
from config import classify_severity, MITRE_ATTACK_DB


def generate_case_intelligence(case_id: str, triaged: list[dict]) -> dict:
    """
    Generate comprehensive case intelligence from triaged artifacts.

    Returns a structured intelligence report containing:
    - Attack channel classification
    - MITRE ATT&CK technique mappings
    - Cyber Kill Chain phase analysis
    - Tactic distribution
    - Behavioral fingerprint
    - Severity distribution
    - Source IP analysis
    - Timeline summary
    """
    # ── Attack Channels ─────────────────────────────────────────
    channels = classify_attack_channels(triaged)
    channel_evidence = classify_channel_evidence(triaged)

    # ── MITRE ATT&CK Mapping ───────────────────────────────────
    mitre_mappings = map_artifacts_to_mitre(triaged)
    kill_chain = map_to_kill_chain(mitre_mappings)
    tactic_distribution = compute_tactic_distribution(mitre_mappings)

    # ── Behavioral Fingerprint ──────────────────────────────────
    fingerprint = behavioral_fingerprint(triaged)

    # ── Severity Distribution ───────────────────────────────────
    severity_dist = Counter()
    for a in triaged:
        score = a.get("final_score", a.get("triage_score", 0))
        severity_dist[classify_severity(score)] += 1

    # ── Source IP Analysis ──────────────────────────────────────
    ip_counter = Counter()
    ip_attack_map = {}
    for a in triaged:
        meta = a.get("metadata") or {}
        ip = meta.get("source_ip")
        if ip and ip != "UNKNOWN":
            ip_counter[ip] += 1
            if ip not in ip_attack_map:
                ip_attack_map[ip] = set()
            for at in meta.get("attack_types", []):
                ip_attack_map[ip].add(at)

    top_source_ips = []
    for ip, count in ip_counter.most_common(20):
        top_source_ips.append({
            "ip": ip,
            "event_count": count,
            "attack_types": sorted(ip_attack_map.get(ip, set())),
        })

    # ── Timeline Bounds ─────────────────────────────────────────
    timestamps = []
    for a in triaged:
        ts = a.get("artifact_timestamp")
        if ts:
            try:
                if hasattr(ts, "isoformat"):
                    timestamps.append(ts)
            except Exception:
                pass

    timeline = {}
    if timestamps:
        sorted_ts = sorted(timestamps)
        timeline = {
            "earliest_event": sorted_ts[0].isoformat(),
            "latest_event": sorted_ts[-1].isoformat(),
            "span_hours": round(
                (sorted_ts[-1] - sorted_ts[0]).total_seconds() / 3600, 2
            ),
        }

    # ── Overall Threat Level ────────────────────────────────────
    max_score = max(
        (a.get("final_score", a.get("triage_score", 0)) for a in triaged),
        default=0,
    )
    overall_severity = classify_severity(max_score)

    return {
        "case_id": case_id,
        "overall_severity": overall_severity,
        "max_triage_score": round(max_score, 4),
        "total_artifacts_triaged": len(triaged),
        "attack_channels": channels,
        "active_channels": [ch for ch, active in channels.items() if active],
        "channel_evidence": channel_evidence,
        "mitre_mappings": mitre_mappings,
        "mitre_technique_count": len(set(m["technique_id"] for m in mitre_mappings)),
        "kill_chain_phases": kill_chain,
        "kill_chain_coverage": len(kill_chain),
        "tactic_distribution": tactic_distribution,
        "behavioral_fingerprint": fingerprint,
        "severity_distribution": dict(severity_dist),
        "top_source_ips": top_source_ips,
        "timeline": timeline,
    }
