# 2:22 DFIR Framework — System Event Detector
# Detects system-level security events: service changes, kernel alerts, log tampering

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

SYSTEM_PATTERNS = {
    "SERVICE_DISRUPTION": [
        re.compile(r"(?:systemctl|service)\s+(?:stop|disable|mask)\s+(\S+)", re.I),
        re.compile(r"Stopped\s+(.+?)(?:\.|$)", re.I),
        re.compile(r"Failed\s+to\s+start\s+(.+?)(?:\.|$)", re.I),
        re.compile(r"service\s+(\S+)\s+(?:crashed|failed|exited)", re.I),
    ],
    "SERVICE_START": [
        re.compile(r"Started\s+(.+?)(?:\.|$)", re.I),
        re.compile(r"(?:systemctl|service)\s+(?:start|restart|enable)\s+(\S+)", re.I),
    ],
    "KERNEL_ALERT": [
        re.compile(r"kernel:\s+\[?\s*[\d.]+\]?\s*(.*)", re.I),
        re.compile(r"segfault|oom-killer|panic|oops", re.I),
        re.compile(r"Out\s+of\s+memory", re.I),
    ],
    "LOG_TAMPERING": [
        re.compile(r"(?:truncat|delet|clear|rotat).*(?:log|syslog|auth\.log|messages)", re.I),
        re.compile(r"journal.*(?:vacuum|rotate|flush)", re.I),
        re.compile(r"logrotate", re.I),
        re.compile(r"history\s+-c|>.*\.bash_history|unset\s+HISTFILE", re.I),
    ],
    "FIREWALL_EVENT": [
        re.compile(r"(?:iptables|nftables|ufw|firewalld).*(?:DROP|REJECT|ACCEPT|BLOCK)", re.I),
        re.compile(r"UFW\s+(?:BLOCK|ALLOW|DENY)", re.I),
    ],
    "DISK_EVENT": [
        re.compile(r"(?:mount|umount|fdisk|mkfs|dd\s+if=)", re.I),
        re.compile(r"(?:USB|removable).*(?:attach|detach|insert|remov)", re.I),
    ],
    "PACKAGE_EVENT": [
        re.compile(r"(?:apt|yum|dnf|pip|npm)\s+(?:install|remove|update|upgrade)", re.I),
        re.compile(r"dpkg.*(?:install|remove|configure)", re.I),
    ],
}


class SystemDetector(BaseDetector):
    """Detects system-level events relevant to forensic investigation."""

    def matches(self, line: str) -> bool:
        lower = line.lower()
        return any(kw in lower for kw in [
            "kernel", "systemd", "systemctl", "service",
            "started", "stopped", "failed to start",
            "segfault", "oom-killer", "panic",
            "iptables", "ufw", "firewall",
            "mount", "usb", "removable",
            "logrotate", "truncat", "history -c",
            "dpkg", "apt ", "yum ", "rpm",
            "error", "critical", "emergency", "alert",
        ])

    def parse(self, line: str, context: dict) -> dict:
        event_type = "SYSTEM_EVENT"
        detail = None

        for etype, patterns in SYSTEM_PATTERNS.items():
            for pat in patterns:
                m = pat.search(line)
                if m:
                    event_type = etype
                    groups = m.groups()
                    if groups:
                        detail = groups[0][:200] if groups[0] else None
                    break
            if event_type != "SYSTEM_EVENT":
                break

        # Determine severity hint
        lower = line.lower()
        severity_hint = "INFO"
        if any(kw in lower for kw in ["panic", "segfault", "oom-killer", "emergency"]):
            severity_hint = "CRITICAL"
        elif any(kw in lower for kw in ["failed", "error", "crash", "denied", "block"]):
            severity_hint = "HIGH"
        elif any(kw in lower for kw in ["warning", "warn"]):
            severity_hint = "MEDIUM"

        summary = event_type
        if detail:
            summary += f": {detail[:120]}"
        summary += f" [{severity_hint}]"

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "system_event",
            "source_tool": "system_logs",
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
                "detail": detail,
                "severity_hint": severity_hint,
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
