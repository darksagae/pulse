#!/usr/bin/env python3
"""
Railway deployment entry point for PublicPulse backend
"""
import os
import uvicorn
from app.main import app

def main():
    """Main entry point for Railway deployment"""
    # Get port from environment or default to 8000
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PublicPulse API on {host}:{port}")
    
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )

if __name__ == "__main__":
    main()