# 🏗️ Architecture

## Overview

AIJobHelper is a full-stack application designed to help job seekers optimize their job search process. The application is built with a modern tech stack featuring a Next.js frontend and a FastAPI backend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                         │
│                    (CDN + Edge Functions)                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
        ▼                                               ▼
┌───────────────────┐                       ┌───────────────────┐
│     Frontend      │                       │      Backend      │
│    (Next.js)      │◄─────────────────────►│    (FastAPI)      │
│                   │       REST API        │                   │
│  - React 19       │                       │  - Python 3.12    │
│  - TypeScript     │                       │  - Pydantic       │
│  - Tailwind CSS   │                       │  - httpx          │
│  - Framer Motion  │                       │  - OpenAI SDK     │
└───────────────────┘                       └─────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌───────────────────┐
                                            │   External APIs   │
                                            │                   │
                                            │  - OpenRouter     │
                                            │  - Job Boards     │
                                            └───────────────────┘
```

## Directory Structure

```
AIJobHelper/
├── .github/              # GitHub Actions & templates
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── backend/              # Python FastAPI backend
│   ├── services/         # Business logic services
│   ├── main.py           # FastAPI application
│   ├── schemas.py        # Pydantic models
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities & helpers
│   └── package.json      # Node.js dependencies
├── docs/                 # Documentation
├── tests/                # Test files
└── README.md             # Project overview
```

## Key Components

### Frontend (`/frontend`)

| Component | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/ui/` | Reusable UI components (AppleCard, Toast, etc.) |
| `components/layout/` | Layout components (Header, Footer) |
| `lib/` | Utilities (secureStorage, API helpers) |

### Backend (`/backend`)

| Component | Purpose |
|-----------|---------|
| `services/ai_service.py` | AI/LLM integration via OpenRouter |
| `services/job_service.py` | Job extraction and parsing |
| `services/export_service.py` | Resume export (PDF, DOCX, LaTeX) |
| `services/resume_parser.py` | Resume file parsing |

## Security Architecture

- **SSRF Protection**: Strict URL allowlisting with canonical origin mapping
- **XSS Prevention**: HTML escaping and Content Security Policy headers
- **Input Validation**: Pydantic models for backend, TypeScript for frontend
- **Secure Storage**: Client-side encryption for sensitive data

## Deployment

The application is deployed on Vercel:
- **Frontend**: Deployed as Next.js application
- **Backend**: Can be deployed separately or as serverless functions

See [vercel.json](../vercel.json) for deployment configuration.
