#!/bin/bash

# Deployment Script for Image Processing Updates
# This script commits and pushes all changes to trigger auto-deployment on Render

echo "🚀 PublicPulse - Image Processing Update Deployment"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Changes Summary:"
echo "  ✅ Image merging for multiple photos"
echo "  ✅ Image optimization for large files"
echo "  ✅ No more size limits"
echo "  ✅ Complete data extraction"
echo ""

# Show git status
echo "📁 Current Git Status:"
git status --short
echo ""

# Confirm deployment
read -p "❓ Do you want to commit and deploy these changes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "📝 Committing changes..."

# Add all changes
git add .

# Create commit with detailed message
git commit -m "Add image merging and optimization features

Major improvements to image processing:

1. Image Merging
   - Automatically combines multiple images into one
   - Side-by-side layout for ID cards
   - Better AI extraction from both sides

2. Image Optimization
   - Removes all size limits
   - Automatic compression for large images
   - Binary search for optimal quality
   - Fits within Gemini API limits (3.5MB)

3. Enhanced UX
   - Visual feedback during optimization
   - Clear status messages
   - Detailed console logging

Files Added:
- frontend/src/lib/image-merger.ts
- frontend/src/lib/image-optimizer.ts

Files Modified:
- frontend/src/components/CitizenPage.tsx
- frontend/src/lib/gemini-ai-service.ts

Documentation:
- IMAGE_MERGING_FEATURE.md
- IMAGE_SIZE_FIX.md
- IMAGE_PROCESSING_UPDATE.md
- DEPLOYMENT_CHANGES.md

No backend changes required.
"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful"
    echo ""
    echo "🚀 Pushing to GitHub..."
    
    # Push to origin
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Changes pushed to GitHub"
        echo ""
        echo "📡 Render will now automatically deploy your changes"
        echo "   This usually takes 2-3 minutes"
        echo ""
        echo "🔍 Next Steps:"
        echo "   1. Check Render dashboard for deployment status"
        echo "   2. Wait for 'Deployed' status"
        echo "   3. Test by uploading large images"
        echo "   4. Verify data extraction is complete"
        echo ""
        echo "📚 Documentation:"
        echo "   - IMAGE_PROCESSING_UPDATE.md (main overview)"
        echo "   - IMAGE_MERGING_FEATURE.md (merge details)"
        echo "   - IMAGE_SIZE_FIX.md (optimizer details)"
        echo "   - DEPLOYMENT_CHANGES.md (deployment guide)"
        echo ""
        echo "✨ Both issues are now resolved!"
    else
        echo "❌ Push failed. Please check your git configuration and network"
        exit 1
    fi
else
    echo "❌ Commit failed. Please check the error messages above"
    exit 1
fi

