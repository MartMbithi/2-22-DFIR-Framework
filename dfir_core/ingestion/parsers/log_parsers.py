# 2:22 DFIR Framework — Log Format Parsers
# Parses common log formats into structured dicts for detector consumption

import json
import re
from datetime import datetime, timezone
from typing import Any

# ─── Apache Combined Log Format ────────────────────────────────────
# 192.168.1.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.0" 200 2326 "http://ref.com" "Mozilla/5.0"
APACHE_COMBINED = re.compile(
    r'^(?P<ip>\S+)\s+'          # client IP
    r'(?P<ident>\S+)\s+'        # ident
    r'(?P<user>\S+)\s+'         # auth user
    r'\[(?P<timestamp>[^\]]+)\]\s+'  # timestamp
    r'"(?P<method>\S+)\s+'      # request method
    r'(?P<uri>\S+)\s+'          # request URI
    r'(?P<proto>[^"]+)"\s+'     # protocol
    r'(?P<status>\d{3})\s+'     # status code
    r'(?P<size>\S+)'            # response size
    r'(?:\s+"(?P<referer>[^"]*)"\s+'  # referer (optional)
    r'"(?P<useragent>[^"]*)")?'       # user-agent (optional)
)

# ─── Apache Error Log ──────────────────────────────────────────────
APACHE_ERROR = re.compile(
    r'^\[(?P<timestamp>[^\]]+)\]\s+'
    r'\[(?:(?P<module>\S+):)?(?P<level>\S+)\]\s+'
    r'\[pid\s+(?P<pid>\d+)(?::tid\s+(?P<tid>\d+))?\]\s*'
    r'(?:(?P<errcode>\S+):\s+)?'
    r'(?:\[client\s+(?P<client>[^\]]+)\]\s+)?'
    r'(?P<message>.*)'
)

# ─── ModSecurity Audit Log ─────────────────────────────────────────
MODSEC_MARKER = re.compile(
    r'(?:ModSecurity|modsecurity|mod_security|id\s*"?\d{6,}"?|'
    r'OWASP_CRS|REQUEST-\d+|RESPONSE-\d+|Anomaly\s+Score)',
    re.IGNORECASE,
)

# ─── Syslog (RFC 3164 / RFC 5424) ─────────────────────────────────
SYSLOG_RFC3164 = re.compile(
    r'^(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+'
    r'(?P<host>\S+)\s+'
    r'(?P<process>\S+?)(?:\[(?P<pid>\d+)\])?\s*:\s*'
    r'(?P<message>.*)'
)

# ─── JSON structured log ──────────────────────────────────────────
def _is_json_line(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("{") and stripped.endswith("}")


# ─── Timestamp Parsers ─────────────────────────────────────────────
APACHE_TS_FMT = "%d/%b/%Y:%H:%M:%S %z"
SYSLOG_MONTHS = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}


def parse_apache_timestamp(ts_str: str) -> datetime | None:
    try:
        return datetime.strptime(ts_str, APACHE_TS_FMT)
    except (ValueError, TypeError):
        return None


def parse_syslog_timestamp(ts_str: str) -> datetime | None:
    try:
        parts = ts_str.split()
        month = SYSLOG_MONTHS.get(parts[0], 1)
        day = int(parts[1])
        time_parts = parts[2].split(":")
        now = datetime.now(timezone.utc)
        return datetime(
            now.year, month, day,
            int(time_parts[0]), int(time_parts[1]), int(time_parts[2]),
            tzinfo=timezone.utc,
        )
    except (ValueError, IndexError, TypeError):
        return None


def parse_iso_timestamp(ts_str: str) -> datetime | None:
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def parse_any_timestamp(ts_str: str) -> datetime | None:
    if not ts_str:
        return None
    for parser in (parse_iso_timestamp, parse_apache_timestamp, parse_syslog_timestamp):
        result = parser(ts_str)
        if result:
            return result
    return None


# ─── Public Parser Functions ───────────────────────────────────────

def parse_apache_combined(line: str) -> dict[str, Any] | None:
    m = APACHE_COMBINED.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    return {
        "format": "apache_combined",
        "source_ip": d["ip"],
        "ident": d["ident"],
        "user": d["user"] if d["user"] != "-" else None,
        "timestamp": parse_apache_timestamp(d["timestamp"]),
        "method": d["method"],
        "uri": d["uri"],
        "protocol": d["proto"],
        "status_code": int(d["status"]),
        "response_size": int(d["size"]) if d["size"] != "-" else 0,
        "referer": d.get("referer") or None,
        "user_agent": d.get("useragent") or None,
    }


def parse_apache_error(line: str) -> dict[str, Any] | None:
    m = APACHE_ERROR.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    client = d.get("client")
    client_ip = None
    if client:
        ip_match = re.match(r"(\d+\.\d+\.\d+\.\d+)", client)
        if ip_match:
            client_ip = ip_match.group(1)
    return {
        "format": "apache_error",
        "timestamp": parse_any_timestamp(d["timestamp"]),
        "level": d.get("level"),
        "module": d.get("module"),
        "pid": d.get("pid"),
        "error_code": d.get("errcode"),
        "source_ip": client_ip,
        "message": d["message"],
    }


def parse_syslog(line: str) -> dict[str, Any] | None:
    m = SYSLOG_RFC3164.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    return {
        "format": "syslog",
        "timestamp": parse_syslog_timestamp(d["timestamp"]),
        "host": d["host"],
        "process": d["process"],
        "pid": d.get("pid"),
        "message": d["message"],
    }


def parse_json_log(line: str) -> dict[str, Any] | None:
    if not _is_json_line(line):
        return None
    try:
        data = json.loads(line.strip())
        data["format"] = "json"
        # Normalize common timestamp fields
        for key in ("timestamp", "@timestamp", "time", "datetime", "date"):
            if key in data:
                data["_parsed_timestamp"] = parse_any_timestamp(str(data[key]))
                break
        return data
    except json.JSONDecodeError:
        return None


def detect_and_parse(line: str) -> dict[str, Any] | None:
    """
    Auto-detect log format and return parsed dict, or None if unrecognized.
    """
    stripped = line.strip()
    if not stripped:
        return None

    # Try JSON first (most specific)
    if _is_json_line(stripped):
        return parse_json_log(stripped)

    # Try Apache Combined
    result = parse_apache_combined(stripped)
    if result:
        return result

    # Try Apache Error
    result = parse_apache_error(stripped)
    if result:
        return result

    # Try Syslog
    result = parse_syslog(stripped)
    if result:
        return result

    return None
