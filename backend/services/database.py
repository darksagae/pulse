from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mxrosjbwcfxygrrilpkq.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class DatabaseService:
    def __init__(self):
        self.supabase = supabase
    
    # User operations
    async def create_user(self, user_data: dict):
        """Create a new user"""
        try:
            result = self.supabase.table("users").insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    async def get_user_by_email(self, email: str):
        """Get user by email"""
        try:
            result = self.supabase.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str):
        """Get user by ID"""
        try:
            result = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    # Document operations
    async def create_document(self, document_data: dict):
        """Create a new document"""
        try:
            result = self.supabase.table("documents").insert(document_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating document: {e}")
            return None
    
    async def get_documents_by_citizen(self, citizen_id: str):
        """Get documents by citizen ID"""
        try:
            result = self.supabase.table("documents").select("*").eq("citizen_id", citizen_id).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting documents: {e}")
            return []
    
    async def get_documents_by_department(self, department: str):
        """Get documents by department"""
        try:
            result = self.supabase.table("documents").select("*").eq("department", department).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting documents: {e}")
            return []
    
    async def update_document_status(self, document_id: str, status: str, assigned_official: str = None):
        """Update document status"""
        try:
            update_data = {"status": status, "updated_at": "now()"}
            if assigned_official:
                update_data["assigned_official"] = assigned_official
            
            result = self.supabase.table("documents").update(update_data).eq("id", document_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating document: {e}")
            return None
    
    # Department operations
    async def get_department_info(self, department: str):
        """Get department information"""
        try:
            result = self.supabase.table("departments").select("*").eq("id", department).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting department: {e}")
            return None
    
    async def get_workload_stats(self, department: str):
        """Get workload statistics for a department"""
        try:
            # Get total officials in department
            officials_result = self.supabase.table("users").select("id").eq("department", department).eq("role", "official").execute()
            total_officials = len(officials_result.data) if officials_result.data else 0
            
            # Get available officials (not assigned to documents)
            assigned_result = self.supabase.table("documents").select("assigned_official").eq("department", department).in_("status", ["pending", "in_review"]).execute()
            assigned_officials = set([doc["assigned_official"] for doc in assigned_result.data if doc["assigned_official"]])
            available_officials = total_officials - len(assigned_officials)
            
            utilization_percentage = ((total_officials - available_officials) / total_officials * 100) if total_officials > 0 else 0
            
            return {
                "total_officials": total_officials,
                "available_officials": available_officials,
                "utilization_percentage": round(utilization_percentage, 2),
                "total_capacity": total_officials,
                "average_utilization": round(utilization_percentage, 2)
            }
        except Exception as e:
            print(f"Error getting workload stats: {e}")
            return {
                "total_officials": 0,
                "available_officials": 0,
                "utilization_percentage": 0,
                "total_capacity": 0,
                "average_utilization": 0
            }
    
    async def get_document_queue_stats(self, department: str):
        """Get document queue statistics for a department"""
        try:
            result = self.supabase.table("documents").select("status").eq("department", department).execute()
            
            if not result.data:
                return {"pending": 0, "in_review": 0, "completed": 0, "escalated": 0}
            
            status_counts = {}
            for doc in result.data:
                status = doc["status"]
                status_counts[status] = status_counts.get(status, 0) + 1
            
            return {
                "pending": status_counts.get("pending", 0),
                "in_review": status_counts.get("in_review", 0),
                "completed": status_counts.get("completed", 0),
                "escalated": status_counts.get("escalated", 0)
            }
        except Exception as e:
            print(f"Error getting queue stats: {e}")
            return {"pending": 0, "in_review": 0, "completed": 0, "escalated": 0}

# Global database service instance
db_service = DatabaseService()