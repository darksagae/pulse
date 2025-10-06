// Image Optimizer for Gemini AI Processing
// Handles large images by intelligently compressing them while maintaining quality

export interface OptimizationOptions {
  maxFileSizeMB?: number;      // Maximum file size in MB
  maxWidth?: number;            // Maximum width in pixels
  maxHeight?: number;           // Maximum height in pixels
  initialQuality?: number;      // Starting quality (0-1)
  minQuality?: number;          // Minimum acceptable quality (0-1)
  targetFormat?: 'jpeg' | 'png';
}

class ImageOptimizer {
  /**
   * Optimize an image to fit within size limits while maintaining quality
   * Gemini API has a limit of ~4MB for inline images
   */
  async optimizeForGemini(imageBase64: string, options: OptimizationOptions = {}): Promise<string> {
    const {
      maxFileSizeMB = 3.5,        // Stay under 4MB limit with buffer
      maxWidth = 4096,             // Gemini supports up to 4096px
      maxHeight = 4096,
      initialQuality = 0.95,
      minQuality = 0.70,
      targetFormat = 'jpeg'
    } = options;

    try {
      console.log('Starting image optimization...');
      
      // Calculate current size
      const currentSize = this.getBase64SizeMB(imageBase64);
      console.log(`Original image size: ${currentSize.toFixed(2)} MB`);

      if (currentSize <= maxFileSizeMB) {
        console.log('Image size is within limits, no optimization needed');
        return imageBase64;
      }

      // Load the image
      const img = await this.loadImage(imageBase64);
      console.log(`Original dimensions: ${img.width}x${img.height}`);

      // Calculate scaled dimensions if needed
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (img.width > maxWidth || img.height > maxHeight) {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        targetWidth = Math.round(img.width * scale);
        targetHeight = Math.round(img.height * scale);
        console.log(`Scaling to: ${targetWidth}x${targetHeight}`);
      }

      // Try to compress with binary search for optimal quality
      let quality = initialQuality;
      let optimizedImage = await this.resizeAndCompress(img, targetWidth, targetHeight, quality, targetFormat);
      let optimizedSize = this.getBase64SizeMB(optimizedImage);

      console.log(`After initial compression (${(quality * 100).toFixed(0)}%): ${optimizedSize.toFixed(2)} MB`);

      // Binary search for optimal quality if still too large
      if (optimizedSize > maxFileSizeMB) {
        let lowQuality = minQuality;
        let highQuality = quality;
        let bestImage = optimizedImage;
        let iterations = 0;
        const maxIterations = 8;

        while (highQuality - lowQuality > 0.05 && iterations < maxIterations) {
          quality = (lowQuality + highQuality) / 2;
          optimizedImage = await this.resizeAndCompress(img, targetWidth, targetHeight, quality, targetFormat);
          optimizedSize = this.getBase64SizeMB(optimizedImage);
          
          console.log(`Iteration ${iterations + 1}: Quality ${(quality * 100).toFixed(0)}%, Size ${optimizedSize.toFixed(2)} MB`);

          if (optimizedSize <= maxFileSizeMB) {
            bestImage = optimizedImage;
            lowQuality = quality; // Try higher quality
          } else {
            highQuality = quality; // Need lower quality
          }
          
          iterations++;
        }

        optimizedImage = bestImage;
        optimizedSize = this.getBase64SizeMB(optimizedImage);
      }

      console.log(`Final optimized size: ${optimizedSize.toFixed(2)} MB (${((1 - optimizedSize / currentSize) * 100).toFixed(1)}% reduction)`);

      return optimizedImage;

    } catch (error) {
      console.error('Error optimizing image:', error);
      console.warn('Returning original image despite size issues');
      return imageBase64;
    }
  }

  /**
   * Optimize multiple images
   */
  async optimizeMultipleImages(images: string[], options: OptimizationOptions = {}): Promise<string[]> {
    console.log(`Optimizing ${images.length} images...`);
    const optimizedImages: string[] = [];

    for (let i = 0; i < images.length; i++) {
      console.log(`\nOptimizing image ${i + 1}/${images.length}:`);
      const optimized = await this.optimizeForGemini(images[i], options);
      optimizedImages.push(optimized);
    }

    return optimizedImages;
  }

  /**
   * Load an image from a base64 data URL
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
   * Resize and compress an image
   */
  private async resizeAndCompress(
    img: HTMLImageElement,
    width: number,
    height: number,
    quality: number,
    format: 'jpeg' | 'png'
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to base64
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mimeType, quality);
  }

  /**
   * Calculate the size of a base64 string in MB
   */
  private getBase64SizeMB(base64String: string): number {
    // Remove data URL prefix if present
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    
    // Calculate size: base64 is ~4/3 the size of original binary
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes / (1024 * 1024);
  }

  /**
   * Get information about an image
   */
  async getImageInfo(base64String: string): Promise<{
    width: number;
    height: number;
    sizeMB: number;
    format: string;
  }> {
    const img = await this.loadImage(base64String);
    const sizeMB = this.getBase64SizeMB(base64String);
    
    // Extract format from data URL
    const formatMatch = base64String.match(/data:image\/(\w+);/);
    const format = formatMatch ? formatMatch[1] : 'unknown';

    return {
      width: img.width,
      height: img.height,
      sizeMB,
      format
    };
  }

  /**
   * Check if an image needs optimization
   */
  needsOptimization(base64String: string, maxSizeMB: number = 3.5): boolean {
    const sizeMB = this.getBase64SizeMB(base64String);
    return sizeMB > maxSizeMB;
  }

  /**
   * Batch optimize images with progress callback
   */
  async optimizeBatch(
    images: string[],
    options: OptimizationOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const optimized = await this.optimizeForGemini(images[i], options);
      results.push(optimized);
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    }

    return results;
  }
}

export const imageOptimizer = new ImageOptimizer();
export default imageOptimizer;

