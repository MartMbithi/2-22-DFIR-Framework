#
#   Crafted On Wed Jan 07 2026
#   From his finger tips, through his IDE to your deployment environment at full throttle with no bugs, loss of data,
#   fluctuations, signal interference, or doubt—it can only be
#   the legendary coding wizard, Martin Mbithi (martin@devlan.co.ke, www.martmbithi.github.io)
#
#   www.devlan.co.ke
#   hello@devlan.co.ke
#
#
#   The Devlan Solutions LTD Super Duper User License Agreement
#   Copyright (c) 2022 Devlan Solutions LTD
#
#
#   1. LICENSE TO BE AWESOME
#   Congrats, you lucky human! Devlan Solutions LTD hereby bestows upon you the magical,
#   revocable, personal, non-exclusive, and totally non-transferable right to install this epic system
#   on not one, but TWO separate computers for your personal, non-commercial shenanigans.
#   Unless, of course, you've leveled up with a commercial license from Devlan Solutions LTD.
#   Sharing this software with others or letting them even peek at it? Nope, that's a big no-no.
#   And don't even think about putting this on a network or letting a crowd join the fun unless you
#   first scored a multi-user license from us. Sharing is caring, but rules are rules!
#
#   2. COPYRIGHT POWER-UP
#   This Software is the prized possession of Devlan Solutions LTD and is shielded by copyright law
#   and the forces of international copyright treaties. You better not try to hide or mess with
#   any of our awesome proprietary notices, labels, or marks. Respect the swag!
#
#
#   3. RESTRICTIONS, NO CHEAT CODES ALLOWED
#   You may not, and you shall not let anyone else:
#   (a) reverse engineer, decompile, decode, decrypt, disassemble, or do any sneaky stuff to
#   figure out the source code of this software;
#   (b) modify, remix, distribute, or create your own funky version of this masterpiece;
#   (c) copy (except for that one precious backup), distribute, show off in public, transmit, sell, rent,
#   lease, or otherwise exploit the Software like it's your own.
#
#
#   4. THE ENDGAME
#   This License lasts until one of us says 'Game Over'. You can call it quits anytime by
#   destroying the Software and all the copies you made (no hiding them under your bed).
#   If you break any of these sacred rules, this License self-destructs, and you must obliterate
#   every copy of the Software, no questions asked.
#
#
#   5. NO GUARANTEES, JUST PIXELS
#   DEVLAN SOLUTIONS LTD doesn’t guarantee this Software is flawless—it might have a few
#   quirks, but who doesn’t? DEVLAN SOLUTIONS LTD washes its hands of any other warranties,
#   implied or otherwise. That means no promises of perfect performance, marketability, or
#   non-infringement. Some places have different rules, so you might have extra rights, but don’t
#   count on us for backup if things go sideways. Use at your own risk, brave adventurer!
#
#
#   6. SEVERABILITY—KEEP THE GOOD STUFF
#   If any part of this License gets tossed out by a judge, don’t worry—the rest of the agreement
#   still stands like a boss. Just because one piece fails doesn’t mean the whole thing crumbles.
#
#
#   7. NO DAMAGE, NO DRAMA
#   Under no circumstances will Devlan Solutions LTD or its squad be held responsible for any wild,
#   indirect, or accidental chaos that might come from using this software—even if we warned you!
#   And if you ever think you’ve got a claim, the most you’re getting out of us is the license fee you
#   paid—if any. No drama, no big payouts, just pixels and code.
#
#

import os
import json
import time
import argparse
from datetime import datetime, timezone
import mysql.connector

# ===== Config & Console FX =====
from config.settings import DB_CONFIG
from utils.console_fx import holo_print, pulse, safe_print, stage
from narrative.narrative_generator import NarrativeGenerator


# ===== Core Engines =====
from triage.triage_engine import TriageArtifact
from triage.triage_storage import TriageStore
from triage_semantic.hybrid_scorer import HybridScore

from ingestion.file_ingest import DiscoverAndParseRawFiles
from utils.indicator_normalizer import NormalizeIndicators

from narrative.prompt_builder import BuildIncidentSummaryPrompt
from narrative.narrative_generator import NarrativeGenerator
from narrative_llm.openai_client import OpenAILLMClient

from reporting.report_writer import WriteTXTReport, WritePDFReport
from reporting.report_index import UpdateReportIndex
import argparse

CASE_ID = os.getenv("DFIR_CASE_ID")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--case-id", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-llm", action="store_true")
    return parser.parse_args()


# ---------------- INVESTIGATION GOAL ----------------


INVESTIGATION_GOAL = (
    "Identify malicious execution, persistence mechanisms, "
    "and suspicious file downloads"
)

# ---------------- UI ----------------


def banner():
    holo_print("INITIALIZING 2:22 AI CORE ...")
    holo_print("LINKING DETERMINISTIC + SEMANTIC ENGINES ...")
    safe_print("  2:22 AI :: AUTONOMOUS DIGITAL FORENSIC PIPELINE")
    safe_print("  MODE   : HYBRID ANALYSIS")
    safe_print("  STATUS : OPERATIONAL")


def ok(msg):
    holo_print(f" [OK] {msg}")


