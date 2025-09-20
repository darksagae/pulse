from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime
import os
import base64
import json
from services.ai_service import ai_service, DocumentAnalysis

router = APIRouter()

# In-memory storage for demo purposes (in production, use a database)
documents_storage = []

@router.get("/citizen/my-documents")
async def get_citizen_documents() -> Dict[str, Any]:
    """Get documents for the citizen"""
    try:
        # Return documents from storage
        return {
            "documents": documents_storage,
            "total_count": len(documents_storage)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def determine_department(document_type: str) -> str:
    """Determine which department should handle a document based on its type"""
    department_mapping = {
        'national_id': 'nira',
        'drivers_license': 'nira', 
        'birth_certificate': 'nira',
        'passport': 'immigration',
        'visa': 'immigration',
        'marriage_certificate': 'ursb',
        'business_registration': 'ursb',
        'tax_certificate': 'finance',
        'health_certificate': 'health',
        'other': 'nira'  # Default to NIRA for unknown types
    }
    return department_mapping.get(document_type, 'nira')

@router.post("/citizen/submit-document")
async def submit_citizen_document(request: Dict[str, Any]) -> Dict[str, Any]:
    """Submit a document as a citizen with AI analysis"""
    try:
        document_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        images = request.get("images", [])
        description = request.get("description", "")
        
        # AI Analysis using Gemini 1.5 Pro (primary) or GPT-4o (fallback)
        ai_analysis = None
        try:
            ai_analysis = await ai_service.process_citizen_document(images, description)
            document_type = ai_analysis.document_type
        except Exception as e:
            # Fallback to manual document type if AI fails
            document_type = request.get("document_type", "unknown")
            print(f"AI analysis failed, using manual type: {e}")
        
        # Auto-assign to correct department based on AI-determined or manual document type
        assigned_department = determine_department(document_type)
        
        # Create document object with images and AI analysis
        citizen_id = request.get("citizen_id", "citizen_001")
        document = {
            "id": document_id,
            "citizen_id": citizen_id,
            "user_id": citizen_id,  # Add user_id for frontend compatibility
            "document_type": document_type,
            "department_id": assigned_department,
            "status": "submitted",
            "images": images,  # Store base64 images
            "description": description,
            "assigned_official_id": None,  # Will be assigned later
            "official_review_comment": None,
            "official_reviewed_at": None,
            "admin_review_comment": None,
            "admin_reviewed_at": None,
            "created_at": current_time,
            "updated_at": current_time,
            # AI Analysis fields
            "ai_analysis": {
                "extracted_text": ai_analysis.extracted_text if ai_analysis else "",
                "confidence_score": ai_analysis.confidence_score if ai_analysis else 0.0,
                "metadata": ai_analysis.metadata if ai_analysis else {},
                "ai_model_used": "gemini-1.5-pro" if ai_analysis else "manual"
            } if ai_analysis else None
        }
        
        # Store document
        documents_storage.append(document)
        
        return {
            "success": True,
            "message": f"Document submitted successfully and assigned to {assigned_department.upper()} department",
            "document_id": document_id,
            "status": "submitted",
            "assigned_department": assigned_department,
            "submitted_at": current_time,
            "ai_analysis": document["ai_analysis"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/official/documents")
async def get_official_documents() -> Dict[str, Any]:
    """Get all documents for officials to review"""
    try:
        return {
            "documents": documents_storage,
            "total_count": len(documents_storage)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/official/documents/department/{department_id}")
async def get_department_documents(department_id: str) -> Dict[str, Any]:
    """Get documents assigned to a specific department"""
    try:
        department_docs = [doc for doc in documents_storage if doc.get("department_id") == department_id]
        return {
            "documents": department_docs,
            "total_count": len(department_docs),
            "department": department_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/official/documents/assigned/{official_id}")
async def get_assigned_documents(official_id: str) -> Dict[str, Any]:
    """Get documents assigned to a specific official"""
    try:
        assigned_docs = [doc for doc in documents_storage if doc.get("assigned_official_id") == official_id]
        return {
            "documents": assigned_docs,
            "total_count": len(assigned_docs),
            "official_id": official_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/official/documents/{document_id}/review")
async def official_review_document(document_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
    """Official reviews a document with AI validation and submits to admin"""
    try:
        # Find the document
        document = next((doc for doc in documents_storage if doc["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # AI Validation using GPT-4o (primary) or Gemini (fallback)
        ai_validation = None
        try:
            # Create initial analysis from existing data
            initial_analysis = DocumentAnalysis(
                document_type=document["document_type"],
                extracted_text=document.get("ai_analysis", {}).get("extracted_text", ""),
                confidence_score=document.get("ai_analysis", {}).get("confidence_score", 0.0),
                metadata=document.get("ai_analysis", {}).get("metadata", {}),
                validation_status="pending"
            )
            
            ai_validation = await ai_service.process_official_document(document["images"], initial_analysis)
        except Exception as e:
            print(f"AI validation failed: {e}")
        
        # Update document with official review and AI validation
        current_time = datetime.now().isoformat()
        document["status"] = "official_reviewed"
        document["official_review_comment"] = request.get("comment", "")
        document["official_reviewed_at"] = current_time
        document["updated_at"] = current_time
        
        # Add AI validation results
        if ai_validation:
            if "ai_validation" not in document:
                document["ai_validation"] = {}
            document["ai_validation"].update({
                "validation_status": ai_validation.validation_status,
                "extracted_text": ai_validation.extracted_text,
                "confidence_score": ai_validation.confidence_score,
                "corrections": ai_validation.metadata.get("corrections", []),
                "ai_model_used": "gpt-4o"
            })
        
        return {
            "success": True,
            "message": "Document reviewed by official and submitted to admin",
            "document_id": document_id,
            "status": "official_reviewed",
            "reviewed_at": current_time,
            "ai_validation": document.get("ai_validation")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/documents")
async def get_admin_documents() -> Dict[str, Any]:
    """Get all documents for admin review"""
    try:
        # Get documents that have been reviewed by officials
        admin_docs = [doc for doc in documents_storage if doc.get("status") == "official_reviewed"]
        
        # Group documents by department for better organization
        department_groups = {}
        for doc in admin_docs:
            dept = doc.get("department_id", "unknown")
            if dept not in department_groups:
                department_groups[dept] = []
            department_groups[dept].append(doc)
        
        return {
            "documents": admin_docs,
            "total_count": len(admin_docs),
            "department_groups": department_groups,
            "departments": list(department_groups.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/documents/{document_id}/review")
async def admin_review_document(document_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
    """Admin reviews a document with AI assessment and makes final decision"""
    try:
        # Find the document
        document = next((doc for doc in documents_storage if doc["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # AI Assessment using Llama 3.1 (primary) or GPT-4o (fallback)
        ai_assessment = None
        try:
            # Create official analysis from existing data
            official_analysis = DocumentAnalysis(
                document_type=document["document_type"],
                extracted_text=document.get("ai_validation", {}).get("extracted_text", 
                    document.get("ai_analysis", {}).get("extracted_text", "")),
                confidence_score=document.get("ai_validation", {}).get("confidence_score", 
                    document.get("ai_analysis", {}).get("confidence_score", 0.0)),
                metadata=document.get("ai_validation", {}).get("metadata", 
                    document.get("ai_analysis", {}).get("metadata", {})),
                validation_status=document.get("ai_validation", {}).get("validation_status", "pending")
            )
            
            ai_assessment = await ai_service.process_admin_document(document["images"], official_analysis)
        except Exception as e:
            print(f"AI assessment failed: {e}")
        
        # Update document with admin review and AI assessment
        current_time = datetime.now().isoformat()
        final_status = request.get("status", "approved")  # approved, rejected, needs_changes
        document["status"] = final_status
        document["admin_review_comment"] = request.get("comment", "")
        document["admin_reviewed_at"] = current_time
        document["updated_at"] = current_time
        
        # Add AI assessment results
        if ai_assessment:
            if "ai_assessment" not in document:
                document["ai_assessment"] = {}
            document["ai_assessment"].update({
                "assessment_status": ai_assessment.assessment_status,
                "summary": ai_assessment.summary,
                "compliance_check": ai_assessment.metadata.get("compliance_check", {}),
                "recommendations": ai_assessment.metadata.get("recommendations", []),
                "ai_model_used": "llama-3.1-405b"
            })
        
        return {
            "success": True,
            "message": f"Document {final_status} by admin",
            "document_id": document_id,
            "status": final_status,
            "reviewed_at": current_time,
            "ai_assessment": document.get("ai_assessment")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/official/documents/{document_id}")
async def get_document_by_id(document_id: str) -> Dict[str, Any]:
    """Get a specific document by ID for officials"""
    try:
        document = next((doc for doc in documents_storage if doc["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/official/documents/{document_id}/extract")
async def extract_document_information(document_id: str) -> Dict[str, Any]:
    """Extract detailed information from document using AI"""
    try:
        # Find the document
        document = next((doc for doc in documents_storage if doc["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # AI Extraction
        ai_extraction = None
        try:
            ai_extraction = await ai_service.extract_document_information(document["images"])
        except Exception as e:
            print(f"AI extraction failed: {e}")
        
        # Update document with extraction results
        current_time = datetime.now().isoformat()
        if ai_extraction:
            if "ai_extraction" not in document:
                document["ai_extraction"] = {}
            document["ai_extraction"].update({
                "extracted_text": ai_extraction.extracted_text,
                "confidence_score": ai_extraction.confidence_score,
                "metadata": ai_extraction.metadata,
                "extracted_at": current_time,
                "ai_model_used": "gemini-1.5-pro"
            })
            document["updated_at"] = current_time
        
        return {
            "success": True,
            "message": "Document information extracted successfully",
            "document_id": document_id,
            "extracted_data": document.get("ai_extraction"),
            "extracted_at": current_time
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/documents/{document_id}/analyze-fraud")
async def analyze_document_fraud(document_id: str) -> Dict[str, Any]:
    """Analyze document for fraud using AI"""
    try:
        # Find the document
        document = next((doc for doc in documents_storage if doc["id"] == document_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get extracted data for fraud analysis
        extracted_data = None
        if document.get("ai_extraction"):
            extracted_data = DocumentAnalysis(
                document_type=document["document_type"],
                extracted_text=document["ai_extraction"].get("extracted_text", ""),
                confidence_score=document["ai_extraction"].get("confidence_score", 0.0),
                metadata=document["ai_extraction"].get("metadata", {}),
                validation_status="extracted"
            )
        else:
            # Create basic analysis if no extraction data
            extracted_data = DocumentAnalysis(
                document_type=document["document_type"],
                extracted_text=document.get("ai_analysis", {}).get("extracted_text", ""),
                confidence_score=document.get("ai_analysis", {}).get("confidence_score", 0.0),
                metadata=document.get("ai_analysis", {}).get("metadata", {}),
                validation_status="pending"
            )
        
        # AI Fraud Analysis
        fraud_analysis = None
        try:
            fraud_analysis = await ai_service.analyze_fraud(document["images"], extracted_data)
        except Exception as e:
            print(f"AI fraud analysis failed: {e}")
        
        # Update document with fraud analysis results
        current_time = datetime.now().isoformat()
        if fraud_analysis:
            if "ai_fraud_analysis" not in document:
                document["ai_fraud_analysis"] = {}
            document["ai_fraud_analysis"].update({
                "fraud_risk_level": fraud_analysis.metadata.get("fraud_analysis", {}).get("fraud_risk_level", "unknown"),
                "fraud_indicators": fraud_analysis.metadata.get("fraud_analysis", {}).get("fraud_indicators", []),
                "authenticity_score": fraud_analysis.metadata.get("fraud_analysis", {}).get("authenticity_score", 0.0),
                "recommendations": fraud_analysis.metadata.get("fraud_analysis", {}).get("recommendations", []),
                "summary": fraud_analysis.summary,
                "analyzed_at": current_time,
                "ai_model_used": "llama-3.1-405b"
            })
            document["updated_at"] = current_time
        
        return {
            "success": True,
            "message": "Fraud analysis completed successfully",
            "document_id": document_id,
            "fraud_analysis": document.get("ai_fraud_analysis"),
            "analyzed_at": current_time
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))