# 2:22 DFIR Framework — Main Pipeline Runner
# Orchestrates the complete forensic investigation pipeline:
#   1. Evidence Ingestion
#   2. Indicator Normalization
#   3. Artifact Persistence
#   4. Deterministic Triage
#   5. Hybrid (Semantic) Scoring
#   6. Intelligence Generation
#   7. Narrative Synthesis
#   8. Forensic Report Generation

import os
import json
import time
import argparse
from datetime import datetime, timezone
from typing import Callable

# ─── Config ─────────────────────────────────────────────────────────
from config import (
    DB_CONFIG, DEFAULT_INVESTIGATION_GOAL, FRAMEWORK_NAME,
    FRAMEWORK_VERSION, classify_severity,
)
from utils.console_fx import holo_print, pulse, safe_print, stage, ok, timing

# ─── Core Engines ───────────────────────────────────────────────────
from ingestion.file_ingest import DiscoverAndParseRawFiles
from utils.indicator_normalizer import NormalizeIndicators
from triage.triage_engine import TriageArtifact
from triage.triage_storage import TriageStore
from triage_semantic.hybrid_scorer import HybridScore
from intelligence.case_intelligence import generate_case_intelligence
from narrative.narrative_generator import NarrativeGenerator
from reporting.report_writer import WriteTXTReport, WritePDFReport
from reporting.report_index import UpdateReportIndex


def parse_args():
    parser = argparse.ArgumentParser(
        description=f"{FRAMEWORK_NAME} v{FRAMEWORK_VERSION} — Forensic Pipeline"
    )
    parser.add_argument("--case-id", required=True, help="Case identifier")
    parser.add_argument("--dry-run", action="store_true", help="Skip database persistence")
    parser.add_argument("--no-llm", action="store_true", help="Disable LLM narrative generation")
    parser.add_argument("--goal", type=str, default=None, help="Custom investigation goal")
    return parser.parse_args()


# ─── UI ─────────────────────────────────────────────────────────────

def banner():
    safe_print("")
    safe_print(f"  ╔══════════════════════════════════════════════════════╗")
    safe_print(f"  ║  {FRAMEWORK_NAME} v{FRAMEWORK_VERSION}               ║")
    safe_print(f"  ║  AUTONOMOUS DIGITAL FORENSIC PIPELINE               ║")
    safe_print(f"  ║  MODE: HYBRID ANALYSIS (DETERMINISTIC + SEMANTIC)   ║")
    safe_print(f"  ║  STATUS: OPERATIONAL                                ║")
    safe_print(f"  ╚══════════════════════════════════════════════════════╝")
    safe_print("")


# ─── Persistence ────────────────────────────────────────────────────

