# 2:22 DFIR Framework — Indicator Normalizer & Enricher
# Extracts and normalizes Indicators of Compromise from raw artifact content

import base64
import hashlib
import re
from typing import Any

# ─── Regex Patterns ─────────────────────────────────────────────────
IPV4_PATTERN = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b")
IPV4_PORT_PATTERN = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})\b")
URL_PATTERN = re.compile(
    r"https?://[^\s\"'<>\])+]+", re.IGNORECASE
)
EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
)
DOMAIN_PATTERN = re.compile(
    r"\b(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|ke|co\.ke|go\.ke|"
    r"io|info|biz|xyz|ru|cn|tk|ml|ga|cf)\b",
    re.IGNORECASE,
)
MD5_PATTERN = re.compile(r"\b[a-fA-F0-9]{32}\b")
SHA1_PATTERN = re.compile(r"\b[a-fA-F0-9]{40}\b")
SHA256_PATTERN = re.compile(r"\b[a-fA-F0-9]{64}\b")
BASE64_PATTERN = re.compile(
    r"(?:[A-Za-z0-9+/]{4}){8,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"
)
USER_AGENT_PATTERN = re.compile(r'"([^"]*(?:Mozilla|curl|wget|python|Go-http)[^"]*)"', re.IGNORECASE)

# ─── Private network ranges ────────────────────────────────────────
PRIVATE_RANGES = [
    re.compile(r"^10\."),
    re.compile(r"^172\.(1[6-9]|2\d|3[01])\."),
    re.compile(r"^192\.168\."),
    re.compile(r"^127\."),
    re.compile(r"^0\."),
]


def is_private_ip(ip: str) -> bool:
    return any(p.match(ip) for p in PRIVATE_RANGES)


def _try_base64_decode(token: str) -> str | None:
    if len(token) < 12:
        return None
    try:
        decoded = base64.b64decode(token, validate=True).decode("utf-8", errors="strict")
        if decoded.isprintable() and len(decoded) >= 4:
            return decoded
    except Exception:
        pass
    return None


def compute_content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8", errors="replace")).hexdigest()


def NormalizeIndicators(artifact: dict[str, Any]) -> dict[str, Any]:
    """
    Enriches an artifact dict with extracted IoCs from its raw_content.
    Returns a copy with metadata.indicators and metadata.interpretation populated.
    """
    enriched = artifact.copy()
    raw = artifact.get("raw_content") or ""
    summary = artifact.get("content_summary") or ""
    combined = f"{raw} {summary}"

    indicators: dict[str, list] = {
        "source_ips": [],
        "destination_ips": [],
        "ip_port_pairs": [],
        "urls": [],
        "domains": [],
        "emails": [],
        "hashes_md5": [],
        "hashes_sha1": [],
        "hashes_sha256": [],
        "decoded_payloads": [],
        "user_agents": [],
    }
    interpretations: list[str] = []

    # ── IP:Port extraction ──────────────────────────────────────
    for match in IPV4_PORT_PATTERN.finditer(combined):
        ip, port = match.group(1), match.group(2)
        pair = f"{ip}:{port}"
        if pair not in indicators["ip_port_pairs"]:
            indicators["ip_port_pairs"].append(pair)
            locality = "internal" if is_private_ip(ip) else "external"
            interpretations.append(
                f"Network connection to {locality} IP {ip} on port {port}"
            )

    # ── Standalone IPs ──────────────────────────────────────────
    for match in IPV4_PATTERN.finditer(combined):
        ip = match.group(1)
        if ip not in indicators["source_ips"]:
            indicators["source_ips"].append(ip)

    # ── URLs ────────────────────────────────────────────────────
    for match in URL_PATTERN.finditer(combined):
        url = match.group(0).rstrip(".,;)")
        if url not in indicators["urls"]:
            indicators["urls"].append(url)
            interpretations.append(f"URL reference observed: {url}")

    # ── Domains ─────────────────────────────────────────────────
    for match in DOMAIN_PATTERN.finditer(combined):
        domain = match.group(0).lower()
        if domain not in indicators["domains"]:
            indicators["domains"].append(domain)

    # ── Emails ──────────────────────────────────────────────────
    for match in EMAIL_PATTERN.finditer(combined):
        email = match.group(0).lower()
        if email not in indicators["emails"]:
            indicators["emails"].append(email)
            interpretations.append(f"Email address observed: {email}")

    # ── Hash values ─────────────────────────────────────────────
    for match in SHA256_PATTERN.finditer(combined):
        h = match.group(0).lower()
        if h not in indicators["hashes_sha256"]:
            indicators["hashes_sha256"].append(h)

    for match in SHA1_PATTERN.finditer(combined):
        h = match.group(0).lower()
        if h not in indicators["hashes_sha1"] and h not in [
            x[:40] for x in indicators["hashes_sha256"]
        ]:
            indicators["hashes_sha1"].append(h)

    for match in MD5_PATTERN.finditer(combined):
        h = match.group(0).lower()
        if h not in indicators["hashes_md5"]:
            indicators["hashes_md5"].append(h)

    # ── Base64 decoding ─────────────────────────────────────────
    for match in BASE64_PATTERN.finditer(raw):
        token = match.group(0)
        decoded = _try_base64_decode(token)
        if decoded:
            indicators["decoded_payloads"].append(decoded[:500])
            interpretations.append(
                f"Decoded base64 payload: {decoded[:120]}..."
                if len(decoded) > 120 else f"Decoded base64 payload: {decoded}"
            )

    # ── User agents ─────────────────────────────────────────────
    for match in USER_AGENT_PATTERN.finditer(raw):
        ua = match.group(1)
        if ua not in indicators["user_agents"]:
            indicators["user_agents"].append(ua)

    # ── Content hash for integrity ──────────────────────────────
    if raw:
        enriched["content_hash"] = compute_content_hash(raw)

    # ── Pack metadata ───────────────────────────────────────────
    existing_meta = enriched.get("metadata") or {}
    if isinstance(existing_meta, str):
        existing_meta = {}
    existing_meta["indicators"] = {
        k: v for k, v in indicators.items() if v
    }
    existing_meta["interpretation"] = interpretations
    enriched["metadata"] = existing_meta

    return enriched
