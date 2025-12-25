# CareerAgentPro 🚀

<div align="center">

![CareerAgentPro](https://img.shields.io/badge/CareerAgentPro-AI%20Career%20Platform-0071e3?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Your AI-Powered Career Co-Pilot** — From resume optimization to intelligent job matching, CareerAgentPro automates and elevates your entire job search journey.

[🌐 Live Demo](https://ai-job-helper-steel.vercel.app/) • [✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠 Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🎨 Apple-Inspired Design System
- **Glassmorphism UI** with backdrop blur and subtle transparency
- **Framer Motion** animations for fluid, 60fps interactions
- **Dark/Light mode** with system preference detection
- **Responsive design** optimized for all devices

### 🧠 AI-Powered Intelligence
- **Resume Enhancement** powered by Grok 2, Gemini 2.0 Flash, or DeepSeek
- **ATS Score Analysis** with detailed breakdown
- **Smart Job Matching** with skill gap detection
- **Cover Letter Generation** tailored to each role
- **Outreach Automation** for LinkedIn and email

### 📄 Resume Management
- **Drag & Drop Upload** for PDF, DOCX, TXT files
- **AI Parsing** extracts skills, experience, education
- **Multi-Format Export**: PDF, DOCX, LaTeX
- **Real-time Preview** with live editing

### 🔒 Security First
- **SSRF Protection** with strict URL allowlisting
- **XSS Prevention** with HTML escaping
- **Secure Storage** with client-side encryption
- **No Data Collection** — all processing client-side

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.1 | React framework with App Router |
| [React](https://react.dev/) | 19 | UI library with new compiler |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 11.15 | Animations & gestures |
| [Lucide React](https://lucide.dev/) | Latest | Modern icon library |
| [Axios](https://axios-http.com/) | 1.7 | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | Modern Python API framework |
| [Python](https://python.org/) | 3.12 | Backend runtime |
| [Pydantic](https://docs.pydantic.dev/) | 2.10 | Data validation |
| [OpenAI SDK](https://platform.openai.com/) | 1.57 | AI/LLM integration |
| [httpx](https://www.python-httpx.org/) | 0.28 | Async HTTP client |
| [Trafilatura](https://trafilatura.readthedocs.io/) | 1.12 | Web content extraction |
| [FPDF2](https://py-pdf.github.io/fpdf2/) | 2.8 | PDF generation |

### AI Models (via OpenRouter)
| Model | Provider | Use Case |
|-------|----------|----------|
| Grok 2 Vision | xAI | Resume enhancement, analysis |
| Gemini 2.0 Flash | Google | Fast responses, free tier |
| DeepSeek Chat v3 | DeepSeek | Alternative processing |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ (LTS recommended)
- **Python** 3.11+
- **pnpm** or npm

### 1. Clone & Install

```bash
git clone https://github.com/mangeshraut712/AIJobHelper.git
cd AIJobHelper

# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=/api

# Backend (.env) - Optional for AI features
OPENROUTER_API_KEY=your_key_here
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend && python main.py
# Runs on http://localhost:8000

# Terminal 2 - Frontend
cd frontend && npm run dev
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
AIJobHelper/
├── frontend/                # Next.js 15 Application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── api/         # API routes (Edge-ready)
│   │   │   ├── dashboard/   # User dashboard
│   │   │   ├── jobs/        # Job analysis
│   │   │   ├── resumes/     # Resume builder
│   │   │   └── profile/     # Profile management
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Design system
│   │   │   └── layout/      # Layout components
│   │   └── lib/             # Utilities
│   └── package.json
│
├── backend/                 # FastAPI Server
│   ├── services/
│   │   ├── ai_service.py    # LLM integration
│   │   ├── job_service.py   # Job extraction
│   │   └── export_service.py # Document export
│   ├── main.py              # API entry point
│   └── requirements.txt
│
├── vercel.json              # Deployment config
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/parse-resume` | Parse uploaded resume |
| `POST` | `/enhance-resume` | AI enhancement |
| `POST` | `/extract-job` | Extract job details from URL |
| `POST` | `/generate-cover-letter` | Generate cover letter |
| `POST` | `/generate-communication` | Generate outreach messages |
| `POST` | `/export/pdf` | Export to PDF |
| `POST` | `/export/docx` | Export to Word |
| `POST` | `/export/latex` | Export to LaTeX |

---

## 🚢 Deployment

Optimized for **Vercel** with zero-config deployment:

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add `OPENROUTER_API_KEY` environment variable
4. Deploy!

**Live**: [ai-job-helper-steel.vercel.app](https://ai-job-helper-steel.vercel.app/)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ using Next.js 15, React 19, and FastAPI**

⭐ Star this repo if you find it helpful!

</div>
