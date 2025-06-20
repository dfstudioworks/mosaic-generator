export interface Color {
  r: number;
  g: number;
  b: number;
}

export class ColorQuantizer {
  static quantizeImage(imageData: ImageData, colorCount: number): string[] {
    const pixels: Color[] = [];
    
    // Extract pixels
    for (let i = 0; i < imageData.data.length; i += 4) {
      pixels.push({
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2]
      });
    }

    // Use median cut algorithm for color quantization
    const palette = this.medianCut(pixels, colorCount);
    
    // Convert to hex strings
    return palette.map(color => 
      `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
    );
  }

  private static medianCut(pixels: Color[], targetColors: number): Color[] {
    if (targetColors === 1 || pixels.length === 0) {
      return [this.averageColor(pixels)];
    }

    // Find the dimension with the largest range
    const ranges = this.getColorRanges(pixels);
    const maxRange = Math.max(ranges.r, ranges.g, ranges.b);
    
    let sortBy: 'r' | 'g' | 'b';
    if (maxRange === ranges.r) sortBy = 'r';
    else if (maxRange === ranges.g) sortBy = 'g';
    else sortBy = 'b';

    // Sort pixels by the chosen dimension
    pixels.sort((a, b) => a[sortBy] - b[sortBy]);

    // Split at median
    const median = Math.floor(pixels.length / 2);
    const left = pixels.slice(0, median);
    const right = pixels.slice(median);

    // Recursively quantize each half
    const leftColors = Math.ceil(targetColors / 2);
    const rightColors = targetColors - leftColors;

    return [
      ...this.medianCut(left, leftColors),
      ...this.medianCut(right, rightColors)
    ];
  }

  private static getColorRanges(pixels: Color[]): { r: number; g: number; b: number } {
    if (pixels.length === 0) return { r: 0, g: 0, b: 0 };

    const min = { r: 255, g: 255, b: 255 };
    const max = { r: 0, g: 0, b: 0 };

    for (const pixel of pixels) {
      min.r = Math.min(min.r, pixel.r);
      min.g = Math.min(min.g, pixel.g);
      min.b = Math.min(min.b, pixel.b);
      max.r = Math.max(max.r, pixel.r);
      max.g = Math.max(max.g, pixel.g);
      max.b = Math.max(max.b, pixel.b);
    }

    return {
      r: max.r - min.r,
      g: max.g - min.g,
      b: max.b - min.b
    };
  }

  private static averageColor(pixels: Color[]): Color {
    if (pixels.length === 0) return { r: 0, g: 0, b: 0 };

    const sum = pixels.reduce(
      (acc, pixel) => ({
        r: acc.r + pixel.r,
        g: acc.g + pixel.g,
        b: acc.b + pixel.b
      }),
      { r: 0, g: 0, b: 0 }
    );

    return {
      r: Math.round(sum.r / pixels.length),
      g: Math.round(sum.g / pixels.length),
      b: Math.round(sum.b / pixels.length)
    };
  }
}

export function quantizeColors(imageData: ImageData, colorCount: number = 24): string[] {
  return ColorQuantizer.quantizeImage(imageData, colorCount);
}
