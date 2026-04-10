# 2:22 DFIR Framework — Pydantic Schemas
# Request/Response schemas for all API endpoints

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: str = "analyst"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Users ──────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    user_id: str
    organization_id: Optional[str] = None
    user_email: str
    user_role: str
    user_created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    user_email: Optional[EmailStr] = None
    user_role: Optional[str] = None


# ─── Organizations ──────────────────────────────────────────────────

class OrganizationCreateRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=150)


class OrganizationResponse(BaseModel):
    organization_id: str
    organization_name: str
    organization_created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Cases ──────────────────────────────────────────────────────────

class CaseCreateRequest(BaseModel):
    case_name: str = Field(min_length=2, max_length=150)
    case_description: Optional[str] = None


class CaseUpdateRequest(BaseModel):
    case_name: Optional[str] = None
    case_description: Optional[str] = None
    case_status: Optional[str] = None


class CaseResponse(BaseModel):
    case_id: str
    organization_id: str
    user_id: str
    case_name: str
    case_description: Optional[str] = None
    case_status: str
    case_created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Jobs ───────────────────────────────────────────────────────────

class JobCreateRequest(BaseModel):
    case_id: str
    job_type: str = "full_investigation"
    investigation_goal: Optional[str] = None
    no_llm: bool = False


class JobResponse(BaseModel):
    job_id: str
    case_id: str
    organization_id: str
    job_type: str
    job_status: str
    job_stage: Optional[str] = None
    job_progress_percent: int = 0
    job_eta_seconds: Optional[int] = None
    job_progress: Optional[str] = None
    job_error: Optional[str] = None
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Reports ────────────────────────────────────────────────────────

class ReportResponse(BaseModel):
    report_id: str
    case_id: str
    report_type: str
    report_path: str
    report_generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Uploads ────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    upload_id: str
    case_id: str
    upload_filename: str
    upload_size: int
    upload_status: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Plans ──────────────────────────────────────────────────────────

class PlanResponse(BaseModel):
    plan_id: str
    plan_name: str
    plan_max_cases: int
    plan_max_artifacts: int
    plan_max_users: int
    plan_llm_enabled: bool
    plan_price: float
    plan_currency: str
    plan_interval: str

    class Config:
        from_attributes = True


# ─── Subscriptions ──────────────────────────────────────────────────

class SubscriptionResponse(BaseModel):
    subscription_id: str
    organization_id: str
    plan_id: str
    subscription_status: str
    subscription_started_at: Optional[datetime] = None
    subscription_expires_at: Optional[datetime] = None
    payment_reference: Optional[str] = None

    class Config:
        from_attributes = True


class SubscribeRequest(BaseModel):
    plan_id: str


# ─── Payments ───────────────────────────────────────────────────────

class InitiatePaymentRequest(BaseModel):
    plan_id: str
    callback_url: Optional[str] = None


class PaymentResponse(BaseModel):
    payment_id: str
    organization_id: str
    payment_amount: float
    payment_currency: str
    payment_status: str
    gateway_reference: Optional[str] = None
    gateway_provider: Optional[str] = None
    payment_created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaystackInitResponse(BaseModel):
    authorization_url: str
    access_code: str
    reference: str


# ─── Artifacts ──────────────────────────────────────────────────────

class ArtifactResponse(BaseModel):
    artifact_id: str
    case_id: str
    artifact_type: Optional[str] = None
    source_tool: Optional[str] = None
    content_summary: Optional[str] = None
    artifact_timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Dashboard ──────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_cases: int = 0
    open_cases: int = 0
    total_jobs: int = 0
    active_jobs: int = 0
    completed_jobs: int = 0
    total_reports: int = 0
    total_artifacts: int = 0
    total_uploads: int = 0
