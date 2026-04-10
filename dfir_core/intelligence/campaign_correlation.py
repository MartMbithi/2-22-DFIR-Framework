# 2:22 DFIR Framework — Campaign Correlation
# Links cases through shared infrastructure (IPs, domains, hashes)

from collections import defaultdict


def extract_ips_from_artifacts(triaged: list[dict]) -> set[str]:
    """Extract all unique IPs from triaged artifacts."""
    ips = set()
    for a in triaged:
        meta = a.get("metadata") or {}
        # From detector metadata
        for key in ("source_ip", "destination_ip"):
            ip = meta.get(key)
            if ip and ip != "UNKNOWN":
                ips.add(ip)
        # From indicator enrichment
        indicators = meta.get("indicators", {})
        for ip in indicators.get("source_ips", []):
            ips.add(ip)
        # From interpretation strings
        for interp in meta.get("interpretation", []):
            if "IP " in interp:
                parts = interp.split("IP ")
                if len(parts) > 1:
                    ip_part = parts[1].split()[0].rstrip(",;.")
                    ips.add(ip_part)
    return ips


def correlate_cases(cases: dict[str, list[dict]]) -> dict:
    """
    Correlate multiple cases through shared infrastructure.
    Input: {case_id: [triaged_artifacts]}
    Returns campaign clusters linked by shared IPs.
    """
    ip_to_cases = defaultdict(list)
    for case_id, triaged in cases.items():
        ips = extract_ips_from_artifacts(triaged)
        for ip in ips:
            if case_id not in ip_to_cases[ip]:
                ip_to_cases[ip].append(case_id)

    campaigns = {}
    idx = 1
    for ip, linked_cases in ip_to_cases.items():
        if len(linked_cases) > 1:
            campaigns[f"CAMP-{idx:03d}"] = {
                "infrastructure": ip,
                "linked_cases": linked_cases,
                "confidence": round(min(1.0, 0.3 + 0.1 * len(linked_cases)), 2),
            }
            idx += 1

    return campaigns