def timing(label, start):
    elapsed = time.time() - start
    print(f"   [TIME] {label} completed in {elapsed:.2f}s")

# ---------------- LOGIC ----------------


def DetermineIntensity(triaged):
    if not triaged:
        return "NONE"

    max_score = max(a["final_score"] for a in triaged)

    if max_score >= 0.85:
        return "HIGH"
    elif max_score >= 0.55:
        return "MEDIUM"
    return "LOW"


def persist_artifacts(artifacts, dry_run):
    if dry_run or not artifacts:
        return

    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()

    for a in artifacts:
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
                a["artifact_id"],
                a["case_id"],
                a["artifact_type"],
                a["source_tool"],
                a["source_file"],
                a["host_id"],
                a["user_context"],
                a["artifact_timestamp"],
                a["artifact_path"],
                a["content_summary"],
                a["raw_content"],
                a.get("md5"),
                a.get("sha1"),
                a.get("sha256"),
                json.dumps(a.get("metadata") or {}),
                a["ingested_at"]
            )
        )

    conn.commit()
    cur.close()
    conn.close()


def run_triage(artifacts, dry_run):
    if not artifacts:
        return []

    store = None if dry_run else TriageStore(**DB_CONFIG)
    triaged = []

    for a in artifacts:
        rule = TriageArtifact(a)
        hybrid = HybridScore(
            rule_score=rule["triage_score"],
            artifact_text=a["content_summary"],
            investigation_goal=INVESTIGATION_GOAL
        )

        if store:
            store.InsertTriageResult({
                "artifact_id": a["artifact_id"],
                "triage_score": hybrid["final_score"],
                "score_breakdown": json.dumps(hybrid),
                "triaged_at": datetime.now(timezone.utc)
            })

        triaged.append({
            "artifact_id": a["artifact_id"],
            "artifact_type": a["artifact_type"],
            "content_summary": a["content_summary"],
            "artifact_timestamp": a["artifact_timestamp"],
            "md5": a.get("md5"),
            "sha1": a.get("sha1"),
            "sha256": a.get("sha256"),
            "metadata": a.get("metadata") or {},
            **hybrid
        })

    return triaged


def generate_narrative(triaged, no_llm=False):
    if no_llm:
        return "[LLM disabled] Narrative generation skipped."

    generator = NarrativeGenerator()
    batch_narratives = generator.GenerateBatched(triaged)
    return generator.Synthesize(batch_narratives)


# ---------------- MAIN ----------------


def main():
    args = parse_args()
    case_id = args.case_id
    dry_run = args.dry_run
    no_llm = args.no_llm

    banner()
    total_start = time.time()

    # ===== INGESTION =====
    stage("FILE INGESTION")
    t = time.time()
    pulse("Scanning raw logs")
    raw_artifacts = DiscoverAndParseRawFiles()
    ok(f"Discovered {len(raw_artifacts)} raw artifacts")
    timing("File ingestion", t)

    if not raw_artifacts:
        holo_print("NO ARTIFACTS DETECTED — SAFE TERMINATION")
        return

    # ===== NORMALIZATION =====
    stage("INDICATOR NORMALIZATION")
    t = time.time()
    pulse("Normalizing indicators")
    artifacts = [NormalizeIndicators(a) for a in raw_artifacts]
    ok("Indicators normalized and enriched")
    timing("Indicator normalization", t)

    # ===== PERSISTENCE =====
    stage("ARTIFACT PERSISTENCE")
    t = time.time()
    persist_artifacts(artifacts, args.dry_run)
    ok("Artifacts persisted" if not args.dry_run else "Dry-run: persistence skipped")
    timing("Artifact persistence", t)

    # ===== TRIAGE =====
    stage("TRIAGE & SCORING")
    t = time.time()
    pulse("Scoring artifacts")
    triaged = run_triage(artifacts, args.dry_run)
    timing("Triage execution", t)

    if not triaged:
        holo_print("NO TRIAGE RESULTS — PIPELINE HALTED")
        return

    ok("Triage completed")

    # ===== NARRATIVE =====
    stage("SEMANTIC REASONING")
    t = time.time()
    pulse("Generating narrative")
    narrative = generate_narrative(triaged, args.no_llm)
    ok("Narrative generated" if not args.no_llm else "LLM disabled")
    timing("Narrative generation", t)

    # ===== REPORTING =====
    stage("REPORT GENERATION")
    intensity = DetermineIntensity(triaged)
    case_id = triaged[0]["artifact_id"][:8]

    # txt_report = WriteTXTReport(case_id, narrative, "detailed", triaged)
    pdf_report = WritePDFReport(case_id, narrative, triaged)

    # UpdateReportIndex(case_id, txt_report, intensity)
    UpdateReportIndex(case_id, pdf_report, intensity)

    # ok(f"TXT report generated: {txt_report}")
    ok(f"PDF report generated: {pdf_report}")

    timing("TOTAL PIPELINE", total_start)
    holo_print("CASE SEALED")
    holo_print("FORENSIC CHAIN INTACT")
    safe_print("\n[OK] 2:22 AI PIPELINE EXECUTION COMPLETE\n")


if __name__ == "__main__":
    main()
