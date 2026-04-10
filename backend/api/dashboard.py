# 2:22 DFIR Framework — Dashboard API
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import (
    User, Organization, Case, Job, Report,
    ForensicArtifact, CaseUpload,
)
from backend.deps import require_organization
from backend.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    oid = org.organization_id

    total_cases = db.query(Case).filter(Case.organization_id == oid).count()
    open_cases = (
        db.query(Case)
        .filter(Case.organization_id == oid, Case.case_status != "completed")
        .count()
    )
    total_jobs = db.query(Job).filter(Job.organization_id == oid).count()
    active_jobs = (
        db.query(Job)
        .filter(
            Job.organization_id == oid,
            Job.job_status.in_(["queued", "running"]),
        )
        .count()
    )
    completed_jobs = (
        db.query(Job)
        .filter(Job.organization_id == oid, Job.job_status == "completed")
        .count()
    )

    # Reports — join through cases
    case_ids = [
        c.case_id
        for c in db.query(Case.case_id).filter(Case.organization_id == oid).all()
    ]
    total_reports = (
        db.query(Report)
        .filter(Report.case_id.in_(case_ids))
        .count()
        if case_ids
        else 0
    )
    total_artifacts = (
        db.query(ForensicArtifact)
        .filter(ForensicArtifact.case_id.in_(case_ids))
        .count()
        if case_ids
        else 0
    )
    total_uploads = (
        db.query(CaseUpload)
        .filter(CaseUpload.organization_id == oid)
        .count()
    )

    return DashboardStats(
        total_cases=total_cases,
        open_cases=open_cases,
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
        total_reports=total_reports,
        total_artifacts=total_artifacts,
        total_uploads=total_uploads,
    )
