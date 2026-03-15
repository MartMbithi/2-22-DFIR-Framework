
# 2:22 DFIR Framework – Autonomous Digital Forensic and Incident Response Platform

## Overview

The **2:22 DFIR Framework** is an AI-assisted digital forensics and incident response platform designed to automate
log-based cyber incident investigations within modern information systems. The framework was developed as part of
research focused on strengthening cyber incident investigation capabilities in government information environments,
with particular relevance to county government systems.

The designation **“2:22”** represents the conceptual moment during which the investigative architecture of the framework
was first articulated. The framework embodies a hybrid analytical model that combines deterministic forensic analysis
with semantic intelligence techniques to improve the efficiency, scalability, and defensibility of cyber investigations.

Originally developed as a command-line forensic pipeline, the system has been evolved into a **secure, multi-tenant
SaaS backend architecture** while preserving the integrity of the underlying digital forensic engine.

The framework emphasizes:

- Forensic defensibility and evidentiary integrity
- Hybrid deterministic and semantic forensic analysis
- Automated artifact ingestion and triage
- Scalable investigation workflows
- Multi-tenant security and organizational isolation
- Reproducible forensic reporting

---

## 2:22 DFIR Framework Principles

The design of the framework is guided by five core forensic principles:

1. **Evidence Integrity**
   - All ingested artifacts remain unaltered.
   - Evidence handling follows digital forensic best practices.

2. **Deterministic Investigative Logic**
   - Rule-based forensic detection ensures reproducibility of results.

3. **Semantic Intelligence Support**
   - Machine learning and language models assist in contextual reasoning,
     without modifying the underlying evidence.

4. **Operational Scalability**
   - The framework supports asynchronous job execution and scalable processing
     of large forensic datasets.

5. **Organizational Isolation**
   - Multi-tenant architecture ensures strict separation of forensic data between organizations.

---

## Core Capabilities

### Automated Digital Forensic Pipeline

The 2:22 DFIR Framework implements a structured forensic investigation pipeline that performs:

- Automated ingestion of raw forensic artifacts
- Multi-channel cyber event detection
- Indicator normalization and enrichment
- Hybrid triage analysis (rule-based + semantic)
- Artifact correlation and intelligence generation
- Structured forensic report generation

### SaaS Investigation Platform

The SaaS backend enables secure forensic operations through:

- Multi-tenant organization management
- Secure authentication and authorization (JWT)
- Case management and forensic evidence tracking
- Asynchronous DFIR job execution
- Real-time job progress monitoring
- Persistent forensic report storage
- Secure report download endpoints

---

## System Architecture

The architecture of the 2:22 DFIR Framework separates the **forensic core engine**
from the **SaaS orchestration layer** to preserve the reproducibility of investigations.

Frontend (Future Investigation Dashboard)
        |
        v
FastAPI Backend (2:22 DFIR SaaS Layer)
        ├── Authentication & Organizations
        ├── Case Management
        ├── Evidence Upload & Ingestion
        ├── DFIR Job Execution
        ├── Investigation Tracking
        ├── Report Retrieval
        |
        v
2:22 DFIR Core Engine
        ├── Evidence Ingestion
        ├── Artifact Normalization
        ├── Threat Detection
        ├── Forensic Triage Engine
        ├── Semantic Investigation Layer
        ├── Intelligence Correlation
        └── Report Generation

The isolation of the DFIR core ensures that forensic analysis remains **deterministic,
auditable, and reproducible** regardless of the SaaS orchestration layer.

---

## Technology Stack

### Backend Platform

- Python 3.9+
- FastAPI
- SQLAlchemy ORM
- MySQL / MariaDB
- JWT Authentication
- Asynchronous background task execution

### DFIR Core Engine

- Custom artifact ingestion detectors
- Deterministic triage rules
- Sentence Transformers for semantic similarity
- Optional OpenAI Responses API integration
- Hybrid scoring engine (rule + semantic)
- Automated PDF and TXT forensic report generation

---

## Repository Structure

DFIR_AI/
├── backend/                 # SaaS backend layer
│   ├── api/                 # API endpoints
│   ├── db/                  # database session management
│   ├── execution/           # job runners
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── main.py              # FastAPI application entrypoint
│
├── dfir_core/               # 2:22 DFIR investigation engine
│   ├── ingestion/
│   ├── triage/
│   ├── triage_semantic/
│   ├── narrative/
│   ├── reporting/
│   └── scripts/run_all.py
│
├── uploads/                 # Uploaded forensic evidence
├── reports/                 # Generated forensic reports
├── requirements.txt
├── .env
└── README.md

---

## Database Model

The platform maintains a structured database schema supporting
forensic traceability and auditability.

Core entities include:

- users
- organizations
- cases
- case_uploads
- forensic_artifacts
- triage_results
- jobs
- reports

Design principles:

- plural table naming
- singular attribute naming
- strict organizational isolation
- complete audit trace of forensic triage decisions

---

## Environment Configuration

Create a `.env` file in the root directory:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dfir_ai

DATABASE_URL=mysql+pymysql://root:@localhost:3306/dfir_ai

OPENAI_API_KEY=optional

---

## Running the Backend

### Install Dependencies

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

### Launch the API Server

uvicorn backend.main:app --reload

API documentation (Swagger):

http://127.0.0.1:8000/docs

---

## End‑to‑End Investigation Workflow

1. Register or authenticate a user
2. Create an organization
3. Create a forensic case
4. Upload forensic artifacts
5. Launch a DFIR investigation job
6. Monitor job progress and stages
7. Download generated forensic intelligence reports

---

## Secure Report Downloads

Endpoint:

GET /reports/{report_id}/download

Features include:

- organization‑scoped authorization
- case ownership verification
- secure filesystem access
- extensibility for cloud storage (S3 / MinIO)

---

## Forensic Integrity Model

The 2:22 DFIR Framework follows strict forensic integrity principles:

- Evidence ingestion is deterministic
- Original evidence is never modified
- Triage scoring is fully auditable
- Semantic reasoning does not alter evidence
- LLMs are used only for narrative synthesis
- Reports can be reproduced from stored artifacts

---

## Academic and Research Applications

The framework can be used for:

- cybersecurity research
- digital forensic experimentation
- automated incident response studies
- government cybersecurity capacity building

The platform also serves as the technical implementation of the **2:22 Digital
Forensic and Incident Response Framework**, which was developed to enhance
cyber incident investigation within public sector information systems.

---

## Project Status

Current development status:

- Backend infrastructure stable
- DFIR job execution pipeline operational
- Forensic reporting engine functional
- Secure report download endpoints implemented
- Frontend investigation dashboard under development
- DFIR core engine preserved and version controlled

---

## License

This framework is provided strictly for:

- cybersecurity research
- digital forensic investigations
- defensive security analysis

The project is **not intended for offensive or malicious use**.
