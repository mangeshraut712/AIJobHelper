# Contributing to CareerAgentPro

Thank you for your interest in contributing to CareerAgentPro! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with detailed reproduction steps.
- **Feature Requests**: Have an idea? We'd love to hear it!
- **Code Contributions**: Submit a PR with your improvements.
- **Documentation**: Help us improve our docs.

## 🚀 Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/AIJobHelper.git
cd AIJobHelper
```

### 2. Set Up Development Environment

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

## 📝 Code Style Guidelines

### TypeScript/React (Frontend)
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Prefer named exports for components

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints for function parameters
- Write docstrings for functions and classes
- Use async/await for I/O operations

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`npm run lint` for frontend)
- [ ] New features include appropriate tests
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

## 🔄 Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all CI checks pass
3. Request review from maintainers
4. Once approved, your PR will be merged

## 📋 Issue Templates

When creating an issue, please include:

### Bug Report
- **Description**: Clear description of the bug
- **Steps to Reproduce**: How to trigger the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node/Python version

### Feature Request
- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be helpful
- **Proposed Solution**: Your suggested implementation

## 💬 Communication

- Open an issue for any questions
- Be respectful and constructive in discussions
- Follow our Code of Conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CareerAgentPro! 🚀
