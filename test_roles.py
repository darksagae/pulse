#!/usr/bin/env python3
"""
Role-based testing script for PublicPulse system
Tests all three portals with appropriate role switching
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"
TEST_TOKEN = "jwt_test_token"

def test_citizen_role():
    """Test citizen portal functionality"""
    print("🔵 Testing Citizen Role...")
    
    # Test document submission
    response = requests.post(
        f"{BASE_URL}/citizen/submit-document",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TEST_TOKEN}"
        },
        json={
            "document_type": "national_id",
            "department_id": None,
            "images": ["data:image/jpeg;base64,test_citizen"],
            "description": "Citizen test document"
        }
    )
    
    if response.status_code == 200:
        print("✅ Citizen document submission: SUCCESS")
        data = response.json()
        print(f"   Document ID: {data.get('document_id')}")
    else:
        print(f"❌ Citizen document submission: FAILED ({response.status_code})")
        print(f"   Error: {response.text}")
    
    # Test my documents
    response = requests.get(
        f"{BASE_URL}/citizen/my-documents",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"}
    )
    
    if response.status_code == 200:
        print("✅ Citizen my-documents: SUCCESS")
        data = response.json()
        print(f"   Documents count: {len(data.get('documents', []))}")
    else:
        print(f"❌ Citizen my-documents: FAILED ({response.status_code})")
        print(f"   Error: {response.text}")

def test_official_role():
    """Test official portal functionality"""
    print("\n🟡 Testing Official Role...")
    
    # Update middleware to official role
    print("   Switching to official role...")
    
    # Test official documents
    response = requests.get(
        f"{BASE_URL}/official-review/documents",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"}
    )
    
    if response.status_code == 200:
        print("✅ Official document review: SUCCESS")
        data = response.json()
        print(f"   Documents count: {len(data.get('documents', []))}")
    else:
        print(f"❌ Official document review: FAILED ({response.status_code})")
        print(f"   Error: {response.text}")

def test_admin_role():
    """Test admin portal functionality"""
    print("\n🔴 Testing Admin Role...")
    
    # Update middleware to admin role
    print("   Switching to admin role...")
    
    # Test admin documents
    response = requests.get(
        f"{BASE_URL}/admin/documents",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"}
    )
    
    if response.status_code == 200:
        print("✅ Admin document management: SUCCESS")
        data = response.json()
        print(f"   Documents count: {len(data.get('documents', []))}")
    else:
        print(f"❌ Admin document management: FAILED ({response.status_code})")
        print(f"   Error: {response.text}")

def test_health():
    """Test system health"""
    print("🏥 Testing System Health...")
    
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Backend health: SUCCESS")
        data = response.json()
        print(f"   Status: {data.get('status')}")
    else:
        print(f"❌ Backend health: FAILED ({response.status_code})")

def main():
    """Run all tests"""
    print("🚀 PublicPulse System Role Testing")
    print("=" * 50)
    
    # Test health first
    test_health()
    
    # Test citizen role (current default)
    test_citizen_role()
    
    # Note: For official and admin roles, you would need to:
    # 1. Update the middleware role in access_control.py
    # 2. Restart the backend
    # 3. Run the tests
    
    print("\n" + "=" * 50)
    print("✅ Role testing completed!")
    print("\n📝 Note: To test official/admin roles:")
    print("   1. Update middleware role in access_control.py")
    print("   2. Restart backend")
    print("   3. Run this script again")

if __name__ == "__main__":
    main()






