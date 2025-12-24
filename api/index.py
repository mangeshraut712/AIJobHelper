import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'backend'))
sys.path.insert(0, os.path.join(project_root, 'frontend', 'api'))

# Try to import from backend first, fallback to frontend/api
try:
    from backend.main import app
except ImportError:
    # Fallback to frontend/api/index.py for serverless
    from frontend.api.index import app
