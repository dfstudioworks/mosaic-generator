import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import type { ColorPalette } from "@shared/schema";

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorPalette: ColorPalette;
  onColorPaletteChange: (palette: ColorPalette) => void;
}

const defaultPalette: ColorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471',
  '#82E0AA', '#F1948A', '#85929E', '#D5A6BD', '#A9CCE3', '#F9E79F',
  '#ABEBC6', '#F5B7B1', '#AEB6BF', '#E8DAEF', '#D6EAF8', '#FCF3CF'
];

export default function ColorPaletteModal({ 
  isOpen, 
  onClose, 
  colorPalette, 
  onColorPaletteChange 
}: ColorPaletteModalProps) {
  const [colorCount, setColorCount] = useState(colorPalette.length || 24);
  const [palette, setPalette] = useState<ColorPalette>([...colorPalette]);

  useEffect(() => {
    setPalette(prev => {
      const next = [...prev];
      if (colorCount > prev.length) {
        return next.concat(Array(colorCount - prev.length).fill("#000000"));
      } else {
        return next.slice(0, colorCount);
      }
    });
  }, [colorCount]);

  const handleColorChange = (index: number, color: string) => {
    const newPalette = [...palette];
    newPalette[index] = color;
    setPalette(newPalette as ColorPalette);
  };

  const handleSave = () => {
    onColorPaletteChange(palette as ColorPalette);
    onClose();
  };

  const handleResetPalette = () => {
    setPalette(defaultPalette.slice(0, colorCount));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2 text-primary" />
            Custom Color Palette
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Color Count Input */}
          <div>
            <label className="text-sm font-medium block mb-1">Number of Colors:</label>
            <Input
              type="number"
              min={1}
              max={64}
              value={colorCount}
              onChange={(e) => setColorCount(parseInt(e.target.value))}
            />
          </div>

          {/* Palette Color Pickers */}
          <div className="grid grid-cols-6 gap-3">
            {palette.map((color, index) => (
              <div key={index} className="text-center">
                <div className="w-full aspect-square rounded-lg border border-surface-300 hover:border-primary transition-colors relative overflow-hidden">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute inset-0 w-full h-full border-0 p-0 cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="text-xs font-mono text-surface-600 mt-1">{index + 1}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleResetPalette} className="flex-1">
              Reset to Default
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Palette
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
