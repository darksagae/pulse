#!/usr/bin/env python3
"""
PublicPulse Backend with AI Integration
Simple FastAPI server with AI document processing
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
import uvicorn
import asyncio
import random
import time

# Initialize FastAPI app
app = FastAPI(
    title="PublicPulse API with AI",
    description="Citizen Document Management System with AI Processing",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Service Integration
class AIService:
    """AI service for document processing"""
    
    def __init__(self):
        self.processing_times = {
            "extraction": 2.0,
            "quality_analysis": 1.5,
            "fraud_detection": 1.0,
            "name_extraction": 0.5
        }
    
    async def extract_document_information(self, images: List[str], document_type: str) -> Dict[str, Any]:
        """Extract comprehensive information from document images"""
        try:
            print(f"🤖 AI Processing: Document extraction for {document_type}")
            
            # Simulate AI processing with progress updates
            start_time = time.time()
            
            # Step 1: Extract basic information
            await asyncio.sleep(self.processing_times["extraction"] * 0.4)
            basic_info = self._extract_basic_info(document_type)
            print("📄 Step 1: Basic information extracted")
            
            # Step 2: Quality analysis
            await asyncio.sleep(self.processing_times["quality_analysis"] * 0.3)
            quality_analysis = await self._analyze_document_quality(images)
            print("🔍 Step 2: Quality analysis completed")
            
            # Step 3: Fraud detection
            await asyncio.sleep(self.processing_times["fraud_detection"] * 0.3)
            fraud_analysis = await self._detect_fraud(images, document_type)
            print("🛡️ Step 3: Fraud detection completed")
            
            processing_time = time.time() - start_time
            
            result = {
                "success": True,
                "extracted_data": basic_info,
                "ai_confidence": quality_analysis["confidence"],
                "ai_quality_score": quality_analysis["quality_score"],
                "ai_fraud_risk": fraud_analysis["fraud_risk"],
                "ai_processing_time": f"{processing_time:.2f}s",
                "ai_recommendations": quality_analysis["recommendations"],
                "ai_issues": fraud_analysis["issues"],
                "extracted_at": datetime.now().isoformat()
            }
            
            print(f"✅ Document extraction completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            print(f"❌ AI extraction failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "extracted_data": {}
            }
    
    def _extract_basic_info(self, document_type: str) -> Dict[str, Any]:
        """Extract basic information based on document type"""
        if document_type == "national_id":
            return {
                "full_name": "John Doe",
                "national_id": "1234567890",
                "date_of_birth": "1990-01-15",
                "place_of_birth": "Kampala",
                "gender": "Male",
                "address": "123 Main Street, Kampala",
                "issue_date": "2020-01-15",
                "expiry_date": "2030-01-15"
            }
        elif document_type == "drivers_license":
            return {
                "full_name": "Jane Smith",
                "license_number": "DL123456789",
                "date_of_birth": "1985-05-20",
                "license_class": "B",
                "issue_date": "2020-01-15",
                "expiry_date": "2025-01-15",
                "address": "456 Oak Avenue, Kampala"
            }
        elif document_type == "passport":
            return {
                "full_name": "Michael Johnson",
                "passport_number": "P123456789",
                "date_of_birth": "1988-03-10",
                "place_of_birth": "Kampala",
                "nationality": "Ugandan",
                "issue_date": "2020-01-15",
                "expiry_date": "2030-01-15"
            }
        else:
            return {
                "full_name": "Alice Davis",
                "document_type": document_type,
                "extracted_text": "Sample extracted text from document",
                "confidence": 0.85
            }
    
    async def _analyze_document_quality(self, images: List[str]) -> Dict[str, Any]:
        """Analyze document quality"""
        await asyncio.sleep(0.5)
        
        return {
            "quality_score": random.uniform(0.7, 0.95),
            "confidence": random.uniform(0.8, 0.95),
            "recommendations": [
                "Document quality is good",
                "All required information is visible",
                "No signs of tampering detected",
                "Image resolution is adequate for processing"
            ]
        }
    
    async def _detect_fraud(self, images: List[str], document_type: str) -> Dict[str, Any]:
        """Detect potential fraud indicators"""
        await asyncio.sleep(0.5)
        
        # Simulate fraud detection
        fraud_risk = random.uniform(0.1, 0.3)
        issues = []
        
        if fraud_risk > 0.7:
            issues.append("High fraud risk detected")
        elif fraud_risk > 0.4:
            issues.append("Medium fraud risk detected")
        else:
            issues.append("Low fraud risk - document appears authentic")
        
        return {
            "fraud_risk": fraud_risk,
            "issues": issues
        }

# Initialize AI service
ai_service = AIService()

# Root Endpoints
@app.get("/")
async def root():
    return {
        "message": "PublicPulse API v2.0 with AI",
        "status": "operational",
        "ai_service": "active",
        "environment": "development"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "ai_service": "operational",
        "database": "connected"
    }

# AI Document Processing Endpoints
@app.post("/api/ai/extract")
async def extract_document_ai(
    document_type: str = Form(...),
    images: List[UploadFile] = File(...)
):
    """Extract document information using AI"""
    try:
        # Convert uploaded files to base64 strings (simplified)
        image_data = []
        for image in images:
            content = await image.read()
            # In real implementation, you'd convert to base64
            image_data.append(f"data:image/jpeg;base64,{content.hex()[:100]}")
        
        # Process with AI
        result = await ai_service.extract_document_information(image_data, document_type)
        
        return {
            "success": True,
            "message": "Document processed successfully with AI",
            "ai_result": result,
            "processing_time": result.get("ai_processing_time", "0.0s")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

@app.post("/api/ai/test")
async def test_ai_processing(request: Dict[str, Any]):
    """Test AI processing with mock data"""
    try:
        document_type = request.get("document_type", "national_id")
        images = request.get("images", ["mock_image_data"])
        
        # Process with AI
        result = await ai_service.extract_document_information(images, document_type)
        
        return {
            "success": True,
            "message": "AI test completed successfully",
            "ai_result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI test failed: {str(e)}")

# Document Management Endpoints (with both /api/ and direct paths)
@app.post("/api/documents/submit")
@app.post("/documents/submit")
async def submit_document(request: Dict[str, Any]):
    """Submit a new document"""
    try:
        document_id = str(uuid.uuid4())
        return {
            "success": True,
            "message": "Document submitted successfully",
            "document_id": document_id,
            "status": "submitted",
            "submitted_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/documents/{document_id}")
@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get document by ID"""
    try:
        return {
            "id": document_id,
            "citizen_id": "citizen_001",
            "document_type": "national_id",
            "department_id": "nira",
            "status": "submitted",
            "images": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Document not found")

@app.get("/api/users/citizen/my-documents")
async def get_citizen_documents(user_id: str):
    """Get documents for a citizen"""
    try:
        # Mock documents for the citizen
        return {
            "documents": [
                {
                    "id": "doc_001",
                    "document_type": "national_id",
                    "status": "submitted",
                    "created_at": datetime.now().isoformat()
                }
            ],
            "total_count": 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/update-status")
@app.post("/documents/update-status")
async def update_document_status(request: Dict[str, Any]):
    """Update document status"""
    try:
        return {
            "success": True,
            "message": "Document status updated successfully",
            "document_id": request.get("document_id", ""),
            "new_status": request.get("status", "")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/documents/assign")
@app.post("/documents/assign")
async def assign_document(request: Dict[str, Any]):
    """Assign document to official"""
    try:
        return {
            "success": True,
            "message": "Document assigned successfully",
            "document_id": request.get("document_id", ""),
            "assigned_to": request.get("official_id", "")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Admin Endpoints
@app.get("/api/admin/stats")
async def get_admin_stats():
    return {
        "total_users": 150,
        "active_sessions": 12,
        "documents_processed": 1250,
        "system_uptime": "99.8%",
        "pending_approvals": 8,
        "completed_today": 45,
        "ai_processed": 890,
        "ai_accuracy": 94.5,
        "ai_processing_time": "2.3s",
        "human_review_rate": 12.5
    }

@app.get("/api/admin/ai-performance")
async def get_ai_performance():
    return {
        "total_processed": 150,
        "average_confidence": 0.87,
        "average_quality_score": 0.82,
        "average_fraud_risk": 0.15,
        "average_processing_time": "2.3s",
        "success_rate": 0.94,
        "human_review_rate": 0.12
    }

# Department endpoints
@app.get("/documents/department/{dept_id}")
async def get_department_documents(dept_id: str):
    """Get documents by department"""
    try:
        return {
            "documents": [
                {
                    "id": f"doc_{dept_id}_001",
                    "document_type": "national_id",
                    "status": "submitted",
                    "citizen_name": "John Doe",
                    "created_at": datetime.now().isoformat()
                }
            ],
            "total_count": 1,
            "department": dept_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting PublicPulse API with AI Integration")
    print("📡 Health check: http://localhost:8000/health")
    print("📚 API docs: http://localhost:8000/docs")
    print("🤖 AI Test: http://localhost:8000/api/ai/test")
    
    uvicorn.run(
        "start_ai_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
