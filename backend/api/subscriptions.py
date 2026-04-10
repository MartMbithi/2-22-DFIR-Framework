# 2:22 DFIR Framework — Subscriptions & Payments API
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import User, Organization, Plan, Subscription, Payment
from backend.deps import get_current_user, require_organization
from backend.schemas import (
    PlanResponse, SubscriptionResponse, InitiatePaymentRequest,
    PaystackInitResponse, PaymentResponse,
)
from backend.services import paystack

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ─── Plans ──────────────────────────────────────────────────────────

@router.get("/plans", response_model=list[PlanResponse])
def list_plans(db: Session = Depends(get_db)):
    """List all available subscription plans."""
    return db.query(Plan).filter(Plan.plan_active == True).all()


# ─── Current Subscription ──────────────────────────────────────────

@router.get("/current", response_model=SubscriptionResponse | None)
def get_current_subscription(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    """Get the current active subscription for the organization."""
    _, org = user_org
    sub = (
        db.query(Subscription)
        .filter(
            Subscription.organization_id == org.organization_id,
            Subscription.subscription_status == "active",
        )
        .order_by(Subscription.subscription_started_at.desc())
        .first()
    )
    if not sub:
        return None
    return sub


@router.get("/history", response_model=list[SubscriptionResponse])
def subscription_history(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    """Get subscription history for the organization."""
    _, org = user_org
    return (
        db.query(Subscription)
        .filter(Subscription.organization_id == org.organization_id)
        .order_by(Subscription.subscription_started_at.desc())
        .all()
    )


# ─── Payment Initiation ────────────────────────────────────────────

@router.post("/pay", response_model=PaystackInitResponse)
def initiate_payment(
    payload: InitiatePaymentRequest,
    user: User = Depends(get_current_user),
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    """
    Initialize a Paystack payment transaction for a plan.
    Returns an authorization URL to redirect the user to Paystack checkout.
    """
    _, org = user_org

    plan = db.query(Plan).filter(
        Plan.plan_id == payload.plan_id,
        Plan.plan_active == True,
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    reference = f"dfir_{org.organization_id[:8]}_{uuid.uuid4().hex[:12]}"

    # Create payment record
    payment = paystack.create_payment_record(
        db=db,
        organization_id=org.organization_id,
        plan=plan,
        reference=reference,
    )

    # Initialize Paystack transaction
    result = paystack.initialize_transaction(
        email=user.user_email,
        amount_kes=float(plan.plan_price),
        reference=reference,
        callback_url=payload.callback_url,
        metadata={
            "organization_id": org.organization_id,
            "plan_id": plan.plan_id,
            "payment_id": payment.payment_id,
            "plan_name": plan.plan_name,
        },
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=502,
            detail=f"Payment gateway error: {result.get('message', 'Unknown error')}",
        )

    data = result["data"]
    return PaystackInitResponse(
        authorization_url=data["authorization_url"],
        access_code=data["access_code"],
        reference=data["reference"],
    )


# ─── Payment Verification ──────────────────────────────────────────

@router.get("/verify/{reference}")
def verify_payment(
    reference: str,
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    """
    Verify a Paystack payment and activate the subscription if successful.
    Called after Paystack redirects back to the application.
    """
    _, org = user_org

    # Find payment record
    payment = (
        db.query(Payment)
        .filter(
            Payment.gateway_reference == reference,
            Payment.organization_id == org.organization_id,
        )
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if payment.payment_status == "success":
        # Already verified
        sub = (
            db.query(Subscription)
            .filter(Subscription.payment_reference == reference)
            .first()
        )
        return {
            "status": "already_verified",
            "payment_status": "success",
            "subscription_id": sub.subscription_id if sub else None,
        }

    # Verify with Paystack
    result = paystack.verify_transaction(reference)
    if not result.get("status"):
        raise HTTPException(
            status_code=502,
            detail=f"Verification failed: {result.get('message', 'Unknown')}",
        )

    txn_data = result.get("data", {})
    txn_status = txn_data.get("status", "")

    if txn_status != "success":
        payment.payment_status = "failed"
        db.commit()
        return {"status": "failed", "payment_status": "failed", "gateway_status": txn_status}

    # Find the plan from payment metadata or DB
    # Look up the plan from the pending subscription info
    plan = None
    meta = txn_data.get("metadata", {})
    plan_id = meta.get("plan_id")
    if plan_id:
        plan = db.query(Plan).filter(Plan.plan_id == plan_id).first()

    if not plan:
        # Fallback: find from payment amount
        payment.payment_status = "success"
        payment.payment_completed_at = datetime.now(timezone.utc)
        db.commit()
        return {"status": "success", "payment_status": "success", "subscription_id": None}

    # Activate subscription
    sub = paystack.activate_subscription(
        db=db,
        organization_id=org.organization_id,
        plan=plan,
        payment=payment,
    )

    return {
        "status": "success",
        "payment_status": "success",
        "subscription_id": sub.subscription_id,
        "plan_name": plan.plan_name,
        "expires_at": sub.subscription_expires_at.isoformat(),
    }


# ─── Paystack Webhook ──────────────────────────────────────────────

@router.post("/webhook/paystack")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Paystack webhook events (charge.success, etc.).
    This endpoint should be configured in Paystack dashboard.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = body.get("event", "")
    data = body.get("data", {})

    if event == "charge.success":
        reference = data.get("reference")
        if not reference:
            return {"status": "ignored"}

        payment = (
            db.query(Payment)
            .filter(Payment.gateway_reference == reference)
            .first()
        )
        if not payment or payment.payment_status == "success":
            return {"status": "already_processed"}

        meta = data.get("metadata", {})
        plan_id = meta.get("plan_id")
        plan = db.query(Plan).filter(Plan.plan_id == plan_id).first() if plan_id else None

        if plan:
            paystack.activate_subscription(
                db=db,
                organization_id=payment.organization_id,
                plan=plan,
                payment=payment,
            )

    return {"status": "received"}


# ─── Payment History ───────────────────────────────────────────────

@router.get("/payments", response_model=list[PaymentResponse])
def payment_history(
    user_org: tuple = Depends(require_organization),
    db: Session = Depends(get_db),
):
    _, org = user_org
    return (
        db.query(Payment)
        .filter(Payment.organization_id == org.organization_id)
        .order_by(Payment.payment_created_at.desc())
        .all()
    )
