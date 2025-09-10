#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append('/home/darkarmy/Desktop/DOC/backend')

from services.ai_service import ai_service

async def test_ai_service():
    print("Testing AI Service with Gemini 1.5 Flash...")
    
    # Test with a simple text description
    test_images = []  # No images for this test
    test_description = "Test document submission"
    
    try:
        print("1. Testing citizen document processing...")
        result = await ai_service.process_citizen_document(test_images, test_description)
        print(f"   Result: {result}")
        print(f"   Document Type: {result.document_type}")
        print(f"   Confidence: {result.confidence_score}")
        print(f"   Metadata: {result.metadata}")
        
        print("\n2. Testing document extraction...")
        extract_result = await ai_service.extract_document_information(test_images)
        print(f"   Extract Result: {extract_result}")
        
        print("\n3. Testing fraud analysis...")
        fraud_result = await ai_service.analyze_fraud(test_images, result)
        print(f"   Fraud Result: {fraud_result}")
        
        print("\n✅ AI Service is working!")
        
    except Exception as e:
        print(f"❌ AI Service error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_service())
