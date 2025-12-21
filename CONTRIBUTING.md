# Contributing to CareerAgentPro

Thank you for your interest in contributing to CareerAgentPro! 🎉

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/mangeshraut712/AIJobHelper.git
cd AIJobHelper

# Setup Frontend
cd frontend
npm install
npm run dev

# Setup Backend (in another terminal)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 Development Guidelines

### Code Style
- **Frontend**: Follow ESLint configuration, use TypeScript
- **Backend**: Follow PEP 8, use type hints where possible
- **Components**: Use the established Apple Design System patterns

### Commit Messages
We use semantic commit messages:
- `✨ feat:` New feature
- `🐛 fix:` Bug fix
- `📝 docs:` Documentation
- `🎨 style:` Formatting, styling
- `♻️ refactor:` Code refactoring
- `🔧 chore:` Maintenance tasks
- `⚡ perf:` Performance improvements

### Branching Strategy
- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint      # Lint check
npm run build     # Build check
```

### Backend
```bash
cd backend
python -m py_compile main.py  # Syntax check
```

## 📋 Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with semantic commit messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request using the PR template
6. Wait for CI checks to pass
7. Request review from maintainers

## 🏗️ Project Structure

```
AIJobHelper/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   └── lib/       # Utilities and constants
│   └── package.json
├── backend/            # FastAPI application
│   ├── main.py        # Main API entry point
│   ├── services/      # Business logic
│   └── requirements.txt
├── .github/           # GitHub configurations
└── vercel.json        # Deployment configuration
```

## 🎨 Design System

We follow an Apple-inspired design system:
- Use `AppleCard` for card components
- Use `AppleButton` for buttons
- Use constants from `lib/constants.ts`
- Follow the color palette defined in `globals.css`

## 📫 Questions?

Feel free to open an issue or reach out to the maintainers!

---

Thank you for contributing! 🙏
