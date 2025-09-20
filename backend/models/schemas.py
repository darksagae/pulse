# Basic data models for PublicPulse (without Pydantic for compatibility)

from typing import Optional, List, Dict, Any
from datetime import datetime

# User roles
class UserRole:
    CITIZEN = "citizen"
    OFFICIAL = "official"
    ADMIN = "admin"

# Document statuses
class DocumentStatus:
    PENDING = "pending"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

# Departments
class Department:
    NIRA = "nira"
    URSB = "ursb"
    IMMIGRATION = "immigration"
    FINANCE = "finance"
    HEALTH = "health"

# Basic data structures
def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a user object"""
    return {
        "id": user_data.get("id", ""),
        "email": user_data.get("email", ""),
        "full_name": user_data.get("full_name", ""),
        "role": user_data.get("role", UserRole.CITIZEN),
        "department": user_data.get("department"),
        "created_at": user_data.get("created_at", datetime.now().isoformat()),
        "updated_at": user_data.get("updated_at", datetime.now().isoformat()),
        "is_active": user_data.get("is_active", True)
    }

def create_document(document_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a document object"""
    return {
        "id": document_data.get("id", ""),
        "citizen_id": document_data.get("citizen_id", ""),
        "document_type": document_data.get("document_type", ""),
        "department_id": document_data.get("department_id", ""),
        "status": document_data.get("status", DocumentStatus.PENDING),
        "images": document_data.get("images", []),
        "created_at": document_data.get("created_at", datetime.now().isoformat()),
        "updated_at": document_data.get("updated_at", datetime.now().isoformat())
    }


def create_document_submission_response(success: bool, message: str, **kwargs) -> Dict[str, Any]:
    """Create a document submission response"""
    return {
        "success": success,
        "message": message,
        "document_id": kwargs.get("document_id", ""),
        "status": kwargs.get("status", DocumentStatus.SUBMITTED),
        "submitted_at": kwargs.get("submitted_at", datetime.now().isoformat())
    }