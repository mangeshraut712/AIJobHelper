# 🚀 CareerAgentPro
**AI-Powered Career Optimization Platform**

<div align="center">

![CareerAgentPro](https://img.shields.io/badge/CareerAgentPro-AI%20Career%20Platform-0071e3?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**The ultimate AI-powered platform for career optimization** — Transform your job search with intelligent resume parsing, ATS optimization, AI-powered cover letters, and strategic outreach tools.

[🌐 Live Demo](https://ai-job-helper-steel.vercel.app/) • [✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [� Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 **Core Features**

#### � **Resume Management** (`/profile`)
- **Smart Resume Parsing**: Upload PDF, DOCX, or TXT files with AI-powered extraction
- **Intelligent Data Recognition**: Automatically extracts name, contact info, skills, experience, and education
- **Dual Processing**: AI parsing with robust regex fallback (70%+ accuracy)
- **Profile Builder**: Beautiful, intuitive form to complete your professional identity

#### 🔍 **Resume Enhancement** (`/resumes`)
- **ATS Scoring**: Real-time compatibility analysis with 0-100 scoring
- **AI-Powered Optimization**: Section-by-section improvement suggestions
- **Skills Gap Analysis**: Identifies missing keywords from job descriptions
- **Multiple Export Formats**: PDF, DOCX, and LaTeX with professional templates
- **Score Breakdown**: Detailed metrics for skills match, experience relevance, and format quality

#### 💌 **Cover Letter Generation** (`/communication`)
- **AI-Generated Letters**: Personalized, professional cover letters in seconds
- **Multiple Templates**: Apply-Pilot, Professional, Creative styles
- **Strategic Formatting**: 8-12 line format optimized for recruiter attention
- **Customization**: Tailored to specific job descriptions and companies
- **Template Fallback**: Professional templates when AI is unavailable

#### 🎯 **Job Extraction** (`/jobs`)
- **URL-Based Extraction**: Paste any job posting URL (LinkedIn, Indeed, etc.)
- **Comprehensive Parsing**: Extracts title, company, description, requirements, skills
- **AI-Powered Analysis**: Intelligent extraction of key information
- **One-Click Save**: Store job details for later comparison

#### 💬 **Communication Tools** (`/outreach`)
- **Email Templates**: Professional outreach messages
- **LinkedIn Messages**: Optimized connection requests
- **Follow-Up Sequences**: Strategic 3-tier engagement system
- **Personalization**: Customized to your profile and target company

#### 🧪 **Fit Analysis** (`/fit-analysis`)
- **Job Matching**: Calculate compatibility between your profile and job posts
- **Skills Comparison**: Visualize matched vs. missing skills
- **Strategic Recommendations**: Actionable advice to improve your fit score
- **Company Intelligence**: Insights on company stage and culture

---

## 🛠 **Technology Stack**

### **Frontend**
- **Framework**: Next.js 15.1 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **Components**: Custom Apple-inspired design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks + Local Storage

### **Backend**
- **Framework**: FastAPI 0.115
- **Language**: Python 3.12
- **Validation**: Pydantic 2.10
- **PDF Processing**: PyPDF2, pdf-parse
- **Document Generation**: python-docx, reportlab
- **AI Integration**: OpenAI SDK (via OpenRouter)

### **AI & Services**
- **AI Provider**: OpenRouter (multi-model support)
- **Primary Model**: Qwen 2.5 Coder 32B (optimized for structured output)
- **Fallback**: Enhanced regex parsing with 70%+ accuracy
- **Cost**: ~$0.85 per 1,000 requests (very affordable)

### **Deployment**
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: FastAPI (can run on Vercel or standalone)
- **Database**: Client-side encrypted local storage
- **Environment**: Serverless with edge functions

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Python 3.12+
- OpenRouter API key ([Sign up here](https://openrouter.ai/))

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/AIJobHelper.git
cd AIJobHelper
```

### **2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at **http://localhost:3000**

### **3. Backend Setup**
```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### **4. Environment Configuration**

Create `.env` file in `backend/` directory:
```bash
OPENROUTER_API_KEY=your_api_key_here
```

Or export directly:
```bash
export OPENROUTER_API_KEY=your_api_key_here
```

### **5. Run the Backend**
```bash
cd backend
uvicorn main:app --reload
```
Backend API will be available at **http://localhost:8000**

### **6. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📖 Documentation

### **API Endpoints**

#### **Frontend API Routes** (Next.js)
- `POST /api/parse-resume` - Parse resume files (PDF, DOCX, TXT)
- `POST /api/enhance-resume` - Get ATS score and optimization suggestions
- `POST /api/generate-cover-letter` - Generate personalized cover letters
- `POST /api/extract-job` - Extract job details from URL
- `GET /api/health` - Health check
- `POST /api/export/pdf` - Export resume as PDF
- `POST /api/export/docx` - Export resume as DOCX
- `POST /api/export/latex` - Export resume as LaTeX

#### **Backend API Endpoints** (FastAPI)
- `GET /health` - Comprehensive health check
- `POST /parse-resume` - Parse resume (alternative endpoint)
- `POST /enhance-resume` - ATS scoring and enhancement
- `POST /generate-cover-letter` - AI cover letter generation
- `POST /generate-communication` - Email and LinkedIn messages
- `POST /extract-job` - Job posting extraction
- `POST /export/*` - Various export formats

### **Features by Page**

#### **Dashboard** (`/`)
- Overview of all features
- Quick access to all tools
- Recent activity summary

#### **Profile** (`/profile`)
- Upload and parse resumes
- Manual profile editing
- Completeness tracking
- Save to local storage

#### **Jobs** (`/jobs`)
- Paste job posting URLs
- AI-powered extraction
- Save job details
- Compare multiple positions

#### **Resumes** (`/resumes`)
- Select saved jobs
- Get ATS score (0-100)
- View detailed breakdown
- Get optimization suggestions
- Export in multiple formats

#### **Communication** (`/communication`)
- Generate cover letters
- Multiple template styles
- AI-powered personalization
- Copy or export

#### **Interview Prep** (`/interview`)
- Common interview questions
- STAR method guidance
- Practice responses

#### **Fit Analysis** (`/fit-analysis`)
- Match profile to job
- Skills gap analysis
- Strategic recommendations

#### **Outreach** (`/outreach`)
- Email templates
- LinkedIn strategies
- Follow-up sequences

---

## 🎨 Design System

### **Design Philosophy**
- **Apple-Inspired**: Clean, minimal, premium aesthetics
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Smooth Animations**: 60fps+ transitions with Framer Motion
- **Responsive**: Mobile-first design, works on all screen sizes
- **Dark Mode**: Beautiful dark theme with system preference sync

### **Color Palette**
- **Primary**: Blue gradient (#0071e3 → #0077ed)
- **Accent**: Purple, Pink, Cyan gradients
- **Neutral**: Slate for dark mode, White for light mode
- **Semantic**: Green (success), Red (error), Yellow (warning)

### **Components**
- `<AppleCard>` - Premium card with hover effects
- `<AppleButton>` - Button with smooth interactions
- `<LoadingSkeleton>` - Skeleton loading states
- `<Toast>` - Beautiful toast notifications

---

## 💰 Cost & Performance

### **AI Model Pricing**
- **Model**: `qwen/qwen-2.5-coder-32b-instruct`
- **Input**: $0.22 per million tokens
- **Output**: $0.95 per million tokens
- **Average Request**: ~$0.0008 per request
- **Monthly** (1,000 requests): ~$0.85

### **Features**
- ✅ No rate limits (paid model)
- ✅ Consistent performance
- ✅ Production-ready
- ✅ Fast response times (5-15 seconds)

---

## 🔐 Security & Privacy

### **Security Features**
1. **Environment Variables**: API keys stored securely, never in code
2. **Client-Side Storage**: Personal data encrypted in local storage
3. **No Database**: No server-side storage of personal information
4. **HTTPS**: All API requests over secure connections
5. **Input Validation**: Comprehensive validation with Pydantic

### **Privacy**
- ✅ Your data stays on your device
- ✅ Resume processing is temporary (not saved server-side)
- ✅ No tracking or analytics
- ✅ GDPR compliant

---

## 🧪 Testing

### **Test Resume Upload**
```bash
curl -X POST http://localhost:3000/api/parse-resume \
  -F "file=@your_resume.pdf"
```

### **Test Backend Health**
```bash
curl http://localhost:8000/health
```

### **Test Cover Letter Generation**
```bash
curl -X POST http://localhost:3000/api/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {...},
    "job_description": {...},
    "template_type": "professional"
  }'
```

---

## � Project Structure

```
AIJobHelper/
├── frontend/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # App Router Pages
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── profile/          # Resume Upload/Edit
│   │   │   ├── jobs/             # Job Extraction
│   │   │   ├── resumes/          # ATS Enhancement
│   │   │   ├── communication/    # Cover Letters
│   │   │   ├── interview/        # Interview Prep
│   │   │   ├── fit-analysis/     # Job Matching
│   │   │   ├── outreach/         # Email Templates
│   │   │   └── api/              # API Routes
│   │   │       ├── parse-resume/
│   │   │       ├── enhance-resume/
│   │   │       ├── generate-cover-letter/
│   │   │       └── extract-job/
│   │   ├── components/           # React Components
│   │   │   ├── ui/              # Design System
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   └── lib/                 # Utilities
│   │       ├── ai-config.ts     # AI Configuration
│   │       ├── api.ts           # API Client
│   │       └── secureStorage.ts # Local Storage
│   └── package.json
│
├── backend/                       # FastAPI Backend
│   ├── main.py                   # FastAPI App
│   ├── services/                 # Business Logic
│   │   ├── ai_service.py        # AI Integration
│   │   ├── resume_parser.py     # PDF/DOCX Parsing
│   │   ├── jd_assessor.py       # Job Analysis
│   │   ├── outreach_service.py  # Email Templates
│   │   └── bullet_framework.py  # Resume Writing
│   ├── schemas.py               # Pydantic Models
│   └── requirements.txt
│
├── README.md                     # This file
├── vercel.json                  # Vercel config
└── .gitignore
```

---

## � Development

### **Running Tests**
```bash
# Frontend
cd frontend
npm run test

# Backend
cd backend
pytest
```

### **Building for Production**
```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed, Python)
cd backend
# Deploy to your hosting provider
```

### **Environment Variables**

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=/api  # Default for Next.js API routes
```

**Backend** (`.env`):
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
ENVIRONMENT=production  # or development
```

**Vercel** (Environment Variables):
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenRouter** - AI model routing and management
- **Next.js Team** - Amazing React framework
- **FastAPI** - High-performance Python framework
- **Vercel** - Deployment and hosting
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Beautiful animations

---

## 📮 Support

### **Issues & Bugs**
If you encounter any issues, please [open an issue](https://github.com/yourusername/AIJobHelper/issues) on GitHub.

### **Questions**
For questions and discussions, use [GitHub Discussions](https://github.com/yourusername/AIJobHelper/discussions).

---

## 🗺️ Roadmap

### **Completed** ✅
- [x] Resume parsing (PDF, DOCX, TXT)
- [x] ATS scoring and optimization
- [x] AI-powered cover letter generation
- [x] Job URL extraction
- [x] Profile management
- [x] Multiple export formats
- [x] Interview preparation
- [x] Outreach templates
- [x] Dark mode support
- [x] Responsive design

### **In Progress** 🚧
- [ ] Resume version history
- [ ] Job application tracking
- [ ] Email integration
- [ ] Browser extension
- [ ] Mobile app

### **Planned** 📋
- [ ] LinkedIn integration
- [ ] Interview simulation with AI
- [ ] Salary negotiation guides
- [ ] Career path recommendations
- [ ] Job board aggregation

---

<div align="center">

## 🌟 **Star this repository to stay updated!**

**Built with ❤️ for job seekers everywhere**

[⬆ Back to Top](#-careeragentpro)

</div>
