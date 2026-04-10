# 2:22 DFIR Framework — Prompt Builder
from narrative.narrative_templates import INCIDENT_SUMMARY_TEMPLATE


def BuildIncidentSummaryPrompt(artifacts: list[dict]) -> str:
    """Build a full incident summary prompt from triaged artifacts."""
    evidence_lines = []
    for a in artifacts:
        ts = a.get("artifact_timestamp", "N/A")
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()

        line = (
            f"Artifact ID: {a.get('artifact_id', 'N/A')[:12]} | "
            f"Type: {a.get('artifact_type', 'N/A')} | "
            f"Severity: {a.get('severity', 'N/A')} | "
            f"Score: {a.get('final_score', a.get('triage_score', 0)):.3f} | "
            f"Timestamp: {ts} | "
            f"Summary: {a.get('content_summary', 'N/A')}"
        )

        meta = a.get("metadata") or {}
        if isinstance(meta, dict):
            interp = meta.get("interpretation", [])
            if interp:
                line += f" | Indicators: {'; '.join(interp[:3])}"
            attacks = meta.get("attack_types", [])
            if attacks:
                line += f" | Attacks: {', '.join(attacks)}"

        evidence_lines.append(line)

    return INCIDENT_SUMMARY_TEMPLATE.format(evidence="\n".join(evidence_lines))
