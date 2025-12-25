# 🧪 Tests

This directory contains test files for the AIJobHelper project.

## Test Files

| File | Description |
|------|-------------|
| `test_backend.py` | Backend API endpoint tests |
| `test_models.py` | Pydantic model validation tests |

## Running Tests

### Backend Tests

```bash
# Navigate to project root
cd AIJobHelper

# Activate virtual environment
source backend/venv/bin/activate  # macOS/Linux
# or
backend\venv\Scripts\activate     # Windows

# Run tests with pytest
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Test Coverage

To generate coverage reports:

```bash
# Backend
pytest tests/ --cov=backend --cov-report=html

# View coverage report
open htmlcov/index.html
```

## Writing Tests

### Backend Test Example

```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { AppleButton } from '@/components/ui/AppleButton';

describe('AppleButton', () => {
  it('renders correctly', () => {
    render(<AppleButton>Click me</AppleButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## CI Integration

Tests are automatically run on:
- Every push to `main`
- Every pull request

See `.github/workflows/` for CI configuration.
