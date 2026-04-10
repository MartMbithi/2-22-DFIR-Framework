# 2:22 DFIR Framework — Configuration & Knowledge Base
# Aligned with NIST SP 800-86, NIST SP 800-61r2, ISO/IEC 27037

import os
from dotenv import load_dotenv

load_dotenv()

# ─── Database ───────────────────────────────────────────────────────
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "dfir_ai"),
}

# ─── OpenAI / LLM ──────────────────────────────────────────────────
OPENAI_CONFIG = {
    "api_key": os.getenv("OPENAI_API_KEY", ""),
    "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    "temperature": float(os.getenv("OPENAI_TEMPERATURE", "0.15")),
    "max_tokens": int(os.getenv("OPENAI_MAX_TOKENS", "1200")),
}

# ─── Paths ──────────────────────────────────────────────────────────
INPUT_DIR = os.getenv("DFIR_INPUT_DIR", "data/raw")
REPORT_DIR = os.getenv("DFIR_REPORT_DIR", "reports")
FONT_DIR = os.getenv("DFIR_FONT_DIR", os.path.join(
    os.path.dirname(__file__), "..", "reporting", "fonts"))

# ─── Semantic Engine ────────────────────────────────────────────────
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RULE_WEIGHT = 0.65
SEMANTIC_WEIGHT = 0.35

# ─── Framework Metadata ────────────────────────────────────────────
FRAMEWORK_NAME = "2:22 DFIR Framework"
FRAMEWORK_VERSION = "2.22.0"
FRAMEWORK_AUTHORITY = (
    "Government of Makueni County — ICT & Digital Governance Directorate"
)
CASE_STUDY_CONTEXT = (
    "Automated Digital Forensic and Incident Response Framework "
    "for Log-Based Cyber Incident Investigation in County Government "
    "Information Systems — Government of Makueni County, Kenya"
)

# ─── Investigation Default Goal ────────────────────────────────────
DEFAULT_INVESTIGATION_GOAL = (
    "Identify unauthorized access, malicious execution, data exfiltration, "
    "persistence mechanisms, web application exploitation, and indicators "
    "of compromise within county government information systems"
)

# ─── Severity Classification (NIST SP 800-61r2 aligned) ────────────
SEVERITY_LEVELS = {
    "CRITICAL": {"min_score": 0.85, "color": "#dc3545", "priority": 1},
    "HIGH":     {"min_score": 0.70, "color": "#fd7e14", "priority": 2},
    "MEDIUM":   {"min_score": 0.50, "color": "#ffc107", "priority": 3},
    "LOW":      {"min_score": 0.25, "color": "#0dcaf0", "priority": 4},
    "INFO":     {"min_score": 0.00, "color": "#6c757d", "priority": 5},
}


def classify_severity(score: float) -> str:
    for level, cfg in SEVERITY_LEVELS.items():
        if score >= cfg["min_score"]:
            return level
    return "INFO"


