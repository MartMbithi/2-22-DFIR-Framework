# 2:22 DFIR Framework — Cases API
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Case
from backend.deps import require_organization
from backend.schemas import CaseCreateRequest, CaseUpdateRequest, CaseResponse

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("/", response_model=CaseResponse, status_code=201)
def create_case(
    payload: CaseCreateRequest,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org
    case = Case(
        case_id=f"CASE-{uuid.uuid4().hex[:8].upper()}",
        organization_id=org.organization_id,
        user_id=user.user_id,
        case_name=payload.case_name,
        case_description=payload.case_description,
        case_status="created",
        case_created_at=datetime.now(timezone.utc),
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/", response_model=list[CaseResponse])
def list_cases(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org
    return (
        db.query(Case)
        .filter(Case.organization_id == org.organization_id)
        .order_by(Case.case_created_at.desc())
        .all()
    )


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    payload: CaseUpdateRequest,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if payload.case_name is not None:
        case.case_name = payload.case_name
    if payload.case_description is not None:
        case.case_description = payload.case_description
    if payload.case_status is not None:
        case.case_status = payload.case_status

    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}", status_code=204)
def delete_case(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    user, org = user_org
    case = db.query(Case).filter(
        Case.case_id == case_id,
        Case.organization_id == org.organization_id,
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    db.delete(case)
    db.commit()
