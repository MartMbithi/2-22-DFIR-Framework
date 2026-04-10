# 2:22 DFIR Framework — Users API
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User
from backend.deps import get_current_user, require_admin
from backend.schemas import UserResponse, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return user


@router.get("/", response_model=list[UserResponse])
def list_users(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user.organization_id:
        return [user]
    return (
        db.query(User)
        .filter(User.organization_id == user.organization_id)
        .all()
    )


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(
        User.user_id == user_id,
        User.organization_id == admin.organization_id,
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.user_email:
        target.user_email = payload.user_email
    if payload.user_role:
        target.user_role = payload.user_role
    db.commit()
    db.refresh(target)
    return target
