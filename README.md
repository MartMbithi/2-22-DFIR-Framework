# 2:22 DFIR Framework – Autonomous Digital Forensic and Incident Response Platform

## Overview

The **2:22 DFIR Framework** is an AI-assisted digital forensics and incident response platform designed to automate
log-based cyber incident investigations within modern information systems.

This platform has evolved into a **multi-tenant DFIR SaaS architecture** that integrates:

- A deterministic forensic core engine
- A scalable FastAPI backend
- A modern investigation dashboard
- A DFIR orchestration control plane

---

## Core Principles

1. Evidence Integrity  
2. Deterministic Analysis  
3. Semantic Intelligence Assistance  
4. Scalable Processing  
5. Organizational Isolation  

---

## System Architecture
```
Frontend Dashboard (Next.js)
         FastAPI Backend (SaaS Layer)
        ├── Auth & Organizations
        ├── Cases & Uploads
        ├── Jobs & Processing
        ├── Reports
         DFIR Core Engine
        ├── Ingestion
        ├── Detection
        ├── Triage (Rule + Semantic)
        ├── Correlation
        └── Report Generation
```
---

## Key Features

- Multi-tenant DFIR platform
- Secure JWT authentication
- Case-based evidence management
- Artifact ingestion pipeline
- Real-time job polling
- Secure report downloads
- Forensic auditability
- Deterministic + AI hybrid analysis

---

## Technology Stack

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy
- MySQL

### Frontend
- Next.js
- Bootstrap HUD UI

### DFIR Core
- Python forensic modules
- Rule-based detection
- Semantic analysis (transformers / OpenAI)

---

## Repository Structure
```
DFIR_AI/
├── backend/
├── dfir_core/
├── frontend/
├── data/
├── logs_2_22/
├── requirements.txt
├── .env


```
## Control Plane Commands

```bash
python main.py start
python main.py stop
python main.py restart
python main.py status
```

---

## Investigation Workflow

1. Create organization
2. Create case
3. Upload evidence
4. Run DFIR job
5. Monitor progress
6. Download report

---

## Security Model

- Organization-level isolation
- Secure report access
- Immutable evidence handling
- Auditable DFIR logic

---

## Status

- Backend: Stable
- DFIR Engine: Operational
- Dashboard: Active development
- Control Plane: Implemented

---

## License

For cybersecurity research and defensive use only.

Generated on: 2026-03-17 08:04:03.150726
