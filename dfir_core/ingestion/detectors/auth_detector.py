# 2:22 DFIR Framework — Authentication Event Detector
# Detects authentication-related security events from syslog, auth.log, and access logs

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

# ─── Auth Event Patterns ────────────────────────────────────────────
AUTH_PATTERNS = {
    "BRUTE_FORCE": [
        re.compile(r"Failed\s+password\s+for\s+(?:invalid\s+user\s+)?(\S+)\s+from\s+(\S+)", re.I),
        re.compile(r"authentication\s+failure.*rhost=(\S+).*user=(\S+)", re.I),
        re.compile(r"pam_unix.*authentication\s+failure", re.I),
    ],
    "AUTH_SUCCESS": [
        re.compile(r"Accepted\s+(?:password|publickey)\s+for\s+(\S+)\s+from\s+(\S+)", re.I),
        re.compile(r"session\s+opened\s+for\s+user\s+(\S+)", re.I),
    ],
    "PRIVILEGE_ESCALATION": [
        re.compile(r"sudo:\s+(\S+)\s+:", re.I),
        re.compile(r"su\[\d+\]:\s+(?:Successful|FAILED)\s+su\s+for\s+(\S+)\s+by\s+(\S+)", re.I),
        re.compile(r"COMMAND=(.+)", re.I),
    ],
    "ACCOUNT_CREATION": [
        re.compile(r"new\s+user:\s+name=(\S+)", re.I),
        re.compile(r"useradd.*name=(\S+)", re.I),
        re.compile(r"adduser.*(\S+)", re.I),
    ],
    "ACCOUNT_MODIFICATION": [
        re.compile(r"usermod.*name=(\S+)", re.I),
        re.compile(r"password\s+changed\s+for\s+(\S+)", re.I),
        re.compile(r"group\s+changed.*name=(\S+)", re.I),
    ],
    "SSH_EVENT": [
        re.compile(r"sshd\[\d+\]:\s+(.*)", re.I),
        re.compile(r"Disconnected\s+from\s+(?:invalid\s+user\s+)?(\S+)\s+(\S+)", re.I),
        re.compile(r"Invalid\s+user\s+(\S+)\s+from\s+(\S+)", re.I),
    ],
    "SESSION_EVENT": [
        re.compile(r"session\s+(?:opened|closed)\s+for\s+user\s+(\S+)", re.I),
    ],
}

IP_PATTERN = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b")
USER_PATTERN = re.compile(r"(?:user[= ]+|for\s+)(\S+)", re.I)


class AuthDetector(BaseDetector):
    """Detects authentication and credential-related security events."""

    def matches(self, line: str) -> bool:
        lower = line.lower()
        return any(kw in lower for kw in [
            "failed password", "accepted password", "authentication failure",
            "invalid user", "sudo", "su[", "su:", "session opened",
            "session closed", "new user", "useradd", "usermod",
            "password changed", "sshd[", "pam_unix", "pam_sss",
            "login failed", "login successful", "access granted",
            "access denied", "account locked", "account disabled",
        ])

    def parse(self, line: str, context: dict) -> dict:
        event_type = "AUTH_EVENT"
        extracted_user = None
        extracted_ip = None

        for etype, patterns in AUTH_PATTERNS.items():
            for pat in patterns:
                m = pat.search(line)
                if m:
                    event_type = etype
                    groups = m.groups()
                    if groups:
                        extracted_user = groups[0]
                    if len(groups) > 1:
                        ip_candidate = groups[1]
                        if IP_PATTERN.match(ip_candidate or ""):
                            extracted_ip = ip_candidate
                    break
            if event_type != "AUTH_EVENT":
                break

        # Fallback IP extraction
        if not extracted_ip:
            ip_m = IP_PATTERN.search(line)
            if ip_m:
                extracted_ip = ip_m.group(1)

        # Fallback user extraction
        if not extracted_user:
            user_m = USER_PATTERN.search(line)
            if user_m:
                extracted_user = user_m.group(1)

        is_failure = any(kw in line.lower() for kw in [
            "failed", "failure", "invalid", "denied", "error", "locked"
        ])

        outcome = "FAILURE" if is_failure else "SUCCESS"
        summary = f"{event_type} [{outcome}]"
        if extracted_user:
            summary += f" user={extracted_user}"
        if extracted_ip:
            summary += f" from {extracted_ip}"

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "auth_event",
            "source_tool": "auth_logs",
            "source_file": context["file"],
            "host_id": context["host"],
            "user_context": extracted_user,
            "artifact_timestamp": context.get("parsed_timestamp") or datetime.now(timezone.utc),
            "artifact_path": context["file"],
            "content_summary": summary,
            "raw_content": line.strip()[:2000],
            "md5": None,
            "sha1": None,
            "sha256": None,
            "metadata": {
                "event_type": event_type,
                "outcome": outcome,
                "target_user": extracted_user,
                "source_ip": extracted_ip,
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
