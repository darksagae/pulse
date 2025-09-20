"""
PublicPulse API - Legacy main.py (redirects to new backend)
This file is kept for backward compatibility.
The new backend is located in backend/app/main.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import and run the new backend
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
