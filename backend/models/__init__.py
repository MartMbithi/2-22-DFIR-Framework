# 2:22 DFIR Framework — SQLAlchemy Models
# Database entities for the SaaS forensic investigation platform

from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, Enum, ForeignKey, Text, Integer,
    BigInteger, Boolean, Numeric, Float,
)
from sqlalchemy.dialects.mysql import CHAR, LONGTEXT
from sqlalchemy.sql import func
from backend.db import Base


# ─── Organizations ──────────────────────────────────────────────────

class Organization(Base):
    __tablename__ = "organizations"

    organization_id = Column(CHAR(36), primary_key=True)
    organization_name = Column(String(150), nullable=False)
    organization_created_at = Column(DateTime, default=datetime.utcnow)


# ─── Users ──────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    user_id = Column(CHAR(36), primary_key=True)
    organization_id = Column(
        CHAR(36), ForeignKey("organizations.organization_id"), nullable=True
    )
    user_email = Column(String(150), unique=True, nullable=False)
    user_password_hash = Column(String(255), nullable=False)
    user_role = Column(Enum("admin", "analyst", "viewer"), default="analyst")
    user_created_at = Column(DateTime, default=datetime.utcnow)


# ─── Plans ──────────────────────────────────────────────────────────

class Plan(Base):
    __tablename__ = "plans"

    plan_id = Column(CHAR(36), primary_key=True)
    plan_name = Column(String(50), nullable=False)
    plan_max_cases = Column(Integer, nullable=False)
    plan_max_artifacts = Column(Integer, nullable=False)
    plan_max_users = Column(Integer, nullable=False, default=5)
    plan_llm_enabled = Column(Boolean, nullable=False, default=False)
    plan_price = Column(Numeric(10, 2), nullable=False)
    plan_currency = Column(String(3), nullable=False, default="KES")
    plan_interval = Column(
        Enum("monthly", "yearly", "one_time"), nullable=False, default="monthly"
    )
    plan_active = Column(Boolean, nullable=False, default=True)


# ─── Subscriptions ──────────────────────────────────────────────────

class Subscription(Base):
    __tablename__ = "subscriptions"

    subscription_id = Column(CHAR(36), primary_key=True)
    organization_id = Column(
        CHAR(36), ForeignKey("organizations.organization_id"), nullable=False
    )
    plan_id = Column(CHAR(36), ForeignKey("plans.plan_id"), nullable=False)
    subscription_status = Column(
        Enum("active", "expired", "cancelled", "past_due"), nullable=False
    )
    subscription_started_at = Column(DateTime, nullable=False)
    subscription_expires_at = Column(DateTime, nullable=False)
    payment_reference = Column(String(255), nullable=True)


# ─── Payments ───────────────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(CHAR(36), primary_key=True)
    organization_id = Column(
        CHAR(36), ForeignKey("organizations.organization_id"), nullable=False
    )
    subscription_id = Column(CHAR(36), nullable=True)
    payment_amount = Column(Numeric(10, 2), nullable=False)
    payment_currency = Column(String(3), nullable=False, default="KES")
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(
        Enum("pending", "success", "failed", "refunded"), nullable=False
    )
    gateway_reference = Column(String(255), nullable=True)
    gateway_provider = Column(String(50), nullable=True, default="paystack")
    payment_created_at = Column(DateTime, default=datetime.utcnow)
    payment_completed_at = Column(DateTime, nullable=True)


# ─── Cases ──────────────────────────────────────────────────────────

class Case(Base):
    __tablename__ = "cases"

    case_id = Column(String(100), primary_key=True)
    organization_id = Column(
        CHAR(36), ForeignKey("organizations.organization_id"), nullable=False
    )
    user_id = Column(CHAR(36), ForeignKey("users.user_id"), nullable=False)
    case_name = Column(String(150), nullable=False)
    case_description = Column(Text, nullable=True)
    case_status = Column(
        Enum("created", "processing", "completed", "failed"), default="created"
    )
    case_created_at = Column(DateTime, default=datetime.utcnow)


# ─── Case Uploads ───────────────────────────────────────────────────

class CaseUpload(Base):
    __tablename__ = "case_uploads"

    upload_id = Column(CHAR(36), primary_key=True)
    case_id = Column(String(100), nullable=False)
    organization_id = Column(CHAR(36), nullable=False)
    user_id = Column(CHAR(36), nullable=False)
    upload_filename = Column(String(255), nullable=False)
    upload_path = Column(Text, nullable=False)
    upload_size = Column(BigInteger, nullable=False)
    upload_mime_type = Column(String(100), nullable=True)
    upload_status = Column(String(50), default="uploaded")
    uploaded_at = Column(DateTime, default=datetime.utcnow)


# ─── Forensic Artifacts ────────────────────────────────────────────

class ForensicArtifact(Base):
    __tablename__ = "forensic_artifacts"

    artifact_id = Column(CHAR(36), primary_key=True)
    case_id = Column(String(100), nullable=False)
    artifact_type = Column(String(50), nullable=True)
    source_tool = Column(String(50), nullable=True)
    source_file = Column(Text, nullable=True)
    host_id = Column(String(100), nullable=True)
    user_context = Column(String(100), nullable=True)
    artifact_timestamp = Column(DateTime, nullable=True)
    artifact_path = Column(Text, nullable=True)
    content_summary = Column(Text, nullable=True)
    raw_content = Column(LONGTEXT, nullable=True)
    md5 = Column(CHAR(32), nullable=True)
    sha1 = Column(CHAR(40), nullable=True)
    sha256 = Column(CHAR(64), nullable=True)
    metadata_json = Column("metadata", Text, nullable=True)
    ingested_at = Column(DateTime, nullable=False, server_default=func.now())


# ─── Triage Results ─────────────────────────────────────────────────

class TriageResult(Base):
    __tablename__ = "triage_results"

    artifact_id = Column(CHAR(36), primary_key=True)
    triage_score = Column(Float, nullable=False)
    score_breakdown = Column(Text, nullable=True)
    triaged_at = Column(DateTime, nullable=False)


# ─── Jobs ───────────────────────────────────────────────────────────

class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(CHAR(36), primary_key=True)
    case_id = Column(String(100), nullable=False)
    organization_id = Column(
        CHAR(36), ForeignKey("organizations.organization_id"), nullable=False
    )
    job_type = Column(String(50), nullable=False)
    job_status = Column(String(50), nullable=False)
    job_stage = Column(String(50), nullable=True)
    job_progress_percent = Column(Integer, default=0)
    job_eta_seconds = Column(Integer, nullable=True)
    job_progress = Column(Text, nullable=True)
    job_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)


# ─── Job Stage Events ──────────────────────────────────────────────

class JobStageEvent(Base):
    __tablename__ = "job_stage_events"

    stage_event_id = Column(CHAR(36), primary_key=True)
    job_id = Column(CHAR(36), nullable=False, index=True)
    stage_name = Column(String(50), nullable=False)
    stage_started_at = Column(DateTime, nullable=False)
    stage_completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)


# ─── Reports ───────────────────────────────────────────────────────

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(CHAR(36), primary_key=True, index=True)
    case_id = Column(
        String(100), ForeignKey("cases.case_id"), nullable=False, index=True
    )
    report_type = Column(String(50), nullable=False)
    report_path = Column(Text, nullable=False)
    report_generated_at = Column(DateTime, server_default=func.now())


# ─── Audit Log ──────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(CHAR(36), primary_key=True)
    organization_id = Column(CHAR(36), nullable=True)
    user_id = Column(CHAR(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
