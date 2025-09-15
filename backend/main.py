#!/usr/bin/env python3
"""
PublicPulse Backend - Main Entry Point
Redirects to the new single-file application
"""
import os
import uvicorn

def main():
    """Main entry point - starts the new app_new.py application"""
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PublicPulse API v2.0 on {host}:{port}")
    
    # Import and run the new single-file application
    from app_new import app
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
