# 2:22 DFIR Framework — Auth API
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User
from backend.security import verify_password, hash_password, create_access_token
from backend.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_email == payload.email).first()
    if not user or not verify_password(payload.password, user.user_password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.user_id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.user_email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        user_id=str(uuid.uuid4()),
        user_email=payload.email,
        user_password_hash=hash_password(payload.password),
        user_role=payload.role,
        user_created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()

    token = create_access_token(data={"sub": user.user_id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout", status_code=200)
def logout():
    return {"message": "Logged out successfully. Clear token client-side."}
