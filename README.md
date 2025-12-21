# AIJobHelper - All-in-One AI Career Ecosystem

AIJobHelper is a production-ready web application designed to architect your job search process. Built with a focus on minimalism, elegance, and high-performance AI integration.

## 🚀 Features

- **AI Job Analysis**: Extract core requirements and responsibilities from any job posting URL.
- **Resume Studio**: AI-powered resume enhancement, scoring (Match Score), and real-time feedback.
- **Outreach Engine**: Generate tailored emails, LinkedIn messages, and follow-up drafts.
- **Multi-Format Export**: Export your optimized resume to PDF, Word (.docx), or LaTeX code for Overleaf.
- **Premium Design**: Inspired by Apple and Japanese design principles—clean layouts, subtle gradients, and glassmorphism.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Framer Motion, Lucide React, Zustand.
- **Backend**: FastAPI, OpenRouter (LLM integration: Gemini 2.0 Flash), Pydantic.
- **Export**: python-docx, fpdf2.

## 🏃 Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables (create a `.env` file):
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
4. Start the API server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 Design Philosophy

The application follows the **Kanso (Simplicity)** and **Shibui (Subtle Beauty)** principles. Every interaction is designed to be intentional, with smooth transitions and a focus on content clarity.

---
Built with ❤️ by AIJobHelper Team
