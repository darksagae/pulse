"""
Minimal FastAPI app for Railway deployment testing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="PublicPulse API",
    description="A citizen document management system",
    version="1.0.0"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Simplified for deployment testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic endpoints
@app.get("/")
async def root():
    return {
        "message": "PublicPulse API is running", 
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "API is running",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

# Test endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working", "success": True}