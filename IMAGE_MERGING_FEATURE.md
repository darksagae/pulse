# Image Merging Feature

## Overview
This feature automatically combines multiple uploaded images into a single image before AI processing. This solves the problem where only the first image was being read properly when users uploaded multiple photos.

## How It Works

### 1. Upload Multiple Images
When users upload 2 or more images (e.g., front and back of an ID card):
- The images are converted to base64 format
- The system detects multiple images and triggers the merging process

### 2. Automatic Merging
The `image-merger.ts` utility:
- Combines images side-by-side (horizontal layout)
- Maintains aspect ratios and quality
- Adds spacing between images for better readability
- Outputs a single merged image at high quality (95% JPEG)

### 3. AI Processing
The merged image is sent to the Gemini AI:
- AI is instructed to scan the entire image from left to right
- AI extracts information from both sides (front and back)
- Single extraction process captures all data points

## Technical Details

### Files Modified

1. **`frontend/src/lib/image-merger.ts`** (NEW)
   - Image merging utility class
   - Supports horizontal and vertical layouts
   - Canvas-based image processing
   - Configurable quality and dimensions

2. **`frontend/src/components/CitizenPage.tsx`**
   - Import image merger utility
   - Modified `routeImagesToDepartment` function to merge images before AI processing
   - Added UI notification when multiple images are detected
   - Updated submission data to track original image count

3. **`frontend/src/lib/gemini-ai-service.ts`**
   - Updated AI prompts to mention merged images
   - Enhanced instructions to scan entire image from left to right
   - Better guidance for extracting data from side-by-side layouts

### Configuration

Default merge settings:
```typescript
{
  layout: 'horizontal',  // Side by side
  maxWidth: 3000,        // Maximum width in pixels
  maxHeight: 2000,       // Maximum height in pixels
  quality: 0.95,         // JPEG quality (95%)
  spacing: 30            // Pixels between images
}
```

## Benefits

1. **Better AI Accuracy**: AI can see both sides of a document in one view
2. **Complete Data Extraction**: No more missing data from the second image
3. **Automatic Process**: No manual user intervention required
4. **User-Friendly**: Clear UI feedback about the merging process
5. **Fallback Support**: If merging fails, original images are still processed

## User Experience

When users upload 2+ images:
1. Blue info box appears: "ℹ️ Multiple images will be automatically combined into one for better processing"
2. During submission, console logs show: "Merging X images into a single image..."
3. Success message: "Successfully merged images into one"
4. AI processes the merged image as a single document

## Use Cases

Perfect for:
- National ID cards (front and back)
- Passports (photo page and info pages)
- Birth certificates (multiple pages)
- Any multi-page or multi-sided documents

## Deployment

Since the code is on Render with GitHub auto-sync:
1. Changes pushed to GitHub automatically deploy to Render
2. Frontend and backend both update simultaneously
3. No additional configuration needed
4. Feature works immediately upon deployment

## Future Enhancements

Potential improvements:
- User choice between horizontal/vertical layout
- Preview of merged image before submission
- Support for more than 2 images with smart layout
- PDF conversion for multi-page documents

