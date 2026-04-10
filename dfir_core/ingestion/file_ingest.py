# 2:22 DFIR Framework — File Ingestion Engine
# Discovers, parses, and classifies raw forensic artifacts from log files
# Maintains evidence integrity through SHA-256 content hashing

import hashlib
import os
import socket
from datetime import datetime, timezone
from typing import Callable

from ingestion.detectors.web_attack_detector import WebAttackDetector
from ingestion.detectors.auth_detector import AuthDetector
from ingestion.detectors.network_detector import NetworkDetector
from ingestion.detectors.system_detector import SystemDetector
from ingestion.detectors.process_detector import ProcessDetector
from ingestion.detectors.file_detector import FileDetector
from ingestion.parsers.log_parsers import detect_and_parse, parse_any_timestamp

# Default fallback (CLI / legacy mode)
DEFAULT_RAW_DIR = "data/raw"

# Detector priority order — more specific detectors first
DETECTORS = [
    WebAttackDetector(),
    AuthDetector(),
    ProcessDetector(),
    NetworkDetector(),
    FileDetector(),
    SystemDetector(),  # Most generic — last
]

SUPPORTED_EXTENSIONS = (".log", ".txt", ".json", ".csv", ".audit", ".evtx.txt")


def _compute_file_hash(filepath: str) -> str:
    """Compute SHA-256 hash of a file for evidence integrity verification."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _count_lines(filepath: str) -> int:
    """Count lines in a file for progress tracking."""
    count = 0
    with open(filepath, "r", errors="ignore") as f:
        for _ in f:
            count += 1
    return count


def DiscoverAndParseRawFiles(
    case_id: str = "AUTOCASE",
    progress_callback: Callable | None = None,
) -> tuple[list[dict], dict]:
    """
    Scan the input directory for log files, parse each line through
    the detector chain, and return (artifacts, evidence_manifest).

    The evidence_manifest tracks file hashes for chain-of-custody integrity.

    Args:
        case_id: The forensic case identifier
        progress_callback: Optional fn(stage, percent, message) for SaaS progress

    Returns:
        Tuple of (artifacts_list, evidence_manifest_dict)
    """
    artifacts = []
    evidence_manifest = {
        "case_id": case_id,
        "ingestion_started_at": datetime.now(timezone.utc).isoformat(),
        "files_processed": [],
        "total_lines_scanned": 0,
        "total_artifacts_extracted": 0,
        "host": socket.gethostname(),
    }

    raw_dir = os.getenv("DFIR_INPUT_DIR", DEFAULT_RAW_DIR)

    if not os.path.isdir(raw_dir):
        print(f"[WARN] Raw data directory not found: {raw_dir}")
        return artifacts, evidence_manifest

    # Discover all log files
    log_files = []
    for root, _, files in os.walk(raw_dir):
        for fname in sorted(files):
            if fname.lower().endswith(SUPPORTED_EXTENSIONS):
                log_files.append(os.path.join(root, fname))

    if not log_files:
        print(f"[WARN] No supported log files found in {raw_dir}")
        return artifacts, evidence_manifest

    total_files = len(log_files)

    for file_idx, filepath in enumerate(log_files):
        file_record = {
            "path": filepath,
            "filename": os.path.basename(filepath),
            "size_bytes": os.path.getsize(filepath),
            "sha256": _compute_file_hash(filepath),
            "lines_scanned": 0,
            "artifacts_extracted": 0,
        }

        if progress_callback:
            pct = int((file_idx / total_files) * 100)
            progress_callback(
                "ingestion", pct,
                f"Scanning {os.path.basename(filepath)} ({file_idx+1}/{total_files})"
            )

        try:
            line_count = 0
            with open(filepath, "r", errors="ignore") as f:
                for line_number, line in enumerate(f, start=1):
                    stripped = line.strip()
                    if not stripped:
                        continue
                    line_count += 1

                    # Try structured parsing for timestamp extraction
                    parsed = detect_and_parse(stripped)
                    parsed_ts = None
                    if parsed:
                        parsed_ts = (
                            parsed.get("timestamp")
                            or parsed.get("_parsed_timestamp")
                        )

                    context = {
                        "case_id": case_id,
                        "file": filepath,
                        "host": socket.gethostname(),
                        "line_number": line_number,
                        "parsed_timestamp": parsed_ts,
                        "parsed_data": parsed,
                    }

                    # Run through detector chain
                    for detector in DETECTORS:
                        try:
                            if detector.matches(stripped):
                                artifact = detector.parse(stripped, context)
                                if artifact:
                                    artifacts.append(artifact)
                                    file_record["artifacts_extracted"] += 1
                                break
                        except Exception as det_err:
                            print(
                                f"[WARN] Detector {detector.detector_name} "
                                f"error on {filepath}:{line_number}: {det_err}"
                            )

            file_record["lines_scanned"] = line_count
            evidence_manifest["total_lines_scanned"] += line_count

        except Exception as e:
            print(f"[ERROR] Failed reading {filepath}: {e}")
            file_record["error"] = str(e)

        evidence_manifest["files_processed"].append(file_record)

    evidence_manifest["total_artifacts_extracted"] = len(artifacts)
    evidence_manifest["ingestion_completed_at"] = datetime.now(timezone.utc).isoformat()

    if progress_callback:
        progress_callback("ingestion", 100, "Ingestion complete")

    return artifacts, evidence_manifest
