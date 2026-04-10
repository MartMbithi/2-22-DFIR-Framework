# 2:22 DFIR Framework — Artifact Normalizer
from datetime import datetime, timezone
from utils.uuid_utils import GenerateArtifactId


def NormalizeArtifact(raw_record: dict, source_tool: str, case_id: str) -> dict:
    """
    Normalizes a raw parsed record into the standard forensic artifact schema.
    Used for legacy/CSV-based ingestion paths.
    """
    return {
        "artifact_id": GenerateArtifactId(),
        "case_id": case_id,
        "artifact_type": raw_record.get("artifact_type"),
        "source_tool": source_tool,
        "source_file": raw_record.get("source_file"),
        "host_id": raw_record.get("host_id"),
        "user_context": raw_record.get("user"),
        "artifact_timestamp": raw_record.get("timestamp") or datetime.now(timezone.utc),
        "artifact_path": raw_record.get("path"),
        "content_summary": raw_record.get("summary"),
        "raw_content": raw_record.get("content"),
        "md5": raw_record.get("md5"),
        "sha1": raw_record.get("sha1"),
        "sha256": raw_record.get("sha256"),
        "metadata": raw_record.get("metadata", {}),
        "ingested_at": datetime.now(timezone.utc),
    }
