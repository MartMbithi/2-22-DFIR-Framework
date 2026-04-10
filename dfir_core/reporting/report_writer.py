# 2:22 DFIR Framework — Forensic Report Writer
# Generates NIST SP 800-86 / ISO 27037 compliant forensic investigation reports
# Report structure follows international DFIR reporting standards
#
# Report Sections:
#   1. Cover Page with Classification
#   2. Document Control & Chain of Custody
#   3. Scope & Authority
#   4. Evidence Handling Statement
#   5. Executive Summary
#   6. Chronological Event Timeline
#   7. MITRE ATT&CK Technique Mapping
#   8. Source IP Concentration Analysis
#   9. Cyber Kill Chain Analysis
#  10. Tactic Distribution
#  11. Case Intelligence Summary
#  12. Behavioral Fingerprint
#  13. Appendix A: Evidence Manifest
#  14. Appendix B: Methodology

import os
from datetime import datetime, timezone
from collections import Counter

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from config import (
    FRAMEWORK_NAME, FRAMEWORK_VERSION, FRAMEWORK_AUTHORITY,
    CASE_STUDY_CONTEXT, MITRE_ATTACK_DB, classify_severity,
    SEVERITY_LEVELS,
)
from intelligence.case_intelligence import generate_case_intelligence

OUTPUT_DIR = os.getenv("DFIR_REPORT_DIR", "reports")
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")

# ─── Color Palette ──────────────────────────────────────────────────
CLR_PRIMARY = colors.HexColor("#1a1a2e")
CLR_ACCENT = colors.HexColor("#0f3460")
CLR_HEADER_BG = colors.HexColor("#16213e")
CLR_ROW_ALT = colors.HexColor("#f0f2f5")
CLR_BORDER = colors.HexColor("#dee2e6")
CLR_CRITICAL = colors.HexColor("#dc3545")
CLR_HIGH = colors.HexColor("#fd7e14")
CLR_MEDIUM = colors.HexColor("#ffc107")
CLR_LOW = colors.HexColor("#0dcaf0")
CLR_INFO = colors.HexColor("#6c757d")

SEVERITY_COLORS = {
    "CRITICAL": CLR_CRITICAL,
    "HIGH": CLR_HIGH,
    "MEDIUM": CLR_MEDIUM,
    "LOW": CLR_LOW,
    "INFO": CLR_INFO,
}


def _register_font():
    font_path = os.path.join(FONT_DIR, "Jost.ttf")
    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(TTFont("Jost", font_path))
            return "Jost"
        except Exception:
            pass
    return "Helvetica"


def _ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def _ts():
    return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


def _now_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def _build_styles(font: str) -> dict:
    return {
        "cover_title": ParagraphStyle(
            "CoverTitle", fontName=font, fontSize=22, leading=28,
            alignment=TA_CENTER, spaceAfter=12, textColor=CLR_PRIMARY,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub", fontName=font, fontSize=12, leading=18,
            alignment=TA_CENTER, spaceAfter=6, textColor=CLR_ACCENT,
        ),
        "cover_meta": ParagraphStyle(
            "CoverMeta", fontName=font, fontSize=10, leading=15,
            alignment=TA_CENTER, spaceAfter=4, textColor=colors.grey,
        ),
        "h1": ParagraphStyle(
            "H1", fontName=font, fontSize=16, leading=22,
            spaceBefore=24, spaceAfter=12, textColor=CLR_PRIMARY,
        ),
        "h2": ParagraphStyle(
            "H2", fontName=font, fontSize=13, leading=18,
            spaceBefore=16, spaceAfter=8, textColor=CLR_ACCENT,
        ),
        "h3": ParagraphStyle(
            "H3", fontName=font, fontSize=11, leading=15,
            spaceBefore=10, spaceAfter=6, textColor=CLR_ACCENT,
        ),
        "body": ParagraphStyle(
            "Body", fontName=font, fontSize=10, leading=16,
            alignment=TA_JUSTIFY, spaceAfter=8,
        ),
        "body_small": ParagraphStyle(
            "BodySmall", fontName=font, fontSize=9, leading=14,
            alignment=TA_LEFT, spaceAfter=6,
        ),
        "mono": ParagraphStyle(
            "Mono", fontName="Courier", fontSize=8, leading=12,
            alignment=TA_LEFT, spaceAfter=4,
        ),
        "classification": ParagraphStyle(
            "Classification", fontName=font, fontSize=10, leading=14,
            alignment=TA_CENTER, textColor=colors.white,
        ),
        "footer": ParagraphStyle(
            "Footer", fontName=font, fontSize=8, leading=10,
            alignment=TA_CENTER, textColor=colors.grey,
        ),
    }


