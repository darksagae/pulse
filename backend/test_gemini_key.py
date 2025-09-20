#!/usr/bin/env python3
"""
Test script to check if the provided Gemini API key is working
"""

import asyncio
import json
import google.generativeai as genai

async def test_gemini_api_key():
    """Test the provided Gemini API key"""
    
    # Test API key
    api_key = "AIzaSyDhyBfHI9XB5Kjj136NBe-YMJVJOJMuVKU"
    
    print("Testing Gemini API Key...")
    print("=" * 50)
    print(f"API Key: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test with a simple text prompt
        print("1. Testing with text prompt...")
        response = await asyncio.to_thread(
            model.generate_content,
            "Hello, this is a test. Please respond with 'API key is working' if you can see this message."
        )
        
        print(f"   Response: {response.text}")
        print("   ✅ Text generation working!")
        print()
        
        # Test with image (using a simple base64 test image)
        print("2. Testing with image analysis...")
        test_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        
        # Remove data URL prefix
        img_data = test_image.split(',')[1]
        
        response = await asyncio.to_thread(
            model.generate_content,
            [
                "Analyze this image and tell me what you see. Return JSON with: document_type, extracted_text, confidence_score",
                {
                    "mime_type": "image/jpeg",
                    "data": img_data
                }
            ]
        )
        
        print(f"   Response: {response.text}")
        print("   ✅ Image analysis working!")
        print()
        
        print("🎉 SUCCESS: API key is working perfectly!")
        print("   - Text generation: ✅")
        print("   - Image analysis: ✅")
        print("   - Ready for production use!")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print()
        
        # Check specific error types
        if "quota" in str(e).lower():
            print("   Issue: Quota exceeded")
        elif "api_key" in str(e).lower():
            print("   Issue: Invalid API key")
        elif "permission" in str(e).lower():
            print("   Issue: Permission denied")
        elif "billing" in str(e).lower():
            print("   Issue: Billing not set up")
        else:
            print(f"   Issue: {type(e).__name__}")
        
        return False

if __name__ == "__main__":
    asyncio.run(test_gemini_api_key())
