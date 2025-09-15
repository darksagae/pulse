"""
Ultra-minimal FastAPI app for Railway deployment testing
"""
from fastapi import FastAPI
import os

# Create FastAPI app
app = FastAPI(title="PublicPulse API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "PublicPulse API is running!", "status": "success"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app_minimal:app", host="0.0.0.0", port=port)