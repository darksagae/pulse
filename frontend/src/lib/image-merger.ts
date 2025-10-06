// Image Merger Utility
// Combines multiple images into a single image for better AI processing

export interface MergeOptions {
  layout?: 'horizontal' | 'vertical'; // Side by side or top to bottom
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // JPEG quality (0-1)
  backgroundColor?: string;
  spacing?: number; // Space between images
}

class ImageMerger {
  /**
   * Merges multiple images into a single image
   * @param images Array of image data URLs (base64)
   * @param options Merge configuration options
   * @returns Promise with the merged image as base64 data URL
   */
  async mergeImages(images: string[], options: MergeOptions = {}): Promise<string> {
    if (images.length === 0) {
      throw new Error('No images provided to merge');
    }

    if (images.length === 1) {
      return images[0]; // Return the single image as-is
    }

    const {
      layout = 'horizontal',
      maxWidth = 8000,      // Increased from 3000 - no artificial limit
      maxHeight = 8000,     // Increased from 3000 - no artificial limit
      quality = 0.95,
      backgroundColor = '#FFFFFF',
      spacing = 20
    } = options;

    try {
      // Load all images
      const loadedImages = await Promise.all(
        images.map(src => this.loadImage(src))
      );

      // Calculate dimensions for the merged canvas
      const dimensions = this.calculateMergedDimensions(
        loadedImages,
        layout,
        spacing,
        maxWidth,
        maxHeight
      );

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw images
      let currentX = 0;
      let currentY = 0;

      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        const scaled = this.calculateScaledDimensions(
          img,
          dimensions.imageWidth,
          dimensions.imageHeight
        );

        // Draw the image
        ctx.drawImage(
          img,
          currentX + (dimensions.imageWidth - scaled.width) / 2,
          currentY + (dimensions.imageHeight - scaled.height) / 2,
          scaled.width,
          scaled.height
        );

        // Update position for next image
        if (layout === 'horizontal') {
          currentX += dimensions.imageWidth + spacing;
        } else {
          currentY += dimensions.imageHeight + spacing;
        }
      }

      // Convert to base64
      return canvas.toDataURL('image/jpeg', quality);
    } catch (error) {
      console.error('Error merging images:', error);
      throw error;
    }
  }

  /**
   * Load an image from a data URL
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  /**
   * Calculate dimensions for the merged canvas
   */
  private calculateMergedDimensions(
    images: HTMLImageElement[],
    layout: 'horizontal' | 'vertical',
    spacing: number,
    maxWidth: number,
    maxHeight: number
  ) {
    // Find maximum dimensions among all images
    const maxImgWidth = Math.max(...images.map(img => img.width));
    const maxImgHeight = Math.max(...images.map(img => img.height));

    let totalWidth: number;
    let totalHeight: number;
    let imageWidth: number;
    let imageHeight: number;

    if (layout === 'horizontal') {
      // Images side by side
      imageWidth = maxImgWidth;
      imageHeight = maxImgHeight;
      totalWidth = (imageWidth * images.length) + (spacing * (images.length - 1));
      totalHeight = imageHeight;
    } else {
      // Images top to bottom
      imageWidth = maxImgWidth;
      imageHeight = maxImgHeight;
      totalWidth = imageWidth;
      totalHeight = (imageHeight * images.length) + (spacing * (images.length - 1));
    }

    // Scale down if exceeds maximum dimensions
    const scale = Math.min(
      1,
      maxWidth / totalWidth,
      maxHeight / totalHeight
    );

    return {
      width: Math.round(totalWidth * scale),
      height: Math.round(totalHeight * scale),
      imageWidth: Math.round(imageWidth * scale),
      imageHeight: Math.round(imageHeight * scale)
    };
  }

  /**
   * Calculate scaled dimensions while maintaining aspect ratio
   */
  private calculateScaledDimensions(
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ) {
    const scale = Math.min(
      maxWidth / img.width,
      maxHeight / img.height
    );

    return {
      width: Math.round(img.width * scale),
      height: Math.round(img.height * scale)
    };
  }

  /**
   * Merge two images specifically for ID cards (front and back)
   * This is optimized for NIRA cards
   */
  async mergeIDCardImages(frontImage: string, backImage: string): Promise<string> {
    console.log('Merging ID card images (front and back)...');
    return this.mergeImages([frontImage, backImage], {
      layout: 'horizontal',
      maxWidth: 3000,
      maxHeight: 2000,
      quality: 0.95,
      backgroundColor: '#FFFFFF',
      spacing: 30
    });
  }
}

export const imageMerger = new ImageMerger();
export default imageMerger;

