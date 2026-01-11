"""
Serverless Entry Point for Vercel
Wraps FastAPI app for serverless deployment
"""

import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from mangum import Mangum

# Mangum handler for AWS Lambda/Vercel
handler = Mangum(app, lifespan="off")

# Vercel serverless function
# This file is called by Vercel when requests come to /api/*