# ─── MITRE ATT&CK v14 Knowledge Base ───────────────────────────────
# Technique ID → (Name, Tactic, Description)
MITRE_ATTACK_DB = {
    # Initial Access
    "T1190": (
        "Exploit Public-Facing Application",
        "Initial Access",
        "Adversaries exploit vulnerabilities in internet-facing applications "
        "such as web servers, databases, or public-facing services.",
    ),
    "T1133": (
        "External Remote Services",
        "Initial Access",
        "Adversaries leverage external-facing remote services such as VPNs, "
        "Citrix, and RDP to gain initial access.",
    ),
    "T1078": (
        "Valid Accounts",
        "Initial Access",
        "Adversaries obtain and abuse credentials of existing accounts to "
        "gain initial access, persistence, or privilege escalation.",
    ),
    "T1566": (
        "Phishing",
        "Initial Access",
        "Adversaries send phishing messages to gain access to victim systems.",
    ),
    # Execution
    "T1059": (
        "Command and Scripting Interpreter",
        "Execution",
        "Adversaries abuse command and script interpreters to execute commands.",
    ),
    "T1059.001": (
        "PowerShell",
        "Execution",
        "Adversaries abuse PowerShell for execution of commands and scripts.",
    ),
    "T1059.003": (
        "Windows Command Shell",
        "Execution",
        "Adversaries abuse cmd.exe for execution on Windows systems.",
    ),
    "T1059.004": (
        "Unix Shell",
        "Execution",
        "Adversaries abuse Unix shell commands for execution on Linux/macOS.",
    ),
    "T1053": (
        "Scheduled Task/Job",
        "Execution",
        "Adversaries abuse task scheduling functionality to facilitate execution.",
    ),
    # Persistence
    "T1547": (
        "Boot or Logon Autostart Execution",
        "Persistence",
        "Adversaries configure system settings to automatically execute a "
        "program during system boot or logon.",
    ),
    "T1136": (
        "Create Account",
        "Persistence",
        "Adversaries create accounts to maintain access to victim systems.",
    ),
    "T1505.003": (
        "Web Shell",
        "Persistence",
        "Adversaries install web shells on web servers for persistent access.",
    ),
    "T1098": (
        "Account Manipulation",
        "Persistence",
        "Adversaries manipulate accounts to maintain or escalate access.",
    ),
    # Privilege Escalation
    "T1548": (
        "Abuse Elevation Control Mechanism",
        "Privilege Escalation",
        "Adversaries bypass mechanisms designed to control elevated privileges.",
    ),
    "T1068": (
        "Exploitation for Privilege Escalation",
        "Privilege Escalation",
        "Adversaries exploit software vulnerabilities to elevate privileges.",
    ),
    # Defense Evasion
    "T1070": (
        "Indicator Removal",
        "Defense Evasion",
        "Adversaries delete or modify artifacts to remove evidence of intrusion.",
    ),
    "T1070.001": (
        "Clear Windows Event Logs",
        "Defense Evasion",
        "Adversaries clear Windows Event Logs to remove evidence.",
    ),
    "T1070.002": (
        "Clear Linux or Mac System Logs",
        "Defense Evasion",
        "Adversaries clear system logs on Linux/Mac to remove evidence.",
    ),
    "T1036": (
        "Masquerading",
        "Defense Evasion",
        "Adversaries manipulate names or locations of executables to evade defenses.",
    ),
    "T1027": (
        "Obfuscated Files or Information",
        "Defense Evasion",
        "Adversaries encrypt, encode, or obfuscate content to impede detection.",
    ),
    # Credential Access
    "T1110": (
        "Brute Force",
        "Credential Access",
        "Adversaries use brute force techniques to attempt access to accounts.",
    ),
    "T1110.001": (
        "Password Guessing",
        "Credential Access",
        "Adversaries guess passwords to attempt authentication.",
    ),
    "T1110.003": (
        "Password Spraying",
        "Credential Access",
        "Adversaries spray a single password across many accounts.",
    ),
    "T1003": (
        "OS Credential Dumping",
        "Credential Access",
        "Adversaries dump credentials to obtain account login information.",
    ),
    "T1552": (
        "Unsecured Credentials",
        "Credential Access",
        "Adversaries search for insecurely stored credentials.",
    ),
    "T1557": (
        "Adversary-in-the-Middle",
        "Credential Access",
        "Adversaries position themselves between communications to intercept data.",
    ),
    # Discovery
    "T1046": (
        "Network Service Scanning",
        "Discovery",
        "Adversaries scan for services running on remote hosts.",
    ),
    "T1087": (
        "Account Discovery",
        "Discovery",
        "Adversaries attempt to get a listing of accounts on a system.",
    ),
    "T1083": (
        "File and Directory Discovery",
        "Discovery",
        "Adversaries enumerate files and directories on systems.",
    ),
    "T1018": (
        "Remote System Discovery",
        "Discovery",
        "Adversaries attempt to identify other systems on the network.",
    ),
    "T1082": (
        "System Information Discovery",
        "Discovery",
        "Adversaries attempt to get detailed information about the OS and hardware.",
    ),
    # Lateral Movement
    "T1021": (
        "Remote Services",
        "Lateral Movement",
        "Adversaries use valid accounts to interact with remote services.",
    ),
    "T1021.001": (
        "Remote Desktop Protocol",
        "Lateral Movement",
        "Adversaries use RDP to log into computers on the network.",
    ),
    "T1021.004": (
        "SSH",
        "Lateral Movement",
        "Adversaries use SSH to log into remote machines.",
    ),
    # Collection
    "T1005": (
        "Data from Local System",
        "Collection",
        "Adversaries search local system sources to find files of interest.",
    ),
    "T1560": (
        "Archive Collected Data",
        "Collection",
        "Adversaries compress and/or encrypt collected data prior to exfiltration.",
    ),
    "T1114": (
        "Email Collection",
        "Collection",
        "Adversaries collect email from target user mailboxes.",
    ),
    # Command and Control
    "T1071": (
        "Application Layer Protocol",
        "Command and Control",
        "Adversaries communicate using OSI application layer protocols.",
    ),
    "T1571": (
        "Non-Standard Port",
        "Command and Control",
        "Adversaries communicate over non-standard ports to bypass filtering.",
    ),
    "T1573": (
        "Encrypted Channel",
        "Command and Control",
        "Adversaries employ an encrypted channel for C2 communication.",
    ),
    # Exfiltration
    "T1048": (
        "Exfiltration Over Alternative Protocol",
        "Exfiltration",
        "Adversaries steal data by exfiltrating it over an alternative protocol.",
    ),
    "T1041": (
        "Exfiltration Over C2 Channel",
        "Exfiltration",
        "Adversaries steal data by exfiltrating it over existing C2 channels.",
    ),
    # Impact
    "T1486": (
        "Data Encrypted for Impact",
        "Impact",
        "Adversaries encrypt data on target systems to disrupt availability.",
    ),
    "T1489": (
        "Service Stop",
        "Impact",
        "Adversaries stop or disable services on a system.",
    ),
    "T1529": (
        "System Shutdown/Reboot",
        "Impact",
        "Adversaries shut down or reboot systems to disrupt access.",
    ),
    "T1491": (
        "Defacement",
        "Impact",
        "Adversaries modify visual content to intimidate or mislead users.",
    ),
    "T1499": (
        "Endpoint Denial of Service",
        "Impact",
        "Adversaries perform DoS targeting endpoint systems.",
    ),
}

