import type { MosaicSettings } from "@shared/schema";

export interface ProcessedImageData {
  imageData: string;
  originalMetadata: {
    width?: number;
    height?: number;
    format?: string;
  };
  processedDimensions: {
    width: number;
    height: number;
  };
  gridDimensions: {
    width: number;
    height: number;
  };
}

export class BrowserImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async processImage(file: File, settings: MosaicSettings): Promise<ProcessedImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate target dimensions for high-quality output
          const dpi = 300;
          const pixelWidth = Math.round(settings.canvasWidth * dpi);
          const pixelHeight = Math.round(settings.canvasHeight * dpi);

          // Set canvas size
          this.canvas.width = pixelWidth;
          this.canvas.height = pixelHeight;

          // Fill with white background
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(0, 0, pixelWidth, pixelHeight);

          // Calculate aspect ratios
          const imageAspect = img.width / img.height;
          const canvasAspect = pixelWidth / pixelHeight;

          let drawWidth, drawHeight, drawX, drawY;

          // Fit image maintaining aspect ratio
          if (imageAspect > canvasAspect) {
            // Image is wider
            drawWidth = pixelWidth;
            drawHeight = pixelWidth / imageAspect;
            drawX = 0;
            drawY = (pixelHeight - drawHeight) / 2;
          } else {
            // Image is taller
            drawHeight = pixelHeight;
            drawWidth = pixelHeight * imageAspect;
            drawX = (pixelWidth - drawWidth) / 2;
            drawY = 0;
          }

          // Draw image
          this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Convert to base64
          const imageData = this.canvas.toDataURL('image/png').split(',')[1];

          // Calculate grid dimensions
          const mmPerInch = 25.4;
          const tilesPerInchWidth = mmPerInch / settings.tileSize;
          const tilesPerInchHeight = mmPerInch / settings.tileSize;
          
          const gridWidth = Math.floor(settings.canvasWidth * tilesPerInchWidth);
          const gridHeight = Math.floor(settings.canvasHeight * tilesPerInchHeight);

          resolve({
            imageData,
            originalMetadata: {
              width: img.width,
              height: img.height,
              format: file.type,
            },
            processedDimensions: {
              width: pixelWidth,
              height: pixelHeight,
            },
            gridDimensions: {
              width: gridWidth,
              height: gridHeight,
            },
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      // Clean up object URL after image loads
      img.addEventListener('load', () => {
        URL.revokeObjectURL(objectUrl);
      }, { once: true });
    });
  }
}