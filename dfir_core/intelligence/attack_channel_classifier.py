# 2:22 DFIR Framework — Attack Channel Classifier & Kill Chain Mapper
# Classifies observed attack channels and maps to Cyber Kill Chain phases

from collections import Counter, defaultdict
from config import MITRE_ATTACK_DB, IOC_TECHNIQUE_MAP, KILL_CHAIN_PHASES

ATTACK_CHANNELS = {
    "web_application": [
        "http", "https", "waf", "sql", "sqli", "lfi", "xss", "rfi", "rce",
        "path traversal", "directory traversal", "web shell",
        "wordpress", "xmlrpc", "phpmyadmin", "injection",
        "modsecurity", "anomaly score", "owasp",
    ],
    "authentication": [
        "login failed", "authentication failure", "failed password",
        "invalid user", "brute force", "password spray",
        "ssh", "rdp", "vpn", "mfa", "credential",
        "account locked", "account disabled",
    ],
    "network": [
        "port scan", "syn", "icmp", "ldap", "smb", "dns",
        "nmap", "masscan", "lateral", "connection refused",
        "firewall", "iptables", "ufw",
    ],
    "endpoint": [
        "process", "binary", "execution", "service", "registry",
        "powershell", "cmd.exe", "bash", "shell",
        "scheduled task", "crontab", "persistence",
        "mimikatz", "credential dump",
    ],
    "data_integrity": [
        "exfiltrat", "staging", "archive", "compress",
        "encrypt", "ransomware", "deletion", "wipe",
        "log tamper", "history -c",
    ],
    "system_infrastructure": [
        "kernel", "systemd", "service stop", "service start",
        "reboot", "shutdown", "mount", "usb",
        "package install", "dpkg", "apt",
    ],
}


def classify_attack_channels(triaged: list[dict]) -> dict[str, bool]:
    """Classify which attack channels are present in the triaged artifacts."""
    channels = {k: False for k in ATTACK_CHANNELS}
    for a in triaged:
        s = (a.get("content_summary") or "").lower()
        raw = (a.get("raw_content") or "").lower()
        combined = f"{s} {raw}"
        for ch, keywords in ATTACK_CHANNELS.items():
            if any(kw in combined for kw in keywords):
                channels[ch] = True
    return channels


def classify_channel_evidence(triaged: list[dict]) -> dict[str, list[str]]:
    """Return specific keyword evidence for each observed channel."""
    evidence = defaultdict(set)
    for a in triaged:
        s = (a.get("content_summary") or "").lower()
        for ch, keywords in ATTACK_CHANNELS.items():
            for kw in keywords:
                if kw in s:
                    evidence[ch].add(kw)
    return {k: sorted(v) for k, v in evidence.items()}


def map_artifacts_to_mitre(triaged: list[dict]) -> list[dict]:
    """
    Map triaged artifacts to MITRE ATT&CK techniques using
    the IOC_TECHNIQUE_MAP from config.

    Returns list of dicts with artifact_id, technique_id, technique_name,
    tactic, and matched_ioc_type.
    """
    mappings = []
    seen = set()

    for a in triaged:
        summary = (a.get("content_summary") or "").upper()
        metadata = a.get("metadata") or {}
        attack_types = metadata.get("attack_types", [])

        # Check attack types from detector metadata
        ioc_types = list(attack_types)

        # Check content summary against IOC map keys
        for ioc_type in IOC_TECHNIQUE_MAP:
            if ioc_type in summary:
                if ioc_type not in ioc_types:
                    ioc_types.append(ioc_type)

        for ioc_type in ioc_types:
            technique_ids = IOC_TECHNIQUE_MAP.get(ioc_type, [])
            for tid in technique_ids:
                key = (a["artifact_id"], tid)
                if key in seen:
                    continue
                seen.add(key)
                tech = MITRE_ATTACK_DB.get(tid)
                if tech:
                    mappings.append({
                        "artifact_id": a["artifact_id"],
                        "technique_id": tid,
                        "technique_name": tech[0],
                        "tactic": tech[1],
                        "description": tech[2],
                        "matched_ioc_type": ioc_type,
                    })

    return mappings


def map_to_kill_chain(mitre_mappings: list[dict]) -> dict[str, list[str]]:
    """
    Map observed MITRE techniques to Cyber Kill Chain phases.
    Returns dict of phase → list of technique IDs observed.
    """
    observed = {}
    technique_ids = {m["technique_id"] for m in mitre_mappings}

    for phase, techniques in KILL_CHAIN_PHASES.items():
        hits = [t for t in techniques if t in technique_ids]
        if hits:
            observed[phase] = hits

    return observed


def compute_tactic_distribution(mitre_mappings: list[dict]) -> dict[str, int]:
    """Count how many techniques were observed per MITRE ATT&CK tactic."""
    counter = Counter()
    for m in mitre_mappings:
        counter[m["tactic"]] += 1
    return dict(counter.most_common())