# ─── IoC Pattern → MITRE Technique Mapping ──────────────────────────
# Maps artifact content patterns to MITRE technique IDs
IOC_TECHNIQUE_MAP = {
    # Web attacks
    "SQL_INJECTION":     ["T1190"],
    "XSS":               ["T1190"],
    "LFI":               ["T1190", "T1005"],
    "RFI":               ["T1190"],
    "RCE":               ["T1190", "T1059"],
    "DIRECTORY_TRAVERSAL": ["T1190", "T1083"],
    "WORDPRESS_ATTACK":  ["T1190"],
    "WEB_SHELL":         ["T1505.003"],
    "PROTOCOL_ABUSE":    ["T1071"],
    "WAF_CORRELATION":   ["T1190"],
    # Authentication
    "BRUTE_FORCE":       ["T1110"],
    "PASSWORD_SPRAY":    ["T1110.003"],
    "AUTH_FAILURE":      ["T1110.001"],
    "PRIVILEGE_ESCALATION": ["T1548", "T1068"],
    "ACCOUNT_CREATION":  ["T1136"],
    "ACCOUNT_MODIFICATION": ["T1098"],
    "VALID_ACCOUNTS":    ["T1078"],
    # Execution
    "POWERSHELL_EXEC":   ["T1059.001"],
    "CMD_EXEC":          ["T1059.003"],
    "SHELL_EXEC":        ["T1059.004"],
    "SCHEDULED_TASK":    ["T1053"],
    "CRON_JOB":          ["T1053"],
    # Network
    "PORT_SCAN":         ["T1046"],
    "LATERAL_MOVEMENT":  ["T1021"],
    "RDP_ACCESS":        ["T1021.001"],
    "SSH_ACCESS":        ["T1021.004"],
    "DNS_ANOMALY":       ["T1071"],
    "C2_COMMUNICATION":  ["T1071", "T1573"],
    "NON_STANDARD_PORT": ["T1571"],
    # Defense Evasion
    "LOG_DELETION":      ["T1070"],
    "LOG_TAMPERING":     ["T1070.001", "T1070.002"],
    "OBFUSCATION":       ["T1027"],
    "MASQUERADING":      ["T1036"],
    # Data
    "DATA_EXFILTRATION": ["T1048", "T1041"],
    "DATA_STAGING":      ["T1560"],
    "CREDENTIAL_DUMP":   ["T1003"],
    "EMAIL_COLLECTION":  ["T1114"],
    # Impact
    "RANSOMWARE":        ["T1486"],
    "SERVICE_DISRUPTION": ["T1489"],
    "DEFACEMENT":        ["T1491"],
    "DENIAL_OF_SERVICE": ["T1499"],
    # Access
    "ACCESS_DENIED":     ["T1190", "T1110"],
}

