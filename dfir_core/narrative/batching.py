# 2:22 DFIR Framework — Artifact Batching
from narrative.narrative_templates import BATCH_SUMMARY_TEMPLATE


def chunk_artifacts(triaged: list[dict], batch_size: int = 25):
    """Yield successive batches of triaged artifacts."""
    for i in range(0, len(triaged), batch_size):
        yield triaged[i:i + batch_size]


def build_batch_prompt(batch: list[dict], batch_number: int, total_batches: int) -> str:
    """Build an LLM prompt for a batch of artifacts."""
    event_lines = []
    for a in batch:
        ts = a.get("artifact_timestamp", "N/A")
        if hasattr(ts, "isoformat"):
            ts = ts.isoformat()
        summary = a.get("content_summary", "")
        score = a.get("final_score", a.get("triage_score", 0))
        severity = a.get("severity", "UNKNOWN")
        aid = a.get("artifact_id", "")[:8]

        line = f"- [{ts}] [{severity}] (score={score:.3f}) {summary} [id={aid}]"

        # Include attack types if present
        meta = a.get("metadata") or {}
        attack_types = meta.get("attack_types", [])
        if attack_types:
            line += f" (attacks: {', '.join(attack_types)})"

        event_lines.append(line)

    return BATCH_SUMMARY_TEMPLATE.format(
        batch_number=batch_number,
        total_batches=total_batches,
        events="\n".join(event_lines),
    )