def _std_table_style(font: str):
    return TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 8.5),
        ("BACKGROUND", (0, 0), (-1, 0), CLR_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, CLR_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CLR_ROW_ALT]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ])


def _hr():
    return HRFlowable(width="100%", thickness=0.5, color=CLR_BORDER, spaceAfter=12)


# ════════════════════════════════════════════════════════════════════
#  PUBLIC API
# ════════════════════════════════════════════════════════════════════

def WriteTXTReport(
    case_id: str, narrative: str, intensity: str, triaged: list[dict] | None = None
) -> str:
    """Write a plain-text forensic report."""
    _ensure_output_dir()
    path = os.path.join(OUTPUT_DIR, f"{case_id}_{_ts()}_{intensity}.txt")

    with open(path, "w", encoding="utf-8") as f:
        f.write(f"{'='*70}\n")
        f.write(f"  {FRAMEWORK_NAME} v{FRAMEWORK_VERSION}\n")
        f.write(f"  FORENSIC INVESTIGATION REPORT\n")
        f.write(f"  Case ID: {case_id}\n")
        f.write(f"  Generated: {_now_str()}\n")
        f.write(f"  Severity: {intensity}\n")
        f.write(f"{'='*70}\n\n")
        f.write(narrative)
        if triaged:
            f.write(f"\n\n{'='*70}\n")
            f.write("  ARTIFACT EVIDENCE TABLE\n")
            f.write(f"{'='*70}\n\n")
            for a in sorted(triaged, key=lambda x: x.get("artifact_timestamp") or ""):
                ts = a.get("artifact_timestamp", "N/A")
                if hasattr(ts, "isoformat"):
                    ts = ts.isoformat()
                score = a.get("final_score", a.get("triage_score", 0))
                f.write(f"  [{ts}] (score={score:.3f}) {a.get('content_summary', 'N/A')}\n")

    return path


