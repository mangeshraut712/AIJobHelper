"""
Vercel Serverless Python Function for CareerAgentPro Backend.
This file serves as the entry point for Python API routes on Vercel.

Routes available:
- GET /api/index (health check via FastAPI)
- POST /api/index (various endpoints)

Due to Vercel's serverless function routing, all requests to /api/python/*
will be handled by the FastAPI app from backend/main.py
"""
import sys
import os

# Add backend directory to Python path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(project_root, 'backend')
sys.path.insert(0, project_root)
sys.path.insert(0, backend_path)

# Try to import the FastAPI app from backend
try:
    from backend.main import app
except ImportError as e:
    # Fallback: create a minimal app if backend import fails
    from fastapi import FastAPI
    app = FastAPI(title="CareerAgentPro API (Fallback)")
    
    @app.get("/")
    def root():
        return {"error": "Backend import failed", "detail": str(e)}
    
    @app.get("/health")
    def health():
        return {"status": "error", "message": "Backend module not found"}

# For Vercel, the app object is exported and used as the ASGI handler

