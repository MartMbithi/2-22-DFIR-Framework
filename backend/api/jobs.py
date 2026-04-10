# 2:22 DFIR Framework — Jobs API
import uuid
import threading
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Job, Case
from backend.deps import require_organization
from backend.schemas import JobCreateRequest, JobResponse
from backend.execution import execute_dfir_pipeline

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobResponse, status_code=201)
def create_job(
    payload: JobCreateRequest,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org

    # Verify case ownership
    case = db.query(Case).filter(
        Case.case_id == payload.case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Check for existing active job
    active = db.query(Job).filter(
        Job.case_id == payload.case_id,
        Job.job_status.in_(["pending", "queued", "running"]),
    ).first()
    if active:
        raise HTTPException(
            status_code=409,
            detail=f"Case already has an active job: {active.job_id}",
        )

    job = Job(
        job_id=str(uuid.uuid4()),
        case_id=payload.case_id,
        organization_id=org.organization_id,
        job_type=payload.job_type,
        job_status="queued",
        job_stage="queued",
        job_progress_percent=0,
        job_progress="Job queued for execution",
        created_at=datetime.now(timezone.utc),
    )
    db.add(job)

    # Update case status
    case.case_status = "processing"
    db.commit()
    db.refresh(job)

    # Launch background thread
    thread = threading.Thread(
        target=execute_dfir_pipeline,
        args=(job.job_id,),
        kwargs={
            "investigation_goal": payload.investigation_goal,
            "no_llm": payload.no_llm,
        },
        daemon=True,
    )
    thread.start()

    return job


@router.get("/", response_model=list[JobResponse])
def list_jobs(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    return (
        db.query(Job)
        .filter(Job.organization_id == org.organization_id)
        .order_by(Job.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.organization_id == org.organization_id,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
