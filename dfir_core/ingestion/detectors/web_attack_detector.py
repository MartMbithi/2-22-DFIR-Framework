# 2:22 DFIR Framework — Web Attack Detector
# Detects web application attacks from Apache/Nginx access/error logs and ModSecurity audit logs

import re
import uuid
from datetime import datetime, timezone
from .base_detector import BaseDetector

# ─── Attack Signature Database ──────────────────────────────────────
ATTACK_SIGNATURES = {
    "SQL_INJECTION": [
        r"(?:union\s+(?:all\s+)?select)", r"(?:;\s*drop\s+table)",
        r"(?:'\s*or\s+'?\d+\s*=\s*'?\d+)", r"(?:'\s*or\s+'[^']*'\s*=\s*')",
        r"(?:insert\s+into\s+\w+)", r"(?:update\s+\w+\s+set)",
        r"(?:delete\s+from\s+\w+)", r"(?:select\s+.*\s+from\s+information_schema)",
        r"(?:benchmark\s*\(\d+)", r"(?:sleep\s*\(\d+\))",
        r"(?:waitfor\s+delay)", r"(?:having\s+\d+\s*=\s*\d+)",
        r"(?:order\s+by\s+\d+)", r"(?:group\s+by\s+\d+)",
        r"detected\s+sqli", r"libinjection",
        r"APPLICATION-ATTACK-SQLI",
    ],
    "XSS": [
        r"<script[^>]*>", r"javascript\s*:", r"onerror\s*=",
        r"onload\s*=", r"onmouseover\s*=", r"onfocus\s*=",
        r"alert\s*\(", r"document\.cookie", r"document\.write",
        r"window\.location", r"eval\s*\(",
        r"APPLICATION-ATTACK-XSS",
    ],
    "LFI": [
        r"(?:\.\./){2,}", r"(?:\.\./)+etc/(?:passwd|shadow|hosts)",
        r"/proc/self/", r"/var/log/",
        r"(?:php|file|zip|data|expect)://",
        r"/\.git/", r"sftp-config\.json", r"composer\.json",
        r"\.env", r"wp-config\.php",
        r"APPLICATION-ATTACK-LFI",
    ],
    "RFI": [
        r"(?:https?|ftp)://[^/\s]+/[^/\s]+\.(?:php|asp|jsp|txt)",
        r"APPLICATION-ATTACK-RFI",
    ],
    "RCE": [
        r"(?:;|\||&&)\s*(?:cat|ls|id|whoami|uname|pwd|wget|curl|nc|bash|sh)\b",
        r"\$\{.*(?:jndi|rmi|ldap|dns).*\}",  # Log4Shell
        r"(?:system|exec|passthru|shell_exec|popen)\s*\(",
        r"APPLICATION-ATTACK-RCE",
    ],
    "DIRECTORY_TRAVERSAL": [
        r"(?:\\\.\\\.[\\/]){2,}", r"(?:%2e%2e[%2f/\\\\]){2,}",
        r"(?:%c0%ae){2,}", r"(?:\.\.[\\/]){3,}",
    ],
    "WORDPRESS_ATTACK": [
        r"xmlrpc\.php", r"wp-login\.php\?action=",
        r"wp-admin/(?:admin-ajax|setup-config|install)",
        r"wp-content/(?:uploads|plugins)/.*\.php",
    ],
    "WEB_SHELL": [
        r"(?:c99|r57|wso|b374k|alfa|anon)\.php",
        r"(?:cmd|shell|backdoor|webshell)\.(?:php|asp|jsp)",
        r"eval\s*\(\s*(?:base64_decode|gzinflate|gzuncompress|str_rot13)",
    ],
    "PROTOCOL_ABUSE": [
        r"PROTOCOL-ENFORCEMENT",
        r"Host\s+header\s+is\s+a\s+numeric\s+IP",
        r"Multiple/Conflicting\s+Connection\s+Header",
        r"Transfer-Encoding.*chunked.*chunked",
    ],
    "WAF_CORRELATION": [
        r"Inbound\s+Anomaly\s+Score\s+Exceeded",
        r"Anomaly\s+Score\s+\d+",
    ],
    "SCANNER_PROBE": [
        r"(?:nikto|nmap|masscan|sqlmap|dirb|gobuster|wfuzz|nuclei|burp)",
        r"(?:acunetix|nessus|openvas|qualys)",
    ],
}

