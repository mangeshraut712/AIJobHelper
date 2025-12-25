# CareerAgentPro 🚀

<div align="center">

![CareerAgentPro](https://img.shields.io/badge/CareerAgentPro-AI%20Career%20Platform-0071e3?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Your AI-Powered Career Co-Pilot** — From resume optimization to intelligent job matching, CareerAgentPro automates and elevates your entire job search journey with a premium Apple-style aesthetic.

[Live Demo](https://ai-job-helper-steel.vercel.app/) • [Documentation](#-documentation) • [Features](#-core-features) • [Quick Start](#-quick-start)

</div>

---

## ✨ Core Features

### 🎨 Premium Apple-Style Design
A completely redesigned user interface featuring glassmorphism, smooth Framer Motion animations, SF Pro-style typography, and a clean, distraction-free aesthetic.

### 👤 Advanced Profile Hub
Full CRUD profile management with local persistence. Includes sections for:
- **Resume Parsing**: Drag & drop PDF/DOCX parsing (works offline!).
- **Experience & Education**: Rich card-based editing with company logos.
- **Skills Matrix**: Tag-based skills with "preferred" toggles.
- **Profile Strength**: Visual progress tracking and completion checklist.

### 🧠 Hybrid AI Engine
- **Online Mode**: Uses OpenRouter (Gemini 2.0 Flash) for advanced analysis and content generation.
- **Offline Mode**: Robust regex-based fallback for resume parsing and basic features—no API key required for local dev!

### 🎯 Job Match & Analysis
Paste any job URL to extract key requirements. The system scores your fit and highlights missing skills.

### 📝 Resume Studio & Export
Real-time optimization feedback. Export your tailored resumes to **PDF**, **DOCX**, and **LaTeX** formats.

### 💬 Outreach Generator
Generate personalized LinkedIn messages, cold emails, and follow-up notes tailored to specific job roles and companies.

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15+, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | FastAPI, Python 3.11+, Pydantic, Uvicorn |
| **AI/ML** | OpenRouter (Gemini 2.0 Flash), Custom Regex Parsing Engine |
| **Storage** | LocalStorage (Client-side), In-memory (Backend), SQLite (Planned) |
| **Deployment** | Vercel (Frontend & Backend via Serverless Functions) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- (Optional) OpenRouter API Key for advanced AI features

### 1. Clone the Repository
```bash
git clone https://github.com/mangeshraut712/AIJobHelper.git
cd AIJobHelper
```

### 2. Backend Setup
The backend facilitates AI parsing and file exports.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the server (No .env needed for local mode!)
python main.py
```
Backend runs at `http://localhost:8000`

### 3. Frontend Setup
The modern Next.js interface.
```bash
cd frontend
npm install
npm run dev -- --port 3001
```
Frontend runs at `http://localhost:3001`

---

## 📁 Project Structure

```
AIJobHelper/
├── 📁 backend/                 # FastAPI Server
│   ├── main.py                 # API entry point & routes
│   ├── schemas.py              # Pydantic data models
│   ├── requirements.txt        # Python dependencies
│   └── 📁 services/
│       ├── ai_service.py       # Hybrid AI/Regex logic
│       ├── job_service.py      # Job extraction
│       ├── export_service.py   # PDF/DOCX/LaTeX generation
│       └── resume_parser.py    # Text extraction util
│
├── 📁 frontend/                # Next.js Application
│   ├── 📁 src/
│   │   ├── 📁 app/             # App Router pages
│   │   │   ├── layout.tsx      # Global layout & fonts
│   │   │   ├── globals.css     # Apple design system variables
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── jobs/           # Job search & match
│   │   │   ├── resumes/        # Editor & export
│   │   │   ├── profile/        # Profile management
│   │   │   └── communication/  # Message generator
│   │   ├── 📁 components/      # UI components (Navbar, Footer)
│   │   └── 📁 lib/             # API utilities & helpers
│
├── 📁 docs/                    # Documentation
│   ├── README.md               # Documentation index
│   ├── ARCHITECTURE.md         # System architecture
│   ├── SECURITY.md             # Security policies
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── IMPROVEMENTS.md         # Feature roadmap
│
├── 📁 tests/                   # Test files
│   ├── test_backend.py         # Backend API tests
│   └── test_models.py          # Model validation tests
│
├── 📁 .github/                 # CI/CD workflows
│   ├── workflows/              # GitHub Actions
│   └── ISSUE_TEMPLATE/         # Issue templates
│
└── vercel.json                 # Deployment config
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check backend status |
| `POST` | `/parse-resume` | Extract data from uploads (PDF/DOCX/TXT) |
| `POST` | `/enhance-resume` | AI optimization (Requires API Key) |
| `POST` | `/generate-cover-letter` | Create tailored cover letters |
| `POST` | `/generate-communication` | Generate emails/LinkedIn messages |
| `POST` | `/export/{format}` | Export to pdf, docx, or latex |

---

## 🔧 Environment Variables

### Backend (Optional)
Create a `.env` file in `backend/` only if you want full AI features locally.
```env
OPENROUTER_API_KEY=your_key_here
```
*If omitted, the system gracefully falls back to regex parsing and mock responses.*

---

## 📚 Documentation

For detailed documentation, see the [docs/](docs/) folder:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Policy](docs/SECURITY.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Feature Roadmap](docs/IMPROVEMENTS.md)

---

## 🚢 Deployment

The project is optimized for **Vercel** deployment with a single repository structure.

1. Push to GitHub.
2. Import project in [Vercel](https://vercel.com).
3. Vercel automatically detects the Next.js frontend.
4. The `vercel.json` configures the FastAPI backend as Serverless Functions.
5. Add `OPENROUTER_API_KEY` in Vercel project settings.

**Live URL**: [ai-job-helper-steel.vercel.app](https://ai-job-helper-steel.vercel.app/)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Mangesh Raut](https://github.com/mangeshraut712)**

⭐ Star this repo if you find it helpful!

</div>
 

## ☁️ Vercel Deployment

This project uses a hybrid **Next.js + Python** setup configured via `vercel.json` and a `frontend` folder rewrite bypass.

### **Manual Settings (Vercel Dashboard)**
To ensure perfect deployment, verify these settings in your Vercel Project Dashboard:

1.  **Project Settings > Build & Development Settings**:
    *   **Framework Preset**: `Other` (Do not change this to Next.js; `vercel.json` handles the build).
    *   **Root Directory**: `.` (Leave empty/default).
    *   **Build Command**: `Override` = **OFF** (Empty).
    *   **Output Directory**: `Override` = **OFF** (Empty).
    *   **Install Command**: `Override` = **OFF** (Empty).

2.  **Environment Variables**:
    *   Add `OPENROUTER_API_KEY`: Your OpenRouter API key.

### **Why "Other"?**
The project uses `vercel.json` to define two separate builds (`frontend` and `backend`). This legacy mode appears as "Other" in Vercel but correctly builds both applications. Changing the preset to "Next.js" will break the Python backend build.
