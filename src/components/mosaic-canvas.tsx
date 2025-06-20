import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Image } from "lucide-react";
import type { ProcessedMosaic, MosaicSettings, ColorPalette } from "@shared/schema";

interface MosaicCanvasProps {
  processedImage: string | null;
  mosaicData: ProcessedMosaic | null;
  colorPalette: ColorPalette;
  settings: MosaicSettings;
  previewMode: 'colored' | 'numbered' | 'split';
}

export default function MosaicCanvas({ 
  processedImage, 
  mosaicData, 
  colorPalette, 
  settings, 
  previewMode 
}: MosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !mosaicData || !processedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const aspectRatio = mosaicData.gridDimensions.width / mosaicData.gridDimensions.height;
    canvas.width = containerWidth;
    canvas.height = containerWidth / aspectRatio;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tileWidth = canvas.width / mosaicData.gridDimensions.width;
    const tileHeight = canvas.height / mosaicData.gridDimensions.height;

    for (let y = 0; y < mosaicData.gridDimensions.height; y++) {
      for (let x = 0; x < mosaicData.gridDimensions.width; x++) {
        const colorIndex = mosaicData.grid[y]?.[x];
        if (colorIndex === undefined) continue;

        const color = colorPalette[colorIndex];
        if (!color) continue;

        let tileX = x * tileWidth;
        let tileY = y * tileHeight;

        if (settings.tileShape === 'triangle') {
          const size = tileWidth;
          const h = (Math.sqrt(3) / 2) * size;
          tileX = x * size;
          tileY = y * h;
          if (y % 2 === 1) {
            tileX += size / 2;
          }
        }

        ctx.save();

        if (previewMode === 'colored' || previewMode === 'split') {
          ctx.fillStyle = color;
          drawTileShape(ctx, tileX, tileY, tileWidth, tileHeight, settings.tileShape, y, x);
        }

        if (previewMode === 'numbered' || previewMode === 'split') {
          ctx.fillStyle = previewMode === 'split' ? '#000000' : color;
          ctx.font = `${Math.min(tileWidth, tileHeight) * 0.6}px Arial`;
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
  }, [mosaicData, colorPalette, settings.tileShape, previewMode, processedImage]);

  const drawTileShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    shape: string,
    row: number,
    col: number
  ) => {
    ctx.beginPath();

    switch (shape) {
      case 'circle': {
        const radius = Math.min(width, height) / 2;
        const xOffset = (row % 2) * radius;
        ctx.arc(x + width / 2 + xOffset, y + height / 2, radius * 0.9, 0, 2 * Math.PI);
        break;
      }

      case 'hexagon': {
        const radius = Math.min(width, height) / 2 * 0.9;
        const w = radius * 2;
        const h = Math.sqrt(3) * radius;
        const xOffset = (row % 2) * (w * 0.5);
        const cx = x + w * 0.75 * col + xOffset;
        const cy = y + h * row * 0.5;

        for (let i = 0; i < 6; i++) {
          const angle = Math.PI / 3 * i;
          const px = cx + radius * Math.cos(angle);
          const py = cy + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      }

      case 'triangle': {
        const size = Math.min(width, height);
        const h = (Math.sqrt(3) / 2) * size;
        const flip = (row + col) % 2 === 0;

        if (flip) {
          ctx.moveTo(x + size / 2, y);
          ctx.lineTo(x, y + h);
          ctx.lineTo(x + size, y + h);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + size / 2, y + h);
          ctx.lineTo(x + size, y);
        }
        ctx.closePath();
        break;
      }

      default: // square
        ctx.rect(x, y, width, height);
        break;
    }

    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const handleZoomIn = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.style.transform = `scale(${parseFloat(canvas.style.transform.replace(/[^\d.]/g, '') || '1') * 1.2})`;
    }
  };

  const handleZoomOut = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const currentScale = parseFloat(canvas.style.transform.replace(/[^\d.]/g, '') || '1');
      if (currentScale > 0.5) {
        canvas.style.transform = `scale(${currentScale / 1.2})`;
      }
    }
  };

  const handleResetZoom = () => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = 'scale(1)';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mosaic-preview rounded-lg border-2 border-surface-200 min-h-96 flex items-center justify-center relative overflow-hidden">
          {processedImage && mosaicData ? (
            <>
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain"
                style={{ transformOrigin: 'center' }}
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex space-x-1">
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleResetZoom}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
              {mosaicData && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-surface-700">Grid:</span>
                      <span className="text-surface-600 font-mono">
                        {mosaicData.gridDimensions.width} × {mosaicData.gridDimensions.height} tiles
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-surface-700">Colors:</span>
                      <span className="text-surface-600 font-mono">
                        {mosaicData.usedColors} of 24
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-surface-400">
              <Image className="w-16 h-16 mb-4 mx-auto" />
              <p className="text-xl font-medium mb-2">Upload an image to see your mosaic preview</p>
              <p className="text-sm">The processed mosaic will appear here with your selected tile shape and colors</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