# Compile all patterns
COMPILED_SIGNATURES = {}
for attack_type, patterns in ATTACK_SIGNATURES.items():
    COMPILED_SIGNATURES[attack_type] = [
        re.compile(p, re.IGNORECASE) for p in patterns
    ]

# ─── Access-log indicators ──────────────────────────────────────────
SUSPICIOUS_STATUS_CODES = {400, 401, 403, 404, 405, 500, 502, 503}
SUSPICIOUS_METHODS = {"CONNECT", "TRACE", "OPTIONS", "PROPFIND", "DELETE", "PUT", "PATCH"}
IP_PATTERN = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b")


class WebAttackDetector(BaseDetector):
    """Detects web application attacks and suspicious HTTP activity."""

    def matches(self, line: str) -> bool:
        lower = line.lower()
        # Check attack signatures
        for patterns in COMPILED_SIGNATURES.values():
            for pat in patterns:
                if pat.search(line):
                    return True
        # Check ModSecurity markers
        if any(kw in lower for kw in ["modsecurity", "owasp_crs", "anomaly score"]):
            return True
        # Check suspicious access patterns in parsed access logs
        if any(kw in lower for kw in [
            "' or ", "union select", "<script", "../", "etc/passwd",
            "wp-login", "xmlrpc", "phpmyadmin", "admin-ajax",
        ]):
            return True
        return False

    def parse(self, line: str, context: dict) -> dict:
        attack_types = []
        matched_signatures = []

        for attack_type, patterns in COMPILED_SIGNATURES.items():
            for pat in patterns:
                m = pat.search(line)
                if m:
                    if attack_type not in attack_types:
                        attack_types.append(attack_type)
                    matched_signatures.append(m.group(0)[:100])
                    break

        primary_attack = attack_types[0] if attack_types else "SUSPICIOUS_REQUEST"

        # Extract source IP
        ip_match = IP_PATTERN.search(line)
        source_ip = ip_match.group(1) if ip_match else "UNKNOWN"

        # Extract URI if present
        uri_match = re.search(r'"(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s+(\S+)', line)
        uri = uri_match.group(1) if uri_match else None

        # Extract status code
        status_match = re.search(r'\s(\d{3})\s', line)
        status_code = int(status_match.group(1)) if status_match else None

        # Build descriptive summary
        summary_parts = [f"{primary_attack} detected from {source_ip}"]
        if uri:
            summary_parts.append(f"targeting {uri[:120]}")
        if status_code:
            summary_parts.append(f"[HTTP {status_code}]")
        if len(attack_types) > 1:
            summary_parts.append(f"(also: {', '.join(attack_types[1:])})")

        return {
            "artifact_id": str(uuid.uuid4()),
            "case_id": context["case_id"],
            "artifact_type": "web_security_event",
            "source_tool": "apache_modsecurity",
            "source_file": context["file"],
            "host_id": context["host"],
            "user_context": None,
            "artifact_timestamp": context.get("parsed_timestamp") or datetime.now(timezone.utc),
            "artifact_path": context["file"],
            "content_summary": " ".join(summary_parts),
            "raw_content": line.strip()[:2000],
            "md5": None,
            "sha1": None,
            "sha256": None,
            "metadata": {
                "attack_types": attack_types,
                "source_ip": source_ip,
                "target_uri": uri,
                "status_code": status_code,
                "matched_signatures": matched_signatures[:10],
                "detector": self.detector_name,
            },
            "ingested_at": datetime.now(timezone.utc),
        }
