# 2:22 DFIR Framework — File System Activity Detector
# Detects file system operations relevant to forensic investigation

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

FILE_PATTERNS = {
    "FILE_CREATION": [
        re.compile(r"(?:creat|touch|mkdir)\s+(.+?)(?:\s|$)", re.I),
        re.compile(r"open\(.*O_CREAT", re.I),
    ],
    "FILE_DELETION": [
        re.compile(r"(?:rm|unlink|rmdir|shred)\s+(.+?)(?:\s|$)", re.I),
        re.compile(r"delet(?:e|ed|ing)\s+(.+?)(?:\s|$)", re.I),
    ],
    "FILE_MODIFICATION": [
        re.compile(r"(?:chmod|chown|chgrp)\s+(.+?)(?:\s|$)", re.I),
        re.compile(r"(?:mv|rename)\s+(.+?)(?:\s|$)", re.I),
        re.compile(r"write\(|truncate\(|modify", re.I),
    ],
    "SENSITIVE_ACCESS": [
        re.compile(r"(?:/etc/passwd|/etc/shadow|/etc/sudoers)", re.I),
        re.compile(r"(?:\.ssh/|authorized_keys|id_rsa|known_hosts)", re.I),
        re.compile(r"(?:\.bash_history|\.zsh_history|\.bashrc|\.profile)", re.I),
        re.compile(r"(?:wp-config|\.env|config\.php|settings\.py|\.htaccess)", re.I),
        re.compile(r"(?:SAM|SYSTEM|SECURITY|NTDS\.dit)", re.I),
    ],
    "ARCHIVE_OPERATION": [
        re.compile(r"(?:tar|zip|gzip|bzip2|7z|rar)\s+", re.I),
        re.compile(r"(?:compress|archive|pack)", re.I),
    ],
    "EXECUTABLE_DROP": [
        re.compile(r"(?:\.exe|\.dll|\.so|\.sh|\.py|\.pl|\.rb|\.php)\s*$", re.I),
        re.compile(r"/tmp/.*(?:\.sh|\.py|\.elf|payload)", re.I),
        re.compile(r"(?:chmod\s+[+]?[0-7]*[xX]|chmod\s+755|chmod\s+777)", re.I),
    ],
}

SENSITIVE_PATHS = [
    "/etc/passwd", "/etc/shadow", "/etc/sudoers",
    "/var/log/", "/tmp/", "/dev/shm/",
    ".ssh/", "authorized_keys", "id_rsa",
    "wp-config", ".env", ".htaccess",
]


class FileDetector(BaseDetector):
    """Detects file system operations relevant to forensic investigation."""

    def matches(self, line: str) -> bool:
        lower = line.lower()
        return any(kw in lower for kw in [
            "chmod", "chown", "chgrp", "open(", "creat", "unlink",
            "delete", "rm ", "mkdir", "rmdir", "rename", "mv ",
            "touch ", "write(", "truncat", "shred",
            "/etc/passwd", "/etc/shadow", ".ssh/",
            "authorized_keys", "id_rsa", "wp-config",
            ".env", ".htaccess", "tar ", "zip ", "gzip",
        ])

    def parse(self, line: str, context: dict) -> dict:
        event_type = "FILE_EVENT"
        target_path = None

        for etype, patterns in FILE_PATTERNS.items():
            for pat in patterns:
                m = pat.search(line)
                if m:
                    event_type = etype
                    if m.groups():
                        target_path = m.group(1)[:300]
                    break
            if event_type != "FILE_EVENT":
                break

        # Check for sensitive path access
        lower = line.lower()
        sensitive = any(sp in lower for sp in SENSITIVE_PATHS)

        summary = event_type
        if target_path:
            summary += f": {target_path[:120]}"
        if sensitive:
            summary += " [SENSITIVE PATH]"

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "file_event",
            "source_tool": "filesystem",
            "source_file": context["file"],
            "host_id": context["host"],
            "user_context": None,
            "artifact_timestamp": context.get("parsed_timestamp") or datetime.now(timezone.utc),
            "artifact_path": context["file"],
            "content_summary": summary,
            "raw_content": line.strip()[:2000],
            "md5": None,
            "sha1": None,
            "sha256": None,
            "metadata": {
                "event_type": event_type,
                "target_path": target_path,
                "sensitive_path_access": sensitive,
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
