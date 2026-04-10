# 2:22 DFIR Framework — DFIR Execution Engine
# Runs the DFIR core pipeline as a background task, updating job progress

import os
import sys
import glob
import uuid
import subprocess
import traceback
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.models import Job, Report


def _find_latest_report(report_dir: str) -> tuple[str | None, str | None]:
    """Find the most recent PDF and TXT reports in the report directory."""
    pdf_files = sorted(glob.glob(os.path.join(report_dir, "*.pdf")), reverse=True)
    txt_files = sorted(glob.glob(os.path.join(report_dir, "*.txt")), reverse=True)
    # Exclude index.json
    txt_files = [f for f in txt_files if "index.json" not in f]
    return (
        pdf_files[0] if pdf_files else None,
        txt_files[0] if txt_files else None,
    )


def _register_reports(case_id: str, report_dir: str, db: Session):
    """Register generated reports in the database."""
    pdf_path, txt_path = _find_latest_report(report_dir)

    for path, rtype in [(pdf_path, "pdf"), (txt_path, "txt")]:
        if path:
            report = Report(
                report_id=str(uuid.uuid4()),
                case_id=case_id,
                report_type=rtype,
                report_path=path,
                report_generated_at=datetime.now(timezone.utc),
            )
            db.add(report)

    db.commit()


def _update_job(db: Session, job_id: str, **kwargs):
    """Update job fields."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if job:
        for k, v in kwargs.items():
            setattr(job, k, v)
        db.commit()


def execute_dfir_pipeline(job_id: str, investigation_goal: str | None = None, no_llm: bool = False):
    """
    Execute the DFIR core engine for a job.
    Runs as a background task in its own DB session.
    """
    db: Session = SessionLocal()

    try:
        job = db.query(Job).filter(Job.job_id == job_id).first()
        if not job:
            return

        # ── Mark running ──
        job.job_status = "running"
        job.job_stage = "initializing"
        job.job_progress_percent = 5
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        case_id = job.case_id
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))

        # ── Resolve paths ──
        dfir_core_root = os.path.abspath(
            os.path.join(BASE_DIR, "..", "..", "dfir_core")
        )
        upload_dir = os.path.abspath(
            os.path.join(BASE_DIR, "..", "..", "data", "cases", case_id, "uploads")
        )
        report_dir = os.path.join(dfir_core_root, "reports", case_id)
        os.makedirs(report_dir, exist_ok=True)

        # ── Update progress ──
        job.job_stage = "ingestion"
        job.job_progress_percent = 10
        job.job_progress = "Starting evidence ingestion"
        db.commit()

        # ── Prepare environment ──
        env = os.environ.copy()
        existing_path = env.get("PYTHONPATH", "")
        env["PYTHONPATH"] = (
            f"{dfir_core_root}{os.pathsep}{existing_path}"
            if existing_path else dfir_core_root
        )
        env["DFIR_INPUT_DIR"] = upload_dir
        env["DFIR_REPORT_DIR"] = report_dir

        # ── Build command ──
        cmd = [
            sys.executable, "-m", "scripts.run_all",
            "--case-id", case_id,
        ]
        if no_llm or not os.getenv("OPENAI_API_KEY"):
            cmd.append("--no-llm")
        if investigation_goal:
            cmd.extend(["--goal", investigation_goal])

        # ── Execute ──
        job.job_stage = "execution"
        job.job_progress_percent = 20
        job.job_progress = "Running DFIR analysis pipeline"
        db.commit()

        result = subprocess.run(
            cmd,
            cwd=dfir_core_root,
            env=env,
            capture_output=True,
            text=True,
            timeout=3600,  # 1 hour max
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"DFIR engine failed (exit {result.returncode})\n"
                f"STDOUT:\n{result.stdout[-2000:]}\n"
                f"STDERR:\n{result.stderr[-2000:]}"
            )

        # ── Register reports ──
        job.job_stage = "registering_reports"
        job.job_progress_percent = 90
        db.commit()

        _register_reports(case_id, report_dir, db)

        # ── Mark completed ──
        job.job_status = "completed"
        job.job_stage = "completed"
        job.job_progress = "Investigation complete"
        job.job_progress_percent = 100
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception:
        db.rollback()
        try:
            job = db.query(Job).filter(Job.job_id == job_id).first()
            if job:
                job.job_status = "failed"
                job.job_stage = "failed"
                job.job_error = traceback.format_exc()[-3000:]
                job.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass

    finally:
        db.close()
