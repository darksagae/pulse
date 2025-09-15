#!/usr/bin/env python3
"""
Simple Railway deployment entry point for PublicPulse backend
Use this for initial deployment testing
"""
import os
import uvicorn

def main():
    """Main entry point for Railway deployment"""
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PublicPulse API (Simple) on {host}:{port}")
    
    # Run the simple application
    uvicorn.run(
        "app_simple:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()