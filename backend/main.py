# 2:22 DFIR Framework — FastAPI Application
# SaaS Backend for the Autonomous Digital Forensic and Incident Response Platform

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="2:22 DFIR Framework API",
    description=(
        "Backend API for the 2:22 Digital Forensic and Incident Response Framework. "
        "Automated log-based cyber incident investigation platform for county "
        "government information systems."
    ),
    version="2.22.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Import and Mount Routers ──────────────────────────────────────
from backend.api.auth import router as auth_router
from backend.api.users import router as users_router
from backend.api.organizations import router as orgs_router
from backend.api.cases import router as cases_router
from backend.api.uploads import router as uploads_router
from backend.api.jobs import router as jobs_router
from backend.api.reports import router as reports_router
from backend.api.artifacts import router as artifacts_router
from backend.api.subscriptions import router as subs_router
from backend.api.dashboard import router as dashboard_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(orgs_router)
app.include_router(cases_router)
app.include_router(uploads_router)
app.include_router(jobs_router)
app.include_router(reports_router)
app.include_router(artifacts_router)
app.include_router(subs_router)
app.include_router(dashboard_router)


# ─── Health Check ──────────────────────────────────────────────────
@app.get("/", tags=["System"])
def root():
    return {
        "framework": "2:22 DFIR Framework",
        "version": "2.22.0",
        "status": "operational",
        "description": (
            "Automated Digital Forensic and Incident Response Platform "
            "for County Government Information Systems"
        ),
    }


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy"}
