# 2:22 DFIR Framework — Artifacts API
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Case, ForensicArtifact, TriageResult
from backend.deps import require_organization
from backend.schemas import ArtifactResponse

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])


@router.get("/case/{case_id}", response_model=list[ArtifactResponse])
def list_case_artifacts(
    case_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org

    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return (
        db.query(ForensicArtifact)
        .filter(ForensicArtifact.case_id == case_id)
        .order_by(ForensicArtifact.ingested_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/case/{case_id}/count")
def count_case_artifacts(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    count = (
        db.query(ForensicArtifact)
        .filter(ForensicArtifact.case_id == case_id)
        .count()
    )
    return {"case_id": case_id, "artifact_count": count}


@router.get("/case/{case_id}/summary")
def artifact_summary(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    """Get artifact type distribution for a case."""
    _, org = user_org
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    from sqlalchemy import func
    results = (
        db.query(
            ForensicArtifact.artifact_type,
            func.count(ForensicArtifact.artifact_id).label("count"),
        )
        .filter(ForensicArtifact.case_id == case_id)
        .group_by(ForensicArtifact.artifact_type)
        .all()
    )

    return {
        "case_id": case_id,
        "distribution": {r[0] or "unknown": r[1] for r in results},
        "total": sum(r[1] for r in results),
    }
