# CareerAgentPro - All-in-One AI Career Ecosystem 🚀

CareerAgentPro is a production-ready, minimalist AI agent designed to automate and architect your job search process. From job analysis to auto-filling forms and generating tailored resumes, it is your personal career co-pilot.

## ✨ Core Features

-   **🧠 AI Job Analyst**: Paste a URL and extract requirements, salary, and responsibilities instantly.
-   **🎨 Resume Studio**: Real-time optimization and AI scoring for your resume.
-   **📄 Multi-Format Export**: Professional PDF, DOCX, and LaTeX (Overleaf-ready) exports.
-   **🤖 Autofill Agent**: Dynamic form filling with heuristic label matching and "learned" question support.
-   **📂 Organized Storage**: Automatic day-wise categorization of all generated career assets.
-   **💼 Outreach Studio**: Minimalist drafts for LinkedIn messages and cover letters.

## 🛠 Tech Stack

-   **Frontend**: Next.js 15+, React 19, Tailwind CSS v4, Framer Motion.
-   **Backend**: FastAPI, OpenAI/OpenRouter (Gemini 2.0 Flash).
-   **Database/Storage**: SQLAlchemy (SQLite) & Organized local file system.
-   **Deployment**: Vercel-ready monorepo configuration.

## 🚀 Getting Started

### 1. Backend Installation
```bash
cd backend
pip install -r requirements.txt
# Create .env and add:
# OPENROUTER_API_KEY=your_key
python main.py
```

### 2. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment (Vercel)

This project is configured for **Vercel** monorepo deployment.
1.  Push to GitHub.
2.  Import to Vercel.
3.  Set environment variables:
    *   `OPENROUTER_API_KEY`: Your OpenRouter API Key.
    *   `NEXT_PUBLIC_API_URL`: Path to your backend (default included in `vercel.json`).

## 📁 Project Structure

```bash
├── backend/          # FastAPI Server
├── frontend/         # Next.js Application
├── storage/          # Organized user assets (exports)
├── vercel.json       # Deployment configuration
└── process_application.py # CLI Automation Script
```

---
Built with ❤️ by CareerAgentPro Team