def persist_artifacts(artifacts: list[dict], dry_run: bool):
    """Persist normalized artifacts to the forensic database."""
    if dry_run or not artifacts:
        return

    import mysql.connector
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()

    for a in artifacts:
        metadata = a.get("metadata") or {}
        if not isinstance(metadata, str):
            metadata = json.dumps(metadata)

        cur.execute(
            """
            INSERT IGNORE INTO forensic_artifacts (
                artifact_id, case_id, artifact_type, source_tool,
                source_file, host_id, user_context,
                artifact_timestamp, artifact_path,
                content_summary, raw_content,
                md5, sha1, sha256, metadata, ingested_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                a["artifact_id"], a["case_id"], a.get("artifact_type"),
                a.get("source_tool"), a.get("source_file"), a.get("host_id"),
                a.get("user_context"), a.get("artifact_timestamp"),
                a.get("artifact_path"), a.get("content_summary"),
                a.get("raw_content"), a.get("md5"), a.get("sha1"),
                a.get("sha256"), metadata, a.get("ingested_at"),
            ),
        )

    conn.commit()
    cur.close()
    conn.close()


# ─── Triage ─────────────────────────────────────────────────────────

def run_triage(
    artifacts: list[dict],
    investigation_goal: str,
    dry_run: bool,
    progress_callback: Callable | None = None,
) -> list[dict]:
    """Run deterministic triage followed by hybrid semantic scoring."""
    if not artifacts:
        return []

    store = None
    if not dry_run:
        try:
            store = TriageStore(**DB_CONFIG)
        except Exception as e:
            print(f"[WARN] Could not connect to triage store: {e}")

    triaged = []
    total = len(artifacts)

    for idx, a in enumerate(artifacts):
        # Deterministic triage
        triage_result = TriageArtifact(a)

        # Hybrid scoring
        hybrid = HybridScore(
            rule_score=triage_result["triage_score"],
            artifact_text=a.get("content_summary") or "",
            investigation_goal=investigation_goal,
        )

        # Persist triage result
        if store:
            try:
                store.InsertTriageResult({
                    "artifact_id": a["artifact_id"],
                    "triage_score": hybrid["final_score"],
                    "score_breakdown": json.dumps({
                        "rule": triage_result["score_breakdown"],
                        "hybrid": hybrid,
                    }),
                    "triaged_at": datetime.now(timezone.utc),
                })
            except Exception:
                pass

        # Merge artifact data with triage and hybrid scores
        triaged.append({
            **{k: a[k] for k in [
                "artifact_id", "case_id", "artifact_type", "source_tool",
                "source_file", "host_id", "user_context", "artifact_timestamp",
                "content_summary", "raw_content", "md5", "sha1", "sha256",
                "metadata",
            ] if k in a},
            **hybrid,
            "severity": classify_severity(hybrid["final_score"]),
            "triage_features": triage_result.get("features", {}),
        })

        if progress_callback and idx % max(1, total // 20) == 0:
            pct = int((idx / total) * 100)
            progress_callback("triage", pct, f"Scoring artifact {idx+1}/{total}")

    if store:
        store.close()

    if progress_callback:
        progress_callback("triage", 100, "Triage complete")

    return triaged


# ─── Narrative ──────────────────────────────────────────────────────

def generate_narrative(
    triaged: list[dict],
    intel: dict,
    no_llm: bool = False,
) -> str:
    """Generate forensic investigation narrative."""
    generator = NarrativeGenerator()

    if no_llm or not generator.llm_client.is_available():
        return generator.GenerateDeterministic(triaged, intel)

    try:
        batch_narratives = generator.GenerateBatched(triaged)
        return generator.Synthesize(batch_narratives)
    except Exception as e:
        print(f"[WARN] LLM narrative failed, falling back to deterministic: {e}")
        return generator.GenerateDeterministic(triaged, intel)


# ─── Pipeline Entry Points ──────────────────────────────────────────

def run_pipeline(
    case_id: str,
    dry_run: bool = False,
    no_llm: bool = False,
    investigation_goal: str | None = None,
    progress_callback: Callable | None = None,
) -> dict:
    """
    Execute the full DFIR investigation pipeline.

    This is the primary entry point for both CLI and SaaS execution.

    Args:
        case_id: Forensic case identifier
        dry_run: Skip database persistence
        no_llm: Disable LLM narrative generation
        investigation_goal: Custom investigation goal
        progress_callback: Optional fn(stage, percent, message) for SaaS

    Returns:
        dict with pipeline results including report path and intelligence
    """
    goal = investigation_goal or DEFAULT_INVESTIGATION_GOAL
    total_start = time.time()
    results = {"case_id": case_id, "status": "running"}

    def _progress(stg, pct, msg):
        if progress_callback:
            progress_callback(stg, pct, msg)

    # ═══ STAGE 1: INGESTION ═══
    stage("EVIDENCE INGESTION")
    t = time.time()
    pulse("Scanning raw evidence files")
    _progress("ingestion", 0, "Starting evidence ingestion")

    raw_artifacts, evidence_manifest = DiscoverAndParseRawFiles(
        case_id=case_id,
        progress_callback=progress_callback,
    )
    ok(f"Discovered {len(raw_artifacts)} raw artifacts from "
       f"{len(evidence_manifest.get('files_processed', []))} files")
    timing("Evidence ingestion", t)

    if not raw_artifacts:
        holo_print("NO ARTIFACTS DETECTED — SAFE TERMINATION")
        results["status"] = "completed"
        results["artifacts_count"] = 0
        return results

    # ═══ STAGE 2: NORMALIZATION ═══
    stage("INDICATOR NORMALIZATION")
    t = time.time()
    pulse("Normalizing indicators of compromise")
    _progress("normalization", 0, "Normalizing indicators")

    artifacts = [NormalizeIndicators(a) for a in raw_artifacts]
    ok(f"Indicators normalized and enriched for {len(artifacts)} artifacts")
    timing("Indicator normalization", t)
    _progress("normalization", 100, "Normalization complete")

    # ═══ STAGE 3: PERSISTENCE ═══
    stage("ARTIFACT PERSISTENCE")
    t = time.time()
    _progress("persistence", 0, "Persisting artifacts")

    persist_artifacts(artifacts, dry_run)
    ok("Artifacts persisted" if not dry_run else "Dry-run: persistence skipped")
    timing("Artifact persistence", t)
    _progress("persistence", 100, "Persistence complete")

    # ═══ STAGE 4: TRIAGE & SCORING ═══
    stage("HYBRID TRIAGE & SCORING")
    t = time.time()
    pulse("Executing deterministic + semantic triage")

    triaged = run_triage(artifacts, goal, dry_run, progress_callback)

    if not triaged:
        holo_print("NO TRIAGE RESULTS — PIPELINE HALTED")
        results["status"] = "completed"
        results["artifacts_count"] = len(artifacts)
        return results

    ok(f"Triage completed: {len(triaged)} artifacts scored")
    timing("Hybrid triage", t)

    # ═══ STAGE 5: INTELLIGENCE ═══
    stage("INTELLIGENCE GENERATION")
    t = time.time()
    pulse("Generating case intelligence")
    _progress("intelligence", 0, "Generating intelligence")

    intel = generate_case_intelligence(case_id, triaged)
    ok(f"Intelligence generated: {intel.get('mitre_technique_count', 0)} MITRE techniques, "
       f"{intel.get('kill_chain_coverage', 0)}/7 kill chain phases")
    timing("Intelligence generation", t)
    _progress("intelligence", 100, "Intelligence complete")

    # ═══ STAGE 6: NARRATIVE ═══
    stage("NARRATIVE SYNTHESIS")
    t = time.time()
    pulse("Generating forensic narrative")
    _progress("narrative", 0, "Generating narrative")

    narrative = generate_narrative(triaged, intel, no_llm)
    ok("Narrative generated" if not no_llm else "Deterministic narrative generated")
    timing("Narrative synthesis", t)
    _progress("narrative", 100, "Narrative complete")

    # ═══ STAGE 7: REPORTING ═══
    stage("FORENSIC REPORT GENERATION")
    t = time.time()
    _progress("reporting", 0, "Generating forensic report")

    severity = intel.get("overall_severity", "UNKNOWN")

    pdf_report = WritePDFReport(case_id, narrative, triaged, evidence_manifest)
    UpdateReportIndex(case_id, pdf_report, severity, "pdf")
    ok(f"PDF report generated: {pdf_report}")

    txt_report = WriteTXTReport(case_id, narrative, severity, triaged)
    UpdateReportIndex(case_id, txt_report, severity, "txt")
    ok(f"TXT report generated: {txt_report}")

    timing("Report generation", t)
    _progress("reporting", 100, "Reports generated")

    # ═══ COMPLETE ═══
    timing("TOTAL PIPELINE", total_start)
    holo_print("CASE SEALED")
    holo_print("FORENSIC CHAIN INTACT")
    safe_print(f"\n  [OK] {FRAMEWORK_NAME} PIPELINE EXECUTION COMPLETE\n")

    results.update({
        "status": "completed",
        "artifacts_count": len(artifacts),
        "triaged_count": len(triaged),
        "overall_severity": severity,
        "mitre_technique_count": intel.get("mitre_technique_count", 0),
        "kill_chain_coverage": intel.get("kill_chain_coverage", 0),
        "pdf_report_path": pdf_report,
        "txt_report_path": txt_report,
        "intelligence": intel,
        "evidence_manifest": evidence_manifest,
    })

    return results


# ─── CLI Entry Point ────────────────────────────────────────────────

def main():
    args = parse_args()
    banner()
    run_pipeline(
        case_id=args.case_id,
        dry_run=args.dry_run,
        no_llm=args.no_llm,
        investigation_goal=args.goal,
    )


if __name__ == "__main__":
    main()
