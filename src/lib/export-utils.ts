import type { ProcessedMosaic, MosaicSettings, ColorPalette } from "@shared/schema";

export async function exportColoredVersion(
  mosaicData: ProcessedMosaic,
  colorPalette: ColorPalette,
  settings: MosaicSettings
): Promise<void> {
  const canvas = createExportCanvas(mosaicData, colorPalette, settings, 'colored');
  downloadCanvas(canvas, 'mosaic-colored.png');
}

export async function exportNumberedVersion(
  mosaicData: ProcessedMosaic,
  colorPalette: ColorPalette,
  settings: MosaicSettings
): Promise<void> {
  const canvas = createExportCanvas(mosaicData, colorPalette, settings, 'numbered');
  downloadCanvas(canvas, 'mosaic-numbered.png');
}

export async function exportBoth(
  mosaicData: ProcessedMosaic,
  colorPalette: ColorPalette,
  settings: MosaicSettings
): Promise<void> {
  const coloredCanvas = createExportCanvas(mosaicData, colorPalette, settings, 'colored');
  const numberedCanvas = createExportCanvas(mosaicData, colorPalette, settings, 'numbered');
  
  downloadCanvas(coloredCanvas, 'mosaic-colored.png');
  
  // Delay second download to avoid browser blocking
  setTimeout(() => {
    downloadCanvas(numberedCanvas, 'mosaic-numbered.png');
  }, 500);
}

function createExportCanvas(
  mosaicData: ProcessedMosaic,
  colorPalette: ColorPalette,
  settings: MosaicSettings,
  mode: 'colored' | 'numbered'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // High resolution for printing (300 DPI)
  const dpi = 300;
  const pixelWidth = Math.round(settings.canvasWidth * dpi);
  const pixelHeight = Math.round(settings.canvasHeight * dpi);

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate tile dimensions
  const tileWidth = canvas.width / mosaicData.gridDimensions.width;
  const tileHeight = canvas.height / mosaicData.gridDimensions.height;

  // Render mosaic
  for (let y = 0; y < mosaicData.gridDimensions.height; y++) {
    for (let x = 0; x < mosaicData.gridDimensions.width; x++) {
      const colorIndex = mosaicData.grid[y]?.[x];
      if (colorIndex === undefined) continue;

      const color = colorPalette[colorIndex];
      if (!color) continue;

      const tileX = x * tileWidth;
      const tileY = y * tileHeight;

      ctx.save();

      if (mode === 'colored') {
        ctx.fillStyle = color;
        drawTileShape(ctx, tileX, tileY, tileWidth, tileHeight, settings.tileShape);
      } else {
        // Numbered version - draw border and number
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        drawTileShape(ctx, tileX, tileY, tileWidth, tileHeight, settings.tileShape, true);
        
        // Draw number
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.min(tileWidth, tileHeight) * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          (colorIndex + 1).toString(),
          tileX + tileWidth / 2,
          tileY + tileHeight / 2
        );
      }

      ctx.restore();
    }
  }

  // Add color legend for numbered version
  if (mode === 'numbered') {
    addColorLegend(ctx, colorPalette, mosaicData, canvas.width, canvas.height);
  }

  return canvas;
}

function drawTileShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: string,
  strokeOnly = false
): void {
  ctx.beginPath();
  
  switch (shape) {
    case 'circle':
      const radius = Math.min(width, height) / 2;
      ctx.arc(x + width / 2, y + height / 2, radius * 0.8, 0, 2 * Math.PI);
      break;
    case 'triangle':
      ctx.moveTo(x + width / 2, y + height * 0.1);
      ctx.lineTo(x + width * 0.1, y + height * 0.9);
      ctx.lineTo(x + width * 0.9, y + height * 0.9);
      ctx.closePath();
      break;
    case 'hexagon':
      const hexRadius = Math.min(width, height) / 2 * 0.8;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = centerX + hexRadius * Math.cos(angle);
        const py = centerY + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    default: // square
      ctx.rect(x + 1, y + 1, width - 2, height - 2);
      break;
  }
  
  if (strokeOnly) {
    ctx.stroke();
  } else {
    ctx.fill();
  }
}

function addColorLegend(
  ctx: CanvasRenderingContext2D,
  colorPalette: ColorPalette,
  mosaicData: ProcessedMosaic,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Find which colors are actually used
  const usedColors = new Set<number>();
  for (const row of mosaicData.grid) {
    for (const colorIndex of row) {
      usedColors.add(colorIndex);
    }
  }

  const usedColorArray = Array.from(usedColors).sort((a, b) => a - b);
  
  // Legend dimensions
  const legendMargin = 20;
  const legendItemHeight = 30;
  const legendItemWidth = 200;
  const legendX = canvasWidth - legendItemWidth - legendMargin;
  let legendY = legendMargin;

  // Legend background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(
    legendX - 10,
    legendY - 10,
    legendItemWidth + 20,
    usedColorArray.length * legendItemHeight + 20
  );

  // Legend border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    legendX - 10,
    legendY - 10,
    legendItemWidth + 20,
    usedColorArray.length * legendItemHeight + 20
  );

  // Legend items
  for (let i = 0; i < usedColorArray.length; i++) {
    const colorIndex = usedColorArray[i];
    const color = colorPalette[colorIndex];
    const y = legendY + i * legendItemHeight;

    // Color swatch
    ctx.fillStyle = color;
    ctx.fillRect(legendX, y, 20, 20);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(legendX, y, 20, 20);

    // Color number and hex
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${colorIndex + 1}: ${color}`, legendX + 30, y + 10);
  }
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png', 1.0);
}
