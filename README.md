# 🚀 CareerAgentPro - AI-Powered Job Application Platform

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![AI](https://img.shields.io/badge/AI-Qwen%20Coder-orange)]()

**Premium AI-powered platform for job applications** - Resume enhancement, cover letters, job matching, and more!

**Live Demo**: https://ai-job-helper-steel.vercel.app/

---

## ✨ Features

### Core Features
- 📄 **Resume Upload & Parsing** - AI extracts information from PDFs
- 🎯 **Job Extraction** - Extract job details from any URL
- ✨ **AI Resume Enhancement** - Personalized improvements for each job
- 📝 **Cover Letter Generation** - AI-powered personalized letters
- 📊 **ATS Optimization** - Score and improve resume for ATS systems
- 💼 **Job Fit Analysis** - Match your skills to job requirements
- 📤 **Multi-Format Export** - PDF, DOCX, LaTeX export

### Quality Framework (NEW)
- 🎯 **6-Point Bullet Builder** - Structured bullet points with validation
- 📊 **Competency Assessment** - 10-category skill analysis
- 🔄 **Language Spinning** - Adapt text for early/growth/enterprise stages
- ✅ **Resume Verification** - Comprehensive quality scoring
- 📚 **Master Bullet Library** - Reusable bullet point management
- 💬 **Multi-Track Outreach** - Customized outreach strategies

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.1 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI 0.115
- **Language**: Python 3.12
- **AI**: OpenRouter (Qwen Coder 32B)
- **Export**: PyPDF2, python-docx, fpdf2

### Deployment
- **Platform**: Vercel
- **Serverless**: Mangum adapter
- **Environment**: Automatic environment detection

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### 1. Clone Repository
```bash
git clone <repository-url>
cd AIJobHelper-main
```

### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your API key to .env:
# OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Start backend
uvicorn main:app --reload --port 8000
```

**Expected Output**:
```
🚀 AI MODE ENABLED
✅ OpenRouter API Key: Configured
✅ AI Features: ACTIVE
```

### 3. Setup Frontend
```bash
# In new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000**

---

## 🔐 Environment Setup

### Local Development

**Backend** (`backend/.env`):
```bash
OPENROUTER_API_KEY=your_api_key_here
ENVIRONMENT=development
```

**Project Root** (`.env`):
```bash
OPENROUTER_API_KEY=your_api_key_here
NODE_ENV=development
```

### Vercel Deployment

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: Your OpenRouter API key
   - **Environments**: ☑ Production ☑ Preview ☑ Development
3. Save (Vercel auto-redeploys)

---

## 🧪 Testing

### Test Backend
```bash
# Check AI is enabled
cd backend
python3 -c "from env_loader import get_ai_status; print('AI:', get_ai_status()['ai_enabled'])"

# Expected: AI: True
```

### Test Endpoints
```bash
# Start backend first: uvicorn main:app --reload

# Test health
curl http://localhost:8000/health

# Test AI feature
curl -X POST http://localhost:8000/validate-bullet \
  -H "Content-Type: application/json" \
  -d '{"bullet": {"action": "Led", "context": "team"}}'
```

### Test Frontend
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Visit: http://localhost:3000
4. Test each feature:
   - Upload resume
   - Extract job from URL
   - Enhance resume
   - Generate cover letter
   - Build 6-point bullets
   - Verify resume quality

---

## 📋 API Endpoints

### Core Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/parse-resume` | POST | Parse resume PDF |
| `/extract-job` | POST | Extract job from URL |
| `/enhance-resume` | POST | AI resume enhancement |
| `/generate-cover-letter` | POST | AI cover letter |
| `/assess-job-fit` | POST | Job fit analysis |

### Quality Framework
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/validate-bullet` | POST | 6-point bullet validation |
| `/assess-competencies` | POST | Competency analysis |
| `/spin-text` | POST | Language adaptation |
| `/verify-resume-quality` | POST | Resume quality check |

### Export
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/export/pdf` | POST | Export to PDF |
| `/export/docx` | POST | Export to DOCX |
| `/export/latex` | POST | Export to LaTeX |

**All endpoints work with AND without AI** - graceful fallback to heuristics.

---

## 🎯 Features in Detail

### 1. Resume Enhancement
- **With AI**: Personalized improvements using Qwen Coder
- **Without AI**: Rule-based suggestions
- **Endpoint**: `/enhance-resume`
- **Frontend**: `/resumes` page

### 2. 6-Point Bullet Builder
- **Structure**: Action, Context, Method, Result, Impact, Outcome
- **Validation**: Character count (240-260), metrics detection
- **With AI**: Deep quality validation
- **Without AI**: Rule-based validation
- **Component**: `BulletBuilder.tsx`

### 3. Competency Assessment
- **Categories**: 10 competency areas
- **Analysis**: Technical, Leadership, Product, Data, etc.
- **With AI**: Deep JD analysis
- **Without AI**: Keyword extraction
- **Component**: `CompetencyBreakdown.tsx`

### 4. Language Spinning
- **Stages**: Early Stage, Growth Stage, Enterprise
- **Adaptation**: Context-aware language transformation
- **With AI**: Smart adaptation
- **Without AI**: Dictionary-based
- **Component**: `SpinningEngine.tsx`

### 5. Resume Verification
- **Scoring**: Overall quality score (0-100)
- **Checks**: Profile completeness, bullet quality, errors
- **With AI**: Deep validation
- **Without AI**: Rule-based
- **Component**: `ResumeVerifier.tsx`

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Post-Deployment

1. **Set Environment Variable**:
   - Vercel Dashboard → Settings → Environment Variables
   - Add `OPENROUTER_API_KEY`

2. **Verify**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Expected Response**:
   ```json
   {
     "status": "healthy",
     "ai_service": "configured"
   }
   ```

---

## 🔒 Security

### API Key Protection
- ✅ `.env` files are gitignored
- ✅ API key never committed to git
- ✅ Vercel stores keys encrypted
- ✅ Environment variable loading (not hardcoded)
- ✅ No frontend exposure

### Best Practices
- Keep `.env` file private
- Use different keys for dev/production
- Rotate keys every 90 days
- Monitor OpenRouter usage
- Never share keys publicly

---

## 🛠️ Development

### File Structure
```
AIJobHelper-main/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── env_loader.py          # Environment config (bulletproof)
│   ├── services/              # AI services
│   │   ├── ai_service.py      # OpenRouter integration
│   │   ├── bullet_validator.py
│   │   ├── competency_assessor.py
│   │   ├── spinning_service.py
│   │   └── resume_verifier.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # React components
│   │   │   ├── resume/        # Quality framework components
│   │   │   └── outreach/
│   │   └── lib/
│   │       └── api.ts         # Smart API URL detection
│   └── package.json
└── README.md
```

### Code Quality
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 compilation errors
- **Python**: All files compile
- **Tests**: All endpoints verified

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python3 --version  # Should be 3.12+

# Check .env file exists
ls -la backend/.env

# Check API key is set
cat backend/.env | grep OPENROUTER

# Reinstall dependencies
pip install -r backend/requirements.txt
```

### "AI not configured"
```bash
# 1. Check env loader
cd backend
python3 -c "from env_loader import get_ai_status; import json; print(json.dumps(get_ai_status(), indent=2))"

# 2. Verify .env file
cat .env

# 3. Check API key format
# Should start with: sk-or-v1-
# Should be 73 characters long
```

### Frontend Can't Connect to Backend
```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Check frontend API_URL
# frontend/src/lib/api.ts

# 3. Verify CORS is enabled (backend/main.py)
```

### Vercel Deployment Issues
```bash
# 1. Check environment variables
# Vercel Dashboard → Settings → Environment Variables

# 2. Check logs
vercel logs

# 3. Force redeploy
vercel --prod --force

# 4. Verify health endpoint
curl https://your-app.vercel.app/api/health
```

---

## 📊 Performance

- **AI Response Time**: 2-5 seconds (depends on OpenRouter)
- **Fallback Response**: <100ms (local heuristics)
- **Frontend Load**: <1 second
- **Build Time**: ~30 seconds

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🎯 Roadmap

- [ ] User authentication
- [ ] Resume version control
- [ ] Interview preparation tools
- [ ] Salary negotiation assistant
- [ ] Job application tracking
- [ ] Company research tools

---

## 💡 Tips

### Get Better AI Results
1. Provide complete resume information
2. Include specific job requirements
3. Add company context
4. Use detailed bullet points
5. Specify target role clearly

### Optimize ATS Score
1. Match keywords from job description
2. Use standard section headers
3. Include metrics and numbers
4. Avoid images and complex formatting
5. Use standard fonts

### Best Practices
1. Keep master bullet library updated
2. Tailor resume for each application
3. Use appropriate language for company stage
4. Verify quality before exporting
5. Test resume with ATS scanners

---

## 📧 Support

- **Issues**: Open an issue on GitHub
- **Email**: support@example.com
- **Documentation**: This README
- **OpenRouter**: https://openrouter.ai/docs

---

## ⭐ Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**AI Status**: ✅ Enabled  
**Tests**: ✅ All Passing  
**Deployment**: ✅ Vercel  

---

**Built with ❤️ using Next.js, FastAPI, and OpenRouter AI**

🚀 **Deploy now**: `vercel --prod`
