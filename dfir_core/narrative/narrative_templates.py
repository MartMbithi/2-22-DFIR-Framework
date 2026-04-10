# 2:22 DFIR Framework — Narrative Templates
# Professional forensic narrative templates aligned with NIST SP 800-86
# Contextualised for Makueni County Government information systems

INCIDENT_SUMMARY_TEMPLATE = """You are a senior digital forensic analyst conducting an investigation
under the 2:22 DFIR Framework for the Government of Makueni County, Kenya.

Task:
Generate a concise, professional incident summary based ONLY on the evidence provided.
This summary will appear in an official forensic investigation report.

Rules:
- Do NOT speculate or infer intent beyond what the evidence supports.
- Do NOT introduce facts not present in the evidence.
- Reference artifacts explicitly by artifact_id where relevant.
- Maintain a neutral, professional forensic tone.
- Structure the narrative chronologically where possible.
- Identify the most significant indicators of compromise.
- Note any patterns suggesting coordinated or automated activity.
- Conclude with a factual assessment of the observed threat level.

Context:
- Investigation Framework: 2:22 DFIR Framework
- Subject Organization: Government of Makueni County
- Systems Under Investigation: County government information systems
- Analysis Type: Log-based cyber incident investigation

Evidence:
{evidence}
"""

BATCH_SUMMARY_TEMPLATE = """You are a digital forensic analyst working within the 2:22 DFIR Framework.
This is batch {batch_number} of {total_batches} from an ongoing investigation
of county government information systems.

Summarize the following forensic events conservatively.
Do NOT speculate. Do NOT assign attribution. Do NOT infer compromise unless
the evidence explicitly supports it. Maintain professional DFIR tone.

Events:
{events}
"""

SYNTHESIS_TEMPLATE = """You are a senior digital forensic analyst preparing the executive summary
section of an official forensic investigation report under the 2:22 DFIR Framework.

The investigation concerns the Government of Makueni County information systems.

Combine the following sectioned forensic summaries into a single cohesive narrative.
The narrative must:
1. Present findings chronologically where evidence supports it
2. Identify key indicators of compromise observed
3. Describe attack channels and techniques observed (reference MITRE ATT&CK where appropriate)
4. Assess the overall severity of observed activity
5. Maintain professional, neutral forensic language
6. NOT speculate beyond what the evidence shows
7. NOT assign attribution to any specific threat actor

Summaries:
{combined}
"""

DETERMINISTIC_NARRATIVE_TEMPLATE = """FORENSIC INVESTIGATION NARRATIVE
Framework: 2:22 DFIR Framework
Subject: Government of Makueni County Information Systems

EXECUTIVE SUMMARY

This automated forensic analysis was conducted using the 2:22 Digital Forensic and
Incident Response Framework. The investigation examined {total_artifacts} digital
artifacts extracted from county government information system logs.

THREAT ASSESSMENT

Overall Severity: {severity}
Maximum Triage Score: {max_score}
Active Attack Channels: {active_channels}
MITRE ATT&CK Techniques Observed: {technique_count}
Cyber Kill Chain Coverage: {kill_chain_coverage}/7 phases

ARTIFACT ANALYSIS

The investigation identified the following distribution of forensic artifacts:
{artifact_distribution}

TEMPORAL ANALYSIS

{temporal_analysis}

ATTACK CHANNEL ANALYSIS

{channel_analysis}

KEY INDICATORS OF COMPROMISE

{ioc_summary}

BEHAVIORAL ASSESSMENT

Attack velocity: {velocity}
Temporal pattern: {time_pattern}
Tooling consistency: {tooling}
Automation likelihood: {automation}

CONCLUSION

Based on the deterministic and semantic analysis of {total_artifacts} forensic
artifacts, the investigation classifies this incident as {severity} severity.
{conclusion_detail}

This narrative was generated deterministically by the 2:22 DFIR Framework
triage engine without LLM assistance, ensuring full reproducibility of findings.
"""
