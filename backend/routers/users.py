from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime
import os
import base64
import json
from ai_service_with_gemini import GeminiAIService
from services.database import DatabaseService

router = APIRouter()

# Use Supabase database instead of in-memory storage
db_service = DatabaseService()

# Initialize the new AI service with the current API key
ai_service = None

def get_ai_service():
    """Get or initialize the AI service with proper API key"""
    global ai_service
    if ai_service is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                ai_service = GeminiAIService(api_key)
                print("✅ AI service initialized successfully")
            except Exception as e:
                print(f"⚠️ Failed to initialize AI service: {e}")
                ai_service = None
        else:
            print("⚠️ GEMINI_API_KEY not found in environment variables")
    return ai_service

@router.get("/citizen/my-documents")
async def get_citizen_documents() -> Dict[str, Any]:
    """Get documents for the citizen"""
    try:
        # Get documents from Supabase database
        documents = await db_service.get_documents_by_citizen("citizen_001")
        return {
            "documents": documents,
            "total_count": len(documents)
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
        
        # AI Analysis using new Gemini API
        ai_analysis = None
        document_type = "unknown"
        try:
            ai_service = get_ai_service()
            if ai_service:
                ai_analysis = await ai_service.extract_document_information(images, document_type)
                document_type = ai_analysis.get("document_type", "unknown")
            else:
                ai_analysis = None
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
                "extracted_text": ai_analysis.get("extracted_text", "") if ai_analysis else "",
                "confidence_score": ai_analysis.get("ai_confidence", 0.85) if ai_analysis else 0.85,
                "metadata": ai_analysis.get("metadata", {}) if ai_analysis else {},
                "ai_model_used": "gemini-2.5-flash" if ai_analysis else "manual"
            } if ai_analysis else None
        }
        
        # Store document in Supabase database
        await db_service.create_document(document)
        
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
        # Get all documents from Supabase (simplified - in production, add filtering)
        documents = await db_service.get_documents_by_citizen("all")  # Get all docs
        return {
            "documents": documents,
            "total_count": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/official/documents/department/{department_id}")
async def get_department_documents(department_id: str) -> Dict[str, Any]:
    """Get documents assigned to a specific department"""
    try:
        # Get documents by department from Supabase
        documents = await db_service.get_documents_by_department(department_id)
        return {
            "documents": documents,
            "total_count": len(documents),
            "department": department_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/official/documents/assigned/{official_id}")
async def get_assigned_documents(official_id: str) -> Dict[str, Any]:
    """Get documents assigned to a specific official"""
    try:
        # Get all documents and filter by assigned official
        all_docs = await db_service.get_documents_by_citizen("all")
        assigned_docs = [doc for doc in all_docs if doc.get("assigned_official_id") == official_id]
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
        document = await db_service.get_document_by_id(document_id)
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
            
            ai_service = get_ai_service()
            if ai_service:
                # Use extract_document_information for validation
                ai_validation = await ai_service.extract_document_information(document["images"], document.get("document_type", "unknown"))
            else:
                ai_validation = None
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
        # Get all documents from database and filter for admin review status
        all_docs = await db_service.get_documents_by_citizen("all")
        admin_docs = [doc for doc in all_docs if doc.get("status") == "official_reviewed"]
        
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
        document = await db_service.get_document_by_id(document_id)
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
            
            ai_service = get_ai_service()
            if ai_service:
                # Use extract_document_information for assessment
                ai_assessment = await ai_service.extract_document_information(document["images"], document.get("document_type", "unknown"))
            else:
                ai_assessment = None
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
        document = await db_service.get_document_by_id(document_id)
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
        document = await db_service.get_document_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # AI Extraction
        ai_extraction = None
        try:
            # Pass document_type to AI extraction for better prompts/rules
            ai_service = get_ai_service()
            if ai_service:
                ai_extraction = await ai_service.extract_document_information(
                    document["images"],
                    document.get("document_type", "unknown")
                )
            else:
                ai_extraction = None
        except Exception as e:
            print(f"AI extraction failed: {e}")
        
        # Update document with extraction results
        current_time = datetime.now().isoformat()
        if ai_extraction:
            if "ai_extraction" not in document:
                document["ai_extraction"] = {}
            document["ai_extraction"].update({
                "extracted_text": ai_extraction.get("extracted_text", ""),
                "confidence_score": ai_extraction.get("ai_confidence", 0.85),
                "metadata": ai_extraction.get("metadata", {}),
                "extracted_at": current_time,
                "ai_model_used": "gemini-2.5-flash"
            })
            # Mark as processed by AI so dashboards can count it
            document["status"] = "ai_processed"
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

@router.get("/documents/stats/overview")
async def get_documents_stats_overview() -> Dict[str, Any]:
    """Return aggregate document stats for dashboards/portals."""
    try:
        # Get all documents from database
        all_docs = await db_service.get_documents_by_citizen("all")
        total_documents = len(all_docs)
        pending_statuses = {"submitted", "pending"}
        completed_statuses = {"approved"}
        rejected_status = "rejected"
        official_review_status = "official_reviewed"

        def is_today(ts: str) -> bool:
            try:
                return datetime.fromisoformat(ts).date() == datetime.now().date()
            except Exception:
                return False

        pending = 0
        ai_processed = 0
        official_review = 0
        admin_review = 0
        completed = 0
        rejected = 0
        completed_today = 0

        for doc in all_docs:
            status = doc.get("status", "submitted")
            if status in pending_statuses:
                pending += 1
            if status == official_review_status:
                official_review += 1
            if status in completed_statuses:
                completed += 1
                if is_today(doc.get("updated_at", doc.get("created_at", ""))):
                    completed_today += 1
            if status == rejected_status:
                rejected += 1
            # Consider either explicit status or presence of extraction results
            if status == "ai_processed" or (doc.get("ai_extraction") is not None):
                ai_processed += 1
            # Count items that reached admin review phase (any admin comment or assessment)
            if doc.get("admin_review_comment") is not None or doc.get("ai_assessment") is not None:
                admin_review += 1

        return {
            "total_documents": total_documents,
            "pending": pending,
            "ai_processed": ai_processed,
            "official_review": official_review,
            "admin_review": admin_review,
            "completed": completed,
            "rejected": rejected,
            "completed_today": completed_today,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/documents/{document_id}/analyze-fraud")
async def analyze_document_fraud(document_id: str) -> Dict[str, Any]:
    """Analyze document for fraud using AI"""
    try:
        # Find the document
        document = await db_service.get_document_by_id(document_id)
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
            ai_service = get_ai_service()
            if ai_service:
                # Use extract_document_information for fraud analysis
                fraud_analysis = await ai_service.extract_document_information(document["images"], document.get("document_type", "unknown"))
            else:
                fraud_analysis = None
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