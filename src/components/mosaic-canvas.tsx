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

    // Set canvas size
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const aspectRatio = mosaicData.gridDimensions.width / mosaicData.gridDimensions.height;
    
    canvas.width = containerWidth;
    canvas.height = containerWidth / aspectRatio;

    // Clear canvas
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

        if (previewMode === 'colored' || previewMode === 'split') {
          ctx.fillStyle = color;
          drawTileShape(ctx, tileX, tileY, tileWidth, tileHeight, settings.tileShape);
        }

        if (previewMode === 'numbered' || previewMode === 'split') {
          // Draw number
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
    shape: string
  ) => {
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
    
    ctx.fill();
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
              
              {/* Zoom Controls */}
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

              {/* Grid Info Overlay */}
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
