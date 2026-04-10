# 2:22 DFIR Framework — Dependency Injection
# Provides authenticated user context and organization scoping

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Subscription
from backend.security import decode_token
from datetime import datetime, timezone

security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve authenticated user from JWT bearer token."""
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    user = db.query(User).filter(User.user_id == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_organization(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> tuple[User, Organization]:
    """Require user to belong to an organization."""
    if not user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with an organization",
        )

    org = (
        db.query(Organization)
        .filter(Organization.organization_id == user.organization_id)
        .first()
    )
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return user, org


def require_active_subscription(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
) -> tuple[User, Organization, Subscription]:
    """Require an active subscription for the organization."""
    user, org = user_org

    sub = (
        db.query(Subscription)
        .filter(
            Subscription.organization_id == org.organization_id,
            Subscription.subscription_status == "active",
            Subscription.subscription_expires_at >= datetime.now(timezone.utc),
        )
        .first()
    )

    if not sub:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Active subscription required. Please subscribe to a plan.",
        )

    return user, org, sub


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if user.user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
