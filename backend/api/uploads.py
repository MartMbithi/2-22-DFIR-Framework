# 2:22 DFIR Framework — Uploads API
import os
import uuid
import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Case, CaseUpload
from backend.deps import require_organization
from backend.schemas import UploadResponse

router = APIRouter(prefix="/uploads", tags=["Uploads"])

BASE_UPLOAD_DIR = os.getenv("UPLOAD_DIR", "data/cases")


@router.post("/{case_id}", response_model=list[UploadResponse])
async def upload_evidence(
    case_id: str,
    files: list[UploadFile] = File(...),
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

    upload_dir = os.path.join(BASE_UPLOAD_DIR, case_id, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    results = []
    for f in files:
        upload_id = str(uuid.uuid4())
        safe_name = f"{upload_id}_{f.filename}"
        dest_path = os.path.join(upload_dir, safe_name)

        with open(dest_path, "wb") as out:
            shutil.copyfileobj(f.file, out)

        size = os.path.getsize(dest_path)

        upload = CaseUpload(
            upload_id=upload_id,
            case_id=case_id,
            organization_id=org.organization_id,
            user_id=user.user_id,
            upload_filename=f.filename,
            upload_path=dest_path,
            upload_size=size,
            upload_mime_type=f.content_type,
            upload_status="uploaded",
            uploaded_at=datetime.now(timezone.utc),
        )
        db.add(upload)
        results.append(upload)

    db.commit()
    return results


@router.get("/{case_id}", response_model=list[UploadResponse])
def list_uploads(
    case_id: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    return (
        db.query(CaseUpload)
        .filter(
            CaseUpload.case_id == case_id,
            CaseUpload.organization_id == org.organization_id,
        )
        .order_by(CaseUpload.uploaded_at.desc())
        .all()
    )