def WritePDFReport(
    case_id: str,
    narrative: str,
    triaged: list[dict],
    evidence_manifest: dict | None = None,
) -> str:
    """
    Generate a comprehensive forensic investigation report in PDF format.
    Follows NIST SP 800-86 and ISO/IEC 27037 reporting standards.
    """
    _ensure_output_dir()
    font = _register_font()
    styles = _build_styles(font)
    tbl_style = _std_table_style(font)

    # Generate intelligence
    intel = generate_case_intelligence(case_id, triaged)
    severity = intel.get("overall_severity", "UNKNOWN")

    path = os.path.join(OUTPUT_DIR, f"{case_id}_{_ts()}_dfir_report.pdf")

    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm,
        title=f"DFIR Report — Case {case_id}",
        author=FRAMEWORK_NAME,
    )

    story = []

    # ════════════════════════════════════════════════════════════
    #  COVER PAGE
    # ════════════════════════════════════════════════════════════
    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph(
        "DIGITAL FORENSIC<br/>INCIDENT REPORT", styles["cover_title"]
    ))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(FRAMEWORK_NAME, styles["cover_sub"]))
    story.append(Paragraph(f"Version {FRAMEWORK_VERSION}", styles["cover_meta"]))
    story.append(Spacer(1, 1.5 * cm))
    story.append(_hr())

    # Cover metadata table
    cover_data = [
        ["Case Identifier", case_id],
        ["Report Classification", f"OFFICIAL — {severity} SEVERITY"],
        ["Investigating Authority", FRAMEWORK_AUTHORITY],
        ["Report Generated", _now_str()],
        ["Framework Version", f"{FRAMEWORK_NAME} v{FRAMEWORK_VERSION}"],
        ["Total Artifacts Analyzed", str(len(triaged))],
        ["Overall Threat Level", severity],
    ]
    cover_table = Table(cover_data, colWidths=[6 * cm, 11 * cm])
    cover_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTSIZE", (0, 0), (0, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), CLR_ACCENT),
        ("ALIGN", (0, 0), (0, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.3, CLR_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 2 * cm))
    story.append(Paragraph(
        "<i>This report was generated by the 2:22 Digital Forensic and Incident Response "
        "Framework as part of an automated forensic investigation of county government "
        "information systems. All findings are derived from deterministic analysis of "
        "digital artifacts and are fully reproducible.</i>",
        styles["body_small"],
    ))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 1: DOCUMENT CONTROL
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("1. Document Control", styles["h1"]))
    story.append(_hr())

    story.append(Paragraph("1.1 Report Information", styles["h2"]))
    doc_info = [
        ["Field", "Value"],
        ["Report Title", f"Digital Forensic Incident Report — Case {case_id}"],
        ["Case Reference", case_id],
        ["Date of Report", _now_str()],
        ["Classification", f"OFFICIAL — {severity}"],
        ["Prepared By", f"{FRAMEWORK_NAME} (Automated Analysis)"],
        ["Authorizing Body", FRAMEWORK_AUTHORITY],
        ["Standards Reference", "NIST SP 800-86, NIST SP 800-61r2, ISO/IEC 27037:2012"],
    ]
    doc_table = Table(doc_info, colWidths=[5 * cm, 12 * cm])
    doc_table.setStyle(tbl_style)
    story.append(doc_table)

    story.append(Paragraph("1.2 Distribution", styles["h2"]))
    story.append(Paragraph(
        "This report is classified as OFFICIAL and is intended for distribution "
        "to authorized personnel within the investigating organization. Unauthorized "
        "disclosure of the contents may compromise ongoing investigations.",
        styles["body"],
    ))

    story.append(Paragraph("1.3 Version History", styles["h2"]))
    version_data = [
        ["Version", "Date", "Description", "Author"],
        ["1.0", _now_str()[:10], "Initial automated forensic report", FRAMEWORK_NAME],
    ]
    version_table = Table(version_data, colWidths=[2.5 * cm, 3.5 * cm, 6 * cm, 5 * cm])
    version_table.setStyle(tbl_style)
    story.append(version_table)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 2: SCOPE & AUTHORITY
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("2. Scope and Authority", styles["h1"]))
    story.append(_hr())

    story.append(Paragraph("2.1 Investigation Scope", styles["h2"]))
    story.append(Paragraph(
        f"This investigation was conducted under the {FRAMEWORK_NAME} to analyze "
        "digital artifacts from county government information systems. The scope "
        "encompasses log-based forensic analysis of server access logs, authentication "
        "records, network communication logs, and application activity records generated "
        "by government digital infrastructure.",
        styles["body"],
    ))

    story.append(Paragraph("2.2 Legal Authority", styles["h2"]))
    story.append(Paragraph(
        "This investigation is authorized under the ICT and digital governance mandate "
        "of the Government of Makueni County. The analysis is conducted in accordance "
        "with the Kenya Computer Misuse and Cybercrimes Act (2018), the Data Protection "
        "Act (2019), and applicable institutional cybersecurity policies.",
        styles["body"],
    ))

    story.append(Paragraph("2.3 Limitations", styles["h2"]))
    story.append(Paragraph(
        "This analysis is limited to log-based forensic artifacts and does not include "
        "full-scale network forensics, malware reverse engineering, or physical device "
        "forensics. The investigation focuses on indicators of compromise observable "
        "through system-generated log data. Semantic analysis is used only for narrative "
        "synthesis and does not modify underlying evidence.",
        styles["body"],
    ))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 3: EVIDENCE HANDLING
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("3. Evidence Handling Statement", styles["h1"]))
    story.append(_hr())

    story.append(Paragraph("3.1 Evidence Integrity Assurance", styles["h2"]))
    story.append(Paragraph(
        "All digital artifacts analyzed in this investigation were processed in "
        "accordance with the following forensic integrity principles:<br/><br/>"
        "&bull; Original evidence files remain unaltered throughout the investigation<br/>"
        "&bull; SHA-256 cryptographic hashes computed at ingestion for integrity verification<br/>"
        "&bull; All triage scoring is deterministic and fully reproducible<br/>"
        "&bull; Semantic reasoning does not modify underlying evidence<br/>"
        "&bull; LLM-generated narratives are used only for summary synthesis<br/>"
        "&bull; Complete audit trail maintained for all forensic processing stages",
        styles["body"],
    ))

    if evidence_manifest:
        story.append(Paragraph("3.2 Evidence Files Processed", styles["h2"]))
        ev_rows = [["File", "Size (bytes)", "SHA-256 Hash", "Lines", "Artifacts"]]
        for f in evidence_manifest.get("files_processed", []):
            ev_rows.append([
                Paragraph(f.get("filename", "N/A"), styles["mono"]),
                str(f.get("size_bytes", "N/A")),
                Paragraph(f.get("sha256", "N/A")[:32] + "...", styles["mono"]),
                str(f.get("lines_scanned", 0)),
                str(f.get("artifacts_extracted", 0)),
            ])
        if len(ev_rows) > 1:
            ev_table = Table(ev_rows, colWidths=[4 * cm, 2.5 * cm, 5 * cm, 2 * cm, 2.5 * cm])
            ev_table.setStyle(tbl_style)
            story.append(ev_table)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 4: EXECUTIVE SUMMARY
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("4. Executive Summary", styles["h1"]))
    story.append(_hr())

    # Summary metrics box
    metrics = [
        ["Total Artifacts", "Overall Severity", "MITRE Techniques", "Kill Chain Phases", "Active Channels"],
        [
            str(len(triaged)),
            severity,
            str(intel.get("mitre_technique_count", 0)),
            f"{intel.get('kill_chain_coverage', 0)}/7",
            str(len(intel.get("active_channels", []))),
        ],
    ]
    metrics_table = Table(metrics, colWidths=[3.4 * cm] * 5)
    metrics_style = TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, 1), 14),
        ("BACKGROUND", (0, 0), (-1, 0), CLR_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.3, CLR_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])
    metrics_table.setStyle(metrics_style)
    story.append(metrics_table)
    story.append(Spacer(1, 0.5 * cm))

    # Narrative text
    for paragraph in narrative.split("\n\n"):
        paragraph = paragraph.strip()
        if paragraph:
            story.append(Paragraph(paragraph, styles["body"]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 5: CHRONOLOGICAL EVENT TIMELINE
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("5. Chronological Event Timeline", styles["h1"]))
    story.append(_hr())
    story.append(Paragraph(
        "The following table presents forensic events ordered chronologically. "
        "Events are colour-coded by severity classification.",
        styles["body"],
    ))

    sorted_artifacts = sorted(triaged, key=lambda x: str(x.get("artifact_timestamp") or ""))
    timeline_rows = [["Timestamp (UTC)", "Severity", "Score", "Event Description"]]

    # Limit to top 200 for readability
    display_artifacts = sorted_artifacts[:200]
    for a in display_artifacts:
        ts = a.get("artifact_timestamp", "N/A")
        if hasattr(ts, "strftime"):
            ts = ts.strftime("%Y-%m-%d %H:%M:%S")
        score = a.get("final_score", a.get("triage_score", 0))
        sev = classify_severity(score)
        summary = (a.get("content_summary") or "N/A")[:100]
        timeline_rows.append([str(ts), sev, f"{score:.3f}", summary])

    if len(sorted_artifacts) > 200:
        timeline_rows.append(["...", "...", "...",
                              f"({len(sorted_artifacts) - 200} additional events omitted)"])

    timeline_table = Table(
        timeline_rows,
        colWidths=[4 * cm, 2 * cm, 1.8 * cm, 9.2 * cm],
        repeatRows=1,
    )
    tl_style = list(tbl_style.getCommands())
    # Color-code severity cells
    for i, row in enumerate(timeline_rows[1:], start=1):
        sev = row[1]
        clr = SEVERITY_COLORS.get(sev, CLR_INFO)
        tl_style.append(("TEXTCOLOR", (1, i), (1, i), clr))
    timeline_table.setStyle(TableStyle(tl_style))
    story.append(timeline_table)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 6: MITRE ATT&CK MAPPING
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("6. MITRE ATT&CK Technique Mapping", styles["h1"]))
    story.append(_hr())
    story.append(Paragraph(
        "The following table maps observed forensic indicators to the MITRE ATT&CK "
        "framework (v14). Technique mappings are derived from deterministic pattern "
        "matching against the artifact content and detector metadata.",
        styles["body"],
    ))

    mitre_mappings = intel.get("mitre_mappings", [])
    if mitre_mappings:
        # Deduplicate by technique
        seen_techniques = {}
        for m in mitre_mappings:
            tid = m["technique_id"]
            if tid not in seen_techniques:
                seen_techniques[tid] = {
                    "technique_id": tid,
                    "technique_name": m["technique_name"],
                    "tactic": m["tactic"],
                    "ioc_types": set(),
                    "artifact_count": 0,
                }
            seen_techniques[tid]["ioc_types"].add(m["matched_ioc_type"])
            seen_techniques[tid]["artifact_count"] += 1

        mitre_rows = [["Technique ID", "Technique Name", "Tactic", "IoC Types", "Artifacts"]]
        for tid, info in sorted(seen_techniques.items()):
            mitre_rows.append([
                tid,
                info["technique_name"],
                info["tactic"],
                ", ".join(sorted(info["ioc_types"])),
                str(info["artifact_count"]),
            ])

        mitre_table = Table(
            mitre_rows,
            colWidths=[2.5 * cm, 4.5 * cm, 3.5 * cm, 4 * cm, 2.5 * cm],
            repeatRows=1,
        )
        mitre_table.setStyle(tbl_style)
        story.append(mitre_table)
    else:
        story.append(Paragraph(
            "No MITRE ATT&CK technique mappings were identified from the analyzed artifacts.",
            styles["body"],
        ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 7: SOURCE IP ANALYSIS
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("7. Source IP Concentration Analysis", styles["h1"]))
    story.append(_hr())

    top_ips = intel.get("top_source_ips", [])
    if top_ips:
        ip_rows = [["Source IP", "Event Count", "Associated Attack Types"]]
        for ip_info in top_ips[:20]:
            attacks = ", ".join(ip_info.get("attack_types", [])) or "General activity"
            ip_rows.append([ip_info["ip"], str(ip_info["event_count"]), attacks])

        ip_table = Table(ip_rows, colWidths=[4 * cm, 3 * cm, 10 * cm], repeatRows=1)
        ip_table.setStyle(tbl_style)
        story.append(ip_table)
    else:
        story.append(Paragraph("No source IP data available for analysis.", styles["body"]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 8: CYBER KILL CHAIN ANALYSIS
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("8. Cyber Kill Chain Analysis", styles["h1"]))
    story.append(_hr())
    story.append(Paragraph(
        "The following analysis maps observed MITRE ATT&CK techniques to the "
        "Lockheed Martin Cyber Kill Chain model to assess the depth of adversary "
        "progression through the attack lifecycle.",
        styles["body"],
    ))

    kill_chain = intel.get("kill_chain_phases", {})
    all_phases = [
        "Reconnaissance", "Weaponization", "Delivery", "Exploitation",
        "Installation", "Command & Control", "Actions on Objectives",
    ]

    kc_rows = [["Kill Chain Phase", "Status", "Observed Techniques"]]
    for phase in all_phases:
        techniques = kill_chain.get(phase, [])
        status = "OBSERVED" if techniques else "Not Observed"
        tech_names = []
        for tid in techniques:
            t = MITRE_ATTACK_DB.get(tid)
            if t:
                tech_names.append(f"{tid} ({t[0]})")
        kc_rows.append([
            phase,
            status,
            ", ".join(tech_names) if tech_names else "—",
        ])

    kc_table = Table(kc_rows, colWidths=[4 * cm, 3 * cm, 10 * cm], repeatRows=1)
    kc_style = list(tbl_style.getCommands())
    for i, row in enumerate(kc_rows[1:], start=1):
        if row[1] == "OBSERVED":
            kc_style.append(("TEXTCOLOR", (1, i), (1, i), CLR_CRITICAL))
    kc_table.setStyle(TableStyle(kc_style))
    story.append(kc_table)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 9: CASE INTELLIGENCE SUMMARY
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("9. Case Intelligence Summary", styles["h1"]))
    story.append(_hr())

    story.append(Paragraph("9.1 Attack Channel Classification", styles["h2"]))
    channels = intel.get("attack_channels", {})
    ch_rows = [["Attack Channel", "Status", "Evidence Keywords"]]
    channel_evidence = intel.get("channel_evidence", {})
    for ch, active in channels.items():
        evidence = channel_evidence.get(ch, [])
        ch_rows.append([
            ch.replace("_", " ").title(),
            "Active" if active else "Not Observed",
            ", ".join(evidence[:5]) if evidence else "—",
        ])

    ch_table = Table(ch_rows, colWidths=[4.5 * cm, 3 * cm, 9.5 * cm], repeatRows=1)
    ch_table.setStyle(tbl_style)
    story.append(ch_table)

    story.append(Paragraph("9.2 Tactic Distribution", styles["h2"]))
    tactic_dist = intel.get("tactic_distribution", {})
    if tactic_dist:
        td_rows = [["MITRE ATT&CK Tactic", "Observed Techniques"]]
        for tactic, count in sorted(tactic_dist.items(), key=lambda x: -x[1]):
            td_rows.append([tactic, str(count)])
        td_table = Table(td_rows, colWidths=[10 * cm, 7 * cm])
        td_table.setStyle(tbl_style)
        story.append(td_table)

    story.append(Paragraph("9.3 Severity Distribution", styles["h2"]))
    sev_dist = intel.get("severity_distribution", {})
    if sev_dist:
        sd_rows = [["Severity Level", "Artifact Count", "Percentage"]]
        total = sum(sev_dist.values())
        for sev_level in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
            count = sev_dist.get(sev_level, 0)
            pct = f"{(count / max(total, 1)) * 100:.1f}%"
            sd_rows.append([sev_level, str(count), pct])
        sd_table = Table(sd_rows, colWidths=[5 * cm, 6 * cm, 6 * cm])
        sd_table.setStyle(tbl_style)
        story.append(sd_table)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  SECTION 10: BEHAVIORAL FINGERPRINT
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("10. Behavioral Fingerprint", styles["h1"]))
    story.append(_hr())
    story.append(Paragraph(
        "The behavioral fingerprint characterizes the observed attack activity "
        "based on temporal patterns, velocity, and tooling consistency. This "
        "analysis assists in assessing whether the observed activity reflects "
        "automated scanning, targeted intrusion, or opportunistic exploitation.",
        styles["body"],
    ))

    fp = intel.get("behavioral_fingerprint", {})
    fp_rows = [["Behavioral Attribute", "Observed Value"]]
    fp_fields = [
        ("Total Artifacts Analyzed", "total_artifacts"),
        ("Attack Velocity", "attack_velocity"),
        ("Temporal Pattern", "time_pattern"),
        ("Peak Activity Hour", "peak_activity_hour"),
        ("Peak Activity Day", "peak_activity_day"),
        ("Tooling Consistency", "tooling_consistency"),
        ("Automation Likelihood", "automation_likelihood"),
        ("Investigation Time Span (hours)", "time_span_hours"),
        ("Unique Event Ratio", "unique_event_ratio"),
        ("Distinct Attack Types", "distinct_attack_count"),
    ]
    for label, key in fp_fields:
        val = fp.get(key, "N/A")
        fp_rows.append([label, str(val)])

    fp_table = Table(fp_rows, colWidths=[8 * cm, 9 * cm])
    fp_table.setStyle(tbl_style)
    story.append(fp_table)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    #  APPENDIX A: METHODOLOGY
    # ════════════════════════════════════════════════════════════
    story.append(Paragraph("Appendix A: Investigation Methodology", styles["h1"]))
    story.append(_hr())

    story.append(Paragraph(
        f"This investigation was conducted using the {FRAMEWORK_NAME} version "
        f"{FRAMEWORK_VERSION}, an automated digital forensic and incident response "
        "platform developed for log-based cyber incident investigation in county "
        "government information systems.",
        styles["body"],
    ))

    story.append(Paragraph("A.1 Analysis Pipeline", styles["h2"]))
    story.append(Paragraph(
        "The forensic analysis pipeline consists of the following stages:<br/><br/>"
        "<b>Stage 1 — Evidence Ingestion:</b> Raw log files are discovered, parsed, "
        "and classified by specialized detectors (web attack, authentication, network, "
        "process execution, file system, and system event detectors). SHA-256 hashes "
        "are computed for each source file to ensure evidence integrity.<br/><br/>"
        "<b>Stage 2 — Indicator Normalization:</b> Extracted artifacts are enriched "
        "with indicators of compromise including IP addresses, URLs, domains, hashes, "
        "and decoded payloads.<br/><br/>"
        "<b>Stage 3 — Deterministic Triage:</b> Each artifact is scored using a "
        "weighted feature extraction model that evaluates temporal relevance, keyword "
        "severity, artifact type, attack classification, and failure indicators.<br/><br/>"
        "<b>Stage 4 — Semantic Analysis:</b> Artifact content is compared against the "
        "investigation goal using sentence embedding similarity. The semantic score is "
        "combined with the deterministic score to produce a hybrid triage score.<br/><br/>"
        "<b>Stage 5 — Intelligence Generation:</b> Attack channels are classified, "
        "MITRE ATT&CK techniques mapped, Cyber Kill Chain phases identified, and "
        "behavioral fingerprints generated.<br/><br/>"
        "<b>Stage 6 — Narrative Synthesis:</b> Forensic narratives are generated "
        "either through LLM-assisted synthesis or deterministic templates.<br/><br/>"
        "<b>Stage 7 — Report Generation:</b> Comprehensive forensic reports are "
        "generated in compliance with NIST SP 800-86 and ISO/IEC 27037 standards.",
        styles["body"],
    ))

    story.append(Paragraph("A.2 Standards Compliance", styles["h2"]))
    story.append(Paragraph(
        "This report is structured in accordance with:<br/><br/>"
        "&bull; <b>NIST SP 800-86</b> — Guide to Integrating Forensic Techniques into Incident Response<br/>"
        "&bull; <b>NIST SP 800-61r2</b> — Computer Security Incident Handling Guide<br/>"
        "&bull; <b>ISO/IEC 27037:2012</b> — Guidelines for Identification, Collection, "
        "Acquisition and Preservation of Digital Evidence<br/>"
        "&bull; <b>MITRE ATT&CK v14</b> — Adversarial Tactics, Techniques and Common Knowledge<br/>"
        "&bull; <b>Lockheed Martin Cyber Kill Chain</b> — Attack Lifecycle Model",
        styles["body"],
    ))

    story.append(Paragraph("A.3 Hybrid Scoring Model", styles["h2"]))
    story.append(Paragraph(
        "The 2:22 DFIR Framework employs a hybrid analytical model that combines "
        "deterministic rule-based scoring (weight: 0.65) with semantic similarity "
        "scoring (weight: 0.35). The deterministic component ensures reproducibility "
        "and auditability, while the semantic component provides contextual intelligence. "
        "The semantic layer is advisory only and never modifies the underlying evidence.",
        styles["body"],
    ))

    # ════════════════════════════════════════════════════════════
    #  BUILD DOCUMENT
    # ════════════════════════════════════════════════════════════
    doc.build(story)
    return path
