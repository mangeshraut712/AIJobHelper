"""
Vercel Serverless Python Function for CareerAgentPro Backend.
This file serves as the entry point for Python API routes on Vercel.
"""
import sys
import os

# Add backend directory to Python path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(project_root, 'backend')
sys.path.insert(0, project_root)
sys.path.insert(0, backend_path)

# Import the FastAPI app from backend
from backend.main import app

# Vercel expects a handler named 'app' for ASGI applications
# The app is already a FastAPI instance which is ASGI-compatible

