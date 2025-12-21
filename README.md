# CareerAgentPro 🚀

<div align="center">

![CareerAgentPro](https://img.shields.io/badge/CareerAgentPro-AI%20Career%20Platform-blue?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Your AI-Powered Career Co-Pilot** — From resume optimization to intelligent job matching, CareerAgentPro automates and elevates your entire job search journey.

[Live Demo](https://ai-job-helper-steel.vercel.app/) • [Documentation](#-documentation) • [Features](#-core-features) • [Quick Start](#-quick-start)

</div>

---

## ✨ Core Features

### 🧠 AI Job Analyst
Paste any job URL and instantly extract key requirements, salary information, and responsibilities using advanced AI parsing.

### 🎨 Resume Studio
Real-time AI optimization with compatibility scoring against job descriptions. Get actionable feedback to improve your resume.

### 📄 Multi-Format Export
Professional exports in PDF, DOCX, and LaTeX (Overleaf-ready) formats with ATS-optimized templates.

### 🤖 Smart Autofill Agent
Dynamic form filling with intelligent label matching. Supports Greenhouse, Lever, Workday, and more.

### � Outreach Studio
Generate personalized LinkedIn messages, cold emails, and follow-up templates tailored to each opportunity.

### 📊 Application Tracker
Organize and track all your job applications with status updates and interview scheduling.

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15+, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI, Python 3.11+, Pydantic, SQLAlchemy |
| **AI/ML** | OpenRouter (Gemini 2.0 Flash), Custom Resume Parser |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenRouter API Key ([Get one here](https://openrouter.ai/))

### 1. Clone the Repository
```bash
git clone https://github.com/mangeshraut712/AIJobHelper.git
cd AIJobHelper
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Run the server
python main.py
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
AIJobHelper/
├── 📁 backend/                 # FastAPI Server
│   ├── main.py                 # API entry point
│   ├── schemas.py              # Pydantic models
│   ├── database.py             # Database configuration
│   ├── db_models.py            # SQLAlchemy models
│   └── 📁 services/
│       ├── ai_service.py       # AI/LLM integration
│       ├── job_service.py      # Job extraction logic
│       ├── export_service.py   # PDF/DOCX/LaTeX export
│       ├── autofill_service.py # Form autofill scripts
│       └── resume_parser.py    # Resume text extraction
│
├── 📁 frontend/                # Next.js Application
│   └── 📁 src/
│       ├── 📁 app/             # App Router pages
│       │   ├── page.tsx        # Landing page
│       │   ├── dashboard/      # Main dashboard
│       │   ├── jobs/           # Job analysis
│       │   ├── resumes/        # Resume studio
│       │   ├── profile/        # User profile
│       │   └── communication/  # Outreach studio
│       ├── 📁 components/      # Reusable components
│       └── 📁 lib/             # Utilities
│
├── 📁 storage/                 # Generated assets
├── 📁 .github/                 # CI/CD workflows
├── vercel.json                 # Vercel configuration
└── process_application.py      # CLI automation script
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/parse-resume` | Extract data from resume PDF/DOCX |
| `POST` | `/extract-job` | Parse job posting from URL |
| `POST` | `/enhance-resume` | AI-powered resume optimization |
| `POST` | `/generate-cover-letter` | Generate tailored cover letter |
| `POST` | `/generate-communication` | Create outreach messages |
| `POST` | `/export/pdf` | Export resume as PDF |
| `POST` | `/export/docx` | Export resume as DOCX |
| `POST` | `/export/latex` | Export resume as LaTeX |
| `POST` | `/generate-autofill` | Generate autofill scripts |

---

## 🔧 Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=sqlite:///./career_agent.db  # Optional
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

**Live URL**: [ai-job-helper-steel.vercel.app](https://ai-job-helper-steel.vercel.app/)

### Docker (Coming Soon)
```bash
docker-compose up -d
```

---

## 📖 Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
- [Frontend Storybook](docs/storybook.md) - Component library *(coming soon)*
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

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
