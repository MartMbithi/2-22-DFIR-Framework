# 2:22 DFIR Framework — Organizations API
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization
from backend.deps import get_current_user
from backend.schemas import OrganizationCreateRequest, OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationResponse, status_code=201)
def create_organization(
    payload: OrganizationCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.organization_id:
        raise HTTPException(status_code=409, detail="User already belongs to an organization")

    org = Organization(
        organization_id=str(uuid.uuid4()),
        organization_name=payload.organization_name,
        organization_created_at=datetime.now(timezone.utc),
    )
    db.add(org)

    user.organization_id = org.organization_id
    user.user_role = "admin"
    db.commit()
    db.refresh(org)
    return org


@router.get("/me", response_model=OrganizationResponse)
def get_my_organization(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user.organization_id:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(
        Organization.organization_id == user.organization_id
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
