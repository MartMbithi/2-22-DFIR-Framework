# 2:22 DFIR Framework — Report Index
# Maintains a JSON index of all generated forensic reports

import json
import os
from datetime import datetime, timezone


def UpdateReportIndex(
    case_id: str,
    report_path: str,
    intensity: str,
    report_type: str = "pdf",
    index_dir: str | None = None,
):
    """Update the report index with a new report entry."""
    if index_dir is None:
        index_dir = os.getenv("DFIR_REPORT_DIR", "reports")

    os.makedirs(index_dir, exist_ok=True)
    index_path = os.path.join(index_dir, "index.json")

    record = {
        "case_id": case_id,
        "report_path": report_path,
        "report_type": report_type,
        "intensity": intensity,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    data = []
    if os.path.exists(index_path):
        try:
            with open(index_path, "r") as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError):
            data = []

    data.append(record)

    with open(index_path, "w") as f:
        json.dump(data, f, indent=2)

    return record
