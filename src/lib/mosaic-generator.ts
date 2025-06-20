import type { MosaicSettings, ColorPalette, ProcessedMosaic } from "@shared/schema";
import { quantizeColors } from "./color-quantizer";

export class MosaicGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateMosaic(
    imageData: string,
    settings: MosaicSettings,
    colorPalette: ColorPalette
  ): Promise<ProcessedMosaic> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = this.processImage(img, settings, colorPalette);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = `data:image/png;base64,${imageData}`;
    });
  }

  private processImage(
    img: HTMLImageElement,
    settings: MosaicSettings,
    colorPalette: ColorPalette
  ): ProcessedMosaic {
    // Calculate grid dimensions
    const dpi = 300;
    const mmPerInch = 25.4;
    const tilesPerInchWidth = mmPerInch / settings.tileSize;
    const tilesPerInchHeight = mmPerInch / settings.tileSize;
    
    const gridWidth = Math.floor(settings.canvasWidth * tilesPerInchWidth);
    const gridHeight = Math.floor(settings.canvasHeight * tilesPerInchHeight);

    // Set canvas size for processing
    this.canvas.width = gridWidth;
    this.canvas.height = gridHeight;

    // Draw and resize image to grid dimensions
    this.ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, gridWidth, gridHeight);
    const pixels = imageData.data;

    // Convert to mosaic grid
    const grid: number[][] = [];
    const usedColorIndices = new Set<number>();

    for (let y = 0; y < gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        const pixelIndex = (y * gridWidth + x) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];

        // Find closest color in palette
        const colorIndex = this.findClosestColorIndex(
          r, g, b, 
          colorPalette, 
          settings.colorMatching
        );
        
        grid[y][x] = colorIndex;
        usedColorIndices.add(colorIndex);
      }
    }

    return {
      grid,
      usedColors: usedColorIndices.size,
      totalTiles: gridWidth * gridHeight,
      gridDimensions: {
        width: gridWidth,
        height: gridHeight,
      },
    };
  }

  private findClosestColorIndex(
    r: number, 
    g: number, 
    b: number, 
    palette: ColorPalette,
    method: 'nearest' | 'perceptual' | 'lab'
  ): number {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < palette.length; i++) {
      const color = palette[i];
      const { r: pr, g: pg, b: pb } = this.hexToRgb(color);
      
      let distance: number;
      
      switch (method) {
        case 'perceptual':
          distance = this.perceptualDistance(r, g, b, pr, pg, pb);
          break;
        case 'lab':
          distance = this.labDistance(r, g, b, pr, pg, pb);
          break;
        default: // nearest
          distance = this.euclideanDistance(r, g, b, pr, pg, pb);
          break;
      }

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private euclideanDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  }

  private perceptualDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    const rmean = (r1 + r2) / 2;
    const deltaR = r2 - r1;
    const deltaG = g2 - g1;
    const deltaB = b2 - b1;
    
    const weightR = 2 + rmean / 256;
    const weightG = 4;
    const weightB = 2 + (255 - rmean) / 256;
    
    return Math.sqrt(weightR * deltaR * deltaR + weightG * deltaG * deltaG + weightB * deltaB * deltaB);
  }

  private labDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    const lab1 = this.rgbToLab(r1, g1, b1);
    const lab2 = this.rgbToLab(r2, g2, b2);
    
    return Math.sqrt(
      Math.pow(lab2.l - lab1.l, 2) + 
      Math.pow(lab2.a - lab1.a, 2) + 
      Math.pow(lab2.b - lab1.b, 2)
    );
  }

  private rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
    // Convert RGB to XYZ
    let x = r / 255;
    let y = g / 255;
    let z = b / 255;

    x = x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
    y = y > 0.04045 ? Math.pow((y + 0.055) / 1.055, 2.4) : y / 12.92;
    z = z > 0.04045 ? Math.pow((z + 0.055) / 1.055, 2.4) : z / 12.92;

    x = x * 95.047;
    y = y * 100.000;
    z = z * 108.883;

    // Convert XYZ to Lab
    x = x / 95.047;
    y = y / 100.000;
    z = z / 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const bValue = 200 * (y - z);

    return { l, a, b: bValue };
  }
}
