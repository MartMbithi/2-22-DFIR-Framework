# 2:22 DFIR Framework — Paystack Payment Gateway Service
# Integrates with Paystack for KES payments (M-Pesa, cards, bank transfers)
# Docs: https://paystack.com/docs/api

import os
import uuid
import httpx
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.models import Payment, Subscription, Plan, Organization
from dotenv import load_dotenv

load_dotenv()

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_BASE_URL = "https://api.paystack.co"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def is_configured() -> bool:
    return bool(PAYSTACK_SECRET_KEY) and len(PAYSTACK_SECRET_KEY) > 10


def initialize_transaction(
    email: str,
    amount_kes: float,
    reference: str,
    callback_url: str | None = None,
    metadata: dict | None = None,
) -> dict:
    """
    Initialize a Paystack transaction.
    Amount is in KES — Paystack expects kobo/pesewas (x100).
    """
    if not is_configured():
        # Return mock for development
        return {
            "status": True,
            "data": {
                "authorization_url": f"http://localhost:3000/payment/mock?ref={reference}",
                "access_code": f"mock_{reference[:12]}",
                "reference": reference,
            },
        }

    payload = {
        "email": email,
        "amount": int(amount_kes * 100),  # Convert to kobo
        "currency": "KES",
        "reference": reference,
        "metadata": metadata or {},
    }
    if callback_url:
        payload["callback_url"] = callback_url

    try:
        resp = httpx.post(
            f"{PAYSTACK_BASE_URL}/transaction/initialize",
            json=payload,
            headers=_headers(),
            timeout=30,
        )
        return resp.json()
    except Exception as e:
        return {"status": False, "message": str(e)}


def verify_transaction(reference: str) -> dict:
    """Verify a Paystack transaction by reference."""
    if not is_configured():
        return {
            "status": True,
            "data": {
                "status": "success",
                "reference": reference,
                "amount": 0,
                "currency": "KES",
                "channel": "mock",
            },
        }

    try:
        resp = httpx.get(
            f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
            headers=_headers(),
            timeout=30,
        )
        return resp.json()
    except Exception as e:
        return {"status": False, "message": str(e)}


def create_payment_record(
    db: Session,
    organization_id: str,
    plan: Plan,
    reference: str,
) -> Payment:
    """Create a pending payment record in the database."""
    payment = Payment(
        payment_id=str(uuid.uuid4()),
        organization_id=organization_id,
        payment_amount=float(plan.plan_price),
        payment_currency=plan.plan_currency or "KES",
        payment_status="pending",
        gateway_reference=reference,
        gateway_provider="paystack",
        payment_created_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def activate_subscription(
    db: Session,
    organization_id: str,
    plan: Plan,
    payment: Payment,
) -> Subscription:
    """Create or renew a subscription after successful payment."""
    now = datetime.now(timezone.utc)

    # Determine duration
    if plan.plan_interval == "yearly":
        expires = now + timedelta(days=365)
    elif plan.plan_interval == "one_time":
        expires = now + timedelta(days=36500)  # ~100 years
    else:
        expires = now + timedelta(days=30)

    # Check for existing active subscription
    existing = (
        db.query(Subscription)
        .filter(
            Subscription.organization_id == organization_id,
            Subscription.subscription_status == "active",
        )
        .first()
    )

    if existing:
        # Upgrade — expire old subscription
        existing.subscription_status = "expired"

    sub = Subscription(
        subscription_id=str(uuid.uuid4()),
        organization_id=organization_id,
        plan_id=plan.plan_id,
        subscription_status="active",
        subscription_started_at=now,
        subscription_expires_at=expires,
        payment_reference=payment.gateway_reference,
    )
    db.add(sub)

    # Update payment
    payment.subscription_id = sub.subscription_id
    payment.payment_status = "success"
    payment.payment_completed_at = now

    db.commit()
    db.refresh(sub)
    return sub
