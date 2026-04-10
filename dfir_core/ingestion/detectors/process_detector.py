# 2:22 DFIR Framework — Process Execution Detector
# Detects suspicious process execution, command interpreters, and scheduled tasks

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

SUSPICIOUS_COMMANDS = {
    "POWERSHELL_EXEC": [
        re.compile(r"powershell(?:\.exe)?(?:\s+-\w+)*", re.I),
        re.compile(r"pwsh(?:\.exe)?", re.I),
    ],
    "CMD_EXEC": [
        re.compile(r"cmd(?:\.exe)?\s+/[ckr]", re.I),
    ],
    "SHELL_EXEC": [
        re.compile(r"(?:/bin/)?(?:ba)?sh\s+-[ci]", re.I),
        re.compile(r"exec\s+\d+<>/dev/tcp/", re.I),
    ],
    "CREDENTIAL_DUMP": [
        re.compile(r"mimikatz|sekurlsa|lsadump|lazagne|secretsdump", re.I),
        re.compile(r"procdump.*lsass", re.I),
        re.compile(r"comsvcs\.dll.*MiniDump", re.I),
    ],
    "SCHEDULED_TASK": [
        re.compile(r"schtasks\s+/create", re.I),
        re.compile(r"at\s+\d{1,2}:\d{2}", re.I),
        re.compile(r"crontab\s+-[el]", re.I),
    ],
    "RECON_COMMAND": [
        re.compile(r"whoami|systeminfo|ipconfig|ifconfig|hostname|uname\s+-a", re.I),
        re.compile(r"net\s+(?:user|localgroup|group|share|session)", re.I),
        re.compile(r"tasklist|ps\s+aux|top\s+-b", re.I),
    ],
    "DOWNLOAD_EXEC": [
        re.compile(r"wget\s+https?://", re.I),
        re.compile(r"curl\s+.*https?://", re.I),
        re.compile(r"certutil\s+.*-urlcache", re.I),
        re.compile(r"bitsadmin\s+/transfer", re.I),
    ],
    "PERSISTENCE": [
        re.compile(r"reg\s+add.*\\Run", re.I),
        re.compile(r"sc\s+create", re.I),
        re.compile(r"systemctl\s+enable", re.I),
    ],
}


class ProcessDetector(BaseDetector):
    """Detects suspicious process execution and command interpreter usage."""

    def matches(self, line: str) -> bool:
        lower = line.lower()
        return any(kw in lower for kw in [
            "exec", "process", "command", "powershell", "cmd.exe",
            "bash", "/bin/sh", "python", "perl", "ruby",
            "schtasks", "crontab", "at ", "wscript", "cscript",
            "mshta", "regsvr32", "rundll32", "certutil",
            "wget", "curl", "mimikatz", "procdump",
        ]) or "COMMAND=" in line

    def parse(self, line: str, context: dict) -> dict:
        event_type = "PROCESS_EXECUTION"
        matched_command = None

        for etype, patterns in SUSPICIOUS_COMMANDS.items():
            for pat in patterns:
                m = pat.search(line)
                if m:
                    event_type = etype
                    matched_command = m.group(0)[:200]
                    break
            if event_type != "PROCESS_EXECUTION":
                break

        # Extract COMMAND= from sudo/audit logs
        cmd_match = re.search(r"COMMAND=(.+?)(?:\s*$|\s+;)", line)
        if cmd_match:
            matched_command = cmd_match.group(1)[:200]

        # Extract user context from sudo
        user_match = re.search(r"(?:sudo:\s+(\S+)|USER=(\S+)|user=(\S+))", line, re.I)
        user = None
        if user_match:
            user = next((g for g in user_match.groups() if g), None)

        summary = f"{event_type}"
        if matched_command:
            summary += f": {matched_command[:100]}"
        if user:
            summary += f" [user={user}]"

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "process_event",
            "source_tool": "auditd",
            "source_file": context["file"],
            "host_id": context["host"],
            "user_context": user,
            "artifact_timestamp": context.get("parsed_timestamp") or datetime.now(timezone.utc),
            "artifact_path": context["file"],
            "content_summary": summary,
            "raw_content": line.strip()[:2000],
            "md5": None,
            "sha1": None,
            "sha256": None,
            "metadata": {
                "event_type": event_type,
                "command": matched_command,
                "user": user,
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
