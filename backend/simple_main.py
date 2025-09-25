from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="PublicPulse API",
    description="A citizen document management system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - Allow all origins for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "PublicPulse API v2.0 is running", "status": "healthy", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Simple document endpoints
@app.get("/api/documents")
async def get_documents():
    return {"documents": [], "total_count": 0}

@app.post("/api/documents/submit")
async def submit_document(request: dict):
    return {
        "success": True,
        "message": "Document submitted successfully",
        "document_id": "doc_123",
        "status": "submitted"
    }

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
