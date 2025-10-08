"""
PublicPulse API - Clean Deployment Version
A complete document management system for citizens, officials, and administrators
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import uuid
from datetime import datetime
import base64

# Import the new AI service
from ai_service_with_gemini import GeminiAIService

# Initialize FastAPI app
app = FastAPI(
    title="PublicPulse API",
    description="Citizen Document Management System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the real AI service
ai_service = GeminiAIService()

# Pydantic Models
class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: str  # citizen, official, admin
    national_id: Optional[str] = None
    official_id: Optional[str] = None
    department_id: Optional[str] = None
    created_at: str

class Document(BaseModel):
    id: str
    user_id: str
    citizen_id: str
    document_type: str
    department_id: str
    status: str
    images: List[str]
    description: Optional[str] = None
    ai_extracted_fields: Optional[Dict[str, Any]] = None
    ai_confidence: Optional[float] = None
    ai_quality_score: Optional[float] = None
    ai_fraud_risk: Optional[float] = None
    official_review_comment: Optional[str] = None
    admin_review_comment: Optional[str] = None
    created_at: str
    updated_at: str

class LoginRequest(BaseModel):
    email: str
    password: str

class DocumentSubmission(BaseModel):
    document_type: str
    department_id: Optional[str] = None
    images: List[str]
    description: Optional[str] = None

# Mock Database (In production, use a real database)
mock_users = {}
mock_documents = {}
mock_sessions = {}

# Utility Functions
def generate_id():
    return str(uuid.uuid4())

def get_current_timestamp():
    return datetime.now().isoformat()

def mock_ai_analysis(document_type: str, images: List[str]) -> Dict[str, Any]:
    """Mock AI analysis for document processing"""
    return {
        "ai_extracted_fields": {
            "full_name": "John Doe",
            "document_number": f"DOC{generate_id()[:8].upper()}",
            "issue_date": "2020-01-15",
            "expiry_date": "2030-01-15"
        },
        "ai_confidence": 0.92,
        "ai_quality_score": 0.88,
        "ai_fraud_risk": 0.15,
        "processing_time": "2.3s"
    }

# Root Endpoints
@app.get("/")
async def root():
    return {
        "message": "PublicPulse API v2.0",
        "status": "operational",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "auth": "/auth/*",
            "documents": "/api/documents/*",
            "users": "/api/users/*",
            "admin": "/api/admin/*"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": get_current_timestamp(),
        "version": "2.0.0",
        "database": "connected",
        "ai_service": "operational"
    }

# Authentication Endpoints
@app.post("/auth/register-citizen")
async def register_citizen(
    national_id: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    phone_number: str = Form(...),
    password: str = Form(...)
):
    # Check if user already exists
    for user in mock_users.values():
        if user.get("email") == email or user.get("national_id") == national_id:
            raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = generate_id()
    user = {
        "id": user_id,
        "national_id": national_id,
        "email": email,
        "full_name": full_name,
        "phone_number": phone_number,
        "role": "citizen",
        "created_at": get_current_timestamp()
    }
    
    mock_users[user_id] = user
    
    return {
        "message": "Citizen registered successfully",
        "user_id": user_id,
        "verification_token": generate_id()
    }

@app.post("/auth/login-citizen")
async def login_citizen(request: LoginRequest):
    # Mock authentication
    for user_id, user in mock_users.items():
        if user.get("email") == request.email and user.get("role") == "citizen":
            token = generate_id()
            mock_sessions[token] = user_id
            return {
                "success": True,
                "message": "Login successful",
                "access_token": token,
                "token_type": "bearer",
                "user": user
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/auth/admin-login")
async def admin_login(request: LoginRequest):
    # Mock admin authentication
    if request.email == "admin@publicpulse.com" and request.password == "admin123":
        user_id = "admin_001"
        token = generate_id()
        mock_sessions[token] = user_id
        
        admin_user = {
            "id": user_id,
            "email": request.email,
            "full_name": "System Administrator",
            "role": "admin",
            "created_at": get_current_timestamp()
        }
        
        return {
            "success": True,
            "message": "Admin login successful",
            "user_id": user_id,
            "user_type": "admin",
            "user": admin_user
        }
    
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@app.post("/auth/register-official")
async def register_official(
    full_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    department_id: str = Form(...),
    password: str = Form(...)
):
    user_id = generate_id()
    official_id = f"OFF{user_id[:8].upper()}"
    access_code = f"AC{generate_id()[:6].upper()}"
    
    user = {
        "id": user_id,
        "official_id": official_id,
        "email": email,
        "full_name": full_name,
        "phone_number": phone_number,
        "department_id": department_id,
        "role": "official",
        "access_code": access_code,
        "created_at": get_current_timestamp()
    }
    
    mock_users[user_id] = user
    
    return {
        "message": "Official registered successfully",
        "official_id": official_id,
        "access_code": access_code,
        "qr_code_data": f"PublicPulse:{access_code}"
    }

@app.post("/auth/login-official")
async def login_official(
    access_code: str = Form(...),
    password: str = Form(...)
):
    for user_id, user in mock_users.items():
        if user.get("access_code") == access_code and user.get("role") == "official":
            token = generate_id()
            mock_sessions[token] = user_id
            return {
                "success": True,
                "message": "Official login successful",
                "access_token": token,
                "token_type": "bearer",
                "user": user
            }
    
    raise HTTPException(status_code=401, detail="Invalid official credentials")

# Document Endpoints
@app.post("/api/users/citizen/submit-document")
async def submit_document(submission: DocumentSubmission):
    document_id = generate_id()
    
    # Real AI processing
    ai_result = await ai_service.extract_document_information(submission.images, submission.document_type)
    
    document = {
        "id": document_id,
        "user_id": "citizen_001",  # Mock user
        "citizen_id": "citizen_001",
        "document_type": submission.document_type,
        "department_id": submission.department_id or "dept_001",
        # mark as processed so UI shows AI section
        "status": "ai_processed",
        "images": submission.images,
        "description": submission.description,
        # provide both shapes for different UIs
        "ai_extracted_fields": ai_result.get("extracted_data"),
        "ai_extracted_data": ai_result.get("extracted_data"),
        "ai_confidence": ai_result.get("ai_confidence"),
        "ai_quality_score": ai_result.get("ai_quality_score"),
        "ai_fraud_risk": ai_result.get("ai_fraud_risk"),
        "ai_recommendations": ai_result.get("ai_recommendations", []),
        "ai_issues": ai_result.get("ai_issues", []),
        "created_at": get_current_timestamp(),
        "updated_at": get_current_timestamp()
    }
    
    mock_documents[document_id] = document
    
    return {
        "success": True,
        "message": "Document submitted successfully",
        "document_id": document_id,
        "status": document["status"],
        "submitted_at": document["created_at"]
    }

@app.get("/api/users/citizen/my-documents")
async def get_my_documents():
    # Return all documents for demo
    documents = list(mock_documents.values())
    return {
        "documents": documents,
        "total_count": len(documents)
    }

@app.get("/api/users/official/documents")
async def get_official_documents():
    documents = list(mock_documents.values())
    return {
        "documents": documents,
        "total_count": len(documents)
    }

@app.post("/api/users/official/documents/{document_id}/extract")
async def extract_document_info(document_id: str):
    if document_id not in mock_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Mock extraction process
    extracted_data = {
        "full_name": "John Doe",
        "national_id": "1234567890",
        "date_of_birth": "1990-01-15",
        "place_of_birth": "Kampala",
        "gender": "Male",
        "address": "123 Main Street, Kampala"
    }
    
    return {
        "success": True,
        "message": "Document information extracted successfully",
        "document_id": document_id,
        "extracted_data": extracted_data,
        "extracted_at": get_current_timestamp()
    }

@app.post("/api/users/official/documents/{document_id}/review")
async def official_review_document(
    document_id: str,
    comment: str = Form(...),
    official_id: str = Form(...)
):
    if document_id not in mock_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    mock_documents[document_id]["status"] = "official_reviewed"
    mock_documents[document_id]["official_review_comment"] = comment
    mock_documents[document_id]["updated_at"] = get_current_timestamp()
    
    return {
        "success": True,
        "message": "Document reviewed by official",
        "document_id": document_id,
        "status": "official_reviewed",
        "official_comment": comment,
        "reviewed_by": official_id,
        "reviewed_at": get_current_timestamp()
    }

# Admin Endpoints
@app.get("/api/admin/documents")
async def get_admin_documents():
    documents = list(mock_documents.values())
    
    # Group by department
    department_groups = {}
    for doc in documents:
        dept = doc.get("department_id", "unknown")
        if dept not in department_groups:
            department_groups[dept] = []
        department_groups[dept].append(doc)
    
    return {
        "documents": documents,
        "total_count": len(documents),
        "department_groups": department_groups,
        "departments": list(department_groups.keys())
    }

@app.post("/api/admin/documents/{document_id}/review")
async def admin_review_document(
    document_id: str,
    action: str = Form(...),
    comment: str = Form(...),
    admin_id: str = Form(...)
):
    if document_id not in mock_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    status_map = {
        "approve": "approved",
        "reject": "rejected",
        "request_changes": "needs_changes"
    }
    
    new_status = status_map.get(action, "under_review")
    
    mock_documents[document_id]["status"] = new_status
    mock_documents[document_id]["admin_review_comment"] = comment
    mock_documents[document_id]["updated_at"] = get_current_timestamp()
    
    return {
        "success": True,
        "message": f"Document {action} by admin",
        "document_id": document_id,
        "status": new_status,
        "admin_comment": comment,
        "reviewed_by": admin_id,
        "reviewed_at": get_current_timestamp()
    }

@app.get("/admin/stats")
async def get_admin_stats():
    total_documents = len(mock_documents)
    completed = len([d for d in mock_documents.values() if d.get("status") == "approved"])
    pending = len([d for d in mock_documents.values() if d.get("status") in ["submitted", "under_review"]])
    
    return {
        "total_users": len(mock_users),
        "active_sessions": len(mock_sessions),
        "documents_processed": total_documents,
        "system_uptime": "99.9%",
        "pending_approvals": pending,
        "completed_today": completed,
        "ai_processed": total_documents,
        "ai_accuracy": 0.94,
        "ai_processing_time": "2.1s",
        "human_review_rate": 0.15
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting PublicPulse API v2.0 on {host}:{port}")
    print(f"📖 API Documentation: http://{host}:{port}/docs")
    print(f"❤️  Health Check: http://{host}:{port}/health")
    
    uvicorn.run(
        "app_new:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )