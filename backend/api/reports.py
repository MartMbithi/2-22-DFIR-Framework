# 2:22 DFIR Framework — Reports API
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Report, Case
from backend.deps import require_organization
from backend.schemas import ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/case/{case_id}", response_model=list[ReportResponse])
def get_reports_for_case(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org

    # Verify case ownership
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return (
        db.query(Report)
        .filter(Report.case_id == case_id)
        .order_by(Report.report_generated_at.desc())
        .all()
    )


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org

    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Verify organization access through case
    case = db.query(Case).filter(
        Case.case_id == report.case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(report.report_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")

    filename = os.path.basename(report.report_path)
    media_type = (
        "application/pdf" if report.report_type == "pdf"
        else "text/plain"
    )

    return FileResponse(
        path=report.report_path,
        filename=filename,
        media_type=media_type,
    )