# ─── Cyber Kill Chain Phase Mapping ─────────────────────────────────
KILL_CHAIN_PHASES = {
    "Reconnaissance":    ["T1046", "T1087", "T1082", "T1018", "T1083"],
    "Weaponization":     ["T1027", "T1036"],
    "Delivery":          ["T1566", "T1190", "T1133"],
    "Exploitation":      ["T1190", "T1068", "T1548"],
    "Installation":      ["T1505.003", "T1547", "T1136", "T1053"],
    "Command & Control": ["T1071", "T1571", "T1573"],
    "Actions on Objectives": [
        "T1005", "T1560", "T1048", "T1041", "T1486",
        "T1489", "T1491", "T1499", "T1114",
    ],
}

# ─── Suspicious Keyword Categories for Triage ──────────────────────
SUSPICIOUS_KEYWORDS = {
    "high": [
        "mimikatz", "lazagne", "secretsdump", "hashcat", "hydra",
        "metasploit", "meterpreter", "cobalt strike", "empire",
        "bloodhound", "rubeus", "kerberoast", "pass-the-hash",
        "reverse shell", "bind shell", "web shell", "c99", "r57",
        "ransomware", "encrypt", "bitcoin", "ransom",
        "exfiltrat", "data staging", "credential dump",
        "/etc/passwd", "/etc/shadow", "sam database",
        "nc -e", "ncat", "netcat", "socat",
        "base64 -d", "eval(", "exec(",
    ],
    "medium": [
        "powershell", "cmd.exe", "wget", "curl", "certutil",
        "bitsadmin", "wscript", "cscript", "mshta",
        "regsvr32", "rundll32", "schtasks", "at.exe",
        "psexec", "wmic", "net user", "net localgroup",
        "whoami", "ipconfig", "systeminfo", "tasklist",
        "nmap", "masscan", "nikto", "sqlmap", "dirb", "gobuster",
        "burpsuite", "zaproxy",
        "sudo", "su ", "chmod 777", "chown root",
        "crontab", "at ", ".bash_history",
        "id_rsa", "authorized_keys",
        "union select", "or 1=1", "drop table", "insert into",
        "' or '", "admin'--", "1=1--",
        "../", "..\\", "/etc/", "wp-config", "xmlrpc.php",
        "wp-login", "wp-admin", "phpmyadmin",
        "denied", "forbidden", "unauthorized", "blocked",
    ],
    "low": [
        "failed password", "authentication failure", "invalid user",
        "connection refused", "connection reset", "timeout",
        "404", "403", "500", "502", "503",
        "error", "warning", "critical", "alert",
        "login", "logout", "session",
    ],
}
