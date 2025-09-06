from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PublicPulse API", version="1.0.0")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PublicPulse API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working"}

@app.post("/upload-document")
async def upload_document():
    # Placeholder for document upload functionality
    return {"message": "Document upload endpoint - to be implemented"}

@app.get("/documents")
async def get_documents():
    # Placeholder for getting documents list
    return {"documents": [], "message": "Documents endpoint - to be implemented"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
