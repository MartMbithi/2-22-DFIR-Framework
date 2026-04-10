# 2:22 DFIR Framework — Network Activity Detector
# Detects network-related security events: port scans, lateral movement, DNS anomalies, C2

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

IP_PORT = re.compile(r"(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})")
IP_ONLY = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b")

WELL_KNOWN_SUSPICIOUS_PORTS = {
    4444, 5555, 6666, 7777, 8888, 9999,  # common RAT/reverse shell
    1337, 31337, 12345, 54321,             # hacker folklore
    3389,                                   # RDP
    445, 139,                               # SMB
    5900, 5901,                             # VNC
    6379,                                   # Redis
    27017,                                  # MongoDB
    9200, 9300,                             # Elasticsearch
    2049,                                   # NFS
    1433, 3306, 5432,                       # MSSQL, MySQL, Postgres
}

NETWORK_KEYWORDS = {
    "PORT_SCAN": [
        "syn scan", "port scan", "nmap", "masscan", "connection refused",
        "reset by peer", "no route to host",
    ],
    "LATERAL_MOVEMENT": [
        "psexec", "wmic", "wmi ", "winrm", "smbclient", "net use",
        "pass the hash", "pass the ticket", "lateral",
    ],
    "DNS_ANOMALY": [
        "dns query", "nxdomain", "dns tunnel", "txt record",
        "suspicious domain", "dga ", "domain generation",
    ],
    "C2_COMMUNICATION": [
        "beacon", "callback", "heartbeat", "c2 ", "command and control",
        "reverse shell", "bind shell",
    ],
    "DATA_EXFILTRATION": [
        "exfiltrat", "data transfer", "upload", "staging",
        "large outbound", "unusual transfer",
    ],
}


class NetworkDetector(BaseDetector):
    """Detects network security events including scanning, lateral movement, and C2."""

    def matches(self, line: str) -> bool:
        if IP_PORT.search(line):
            return True
        lower = line.lower()
        for keywords in NETWORK_KEYWORDS.values():
            if any(kw in lower for kw in keywords):
                return True
        return False

    def parse(self, line: str, context: dict) -> dict:
        event_type = "NETWORK_CONNECTION"
        source_ip = None
        dest_ip = None
        dest_port = None

        # Extract IP:port pairs
        pairs = IP_PORT.findall(line)
        all_ips = IP_ONLY.findall(line)

        if pairs:
            if len(pairs) >= 2:
                source_ip = pairs[0][0]
                dest_ip = pairs[1][0]
                dest_port = int(pairs[1][1])
            else:
                dest_ip = pairs[0][0]
                dest_port = int(pairs[0][1])
        elif all_ips:
            source_ip = all_ips[0]
            if len(all_ips) > 1:
                dest_ip = all_ips[1]

        # Classify event type
        lower = line.lower()
        for etype, keywords in NETWORK_KEYWORDS.items():
            if any(kw in lower for kw in keywords):
                event_type = etype
                break

        # Check for suspicious ports
        port_alert = ""
        if dest_port and dest_port in WELL_KNOWN_SUSPICIOUS_PORTS:
            port_alert = f" [SUSPICIOUS PORT {dest_port}]"

        summary = f"{event_type}"
        if source_ip:
            summary += f" src={source_ip}"
        if dest_ip:
            summary += f" dst={dest_ip}"
        if dest_port:
            summary += f":{dest_port}"
        summary += port_alert

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "network_event",
            "source_tool": "network_logs",
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
                "source_ip": source_ip,
                "destination_ip": dest_ip,
                "destination_port": dest_port,
                "suspicious_port": dest_port in WELL_KNOWN_SUSPICIOUS_PORTS if dest_port else False,
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
