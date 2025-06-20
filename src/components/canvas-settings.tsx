import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ruler, Square, Circle, Triangle, Hexagon } from "lucide-react";
import type { MosaicSettings } from "@shared/schema";

interface CanvasSettingsProps {
  settings: MosaicSettings;
  onSettingsChange: (settings: Partial<MosaicSettings>) => void;
}

const tileShapes = [
  { value: 'square' as const, icon: Square, label: 'Square' },
  { value: 'circle' as const, icon: Circle, label: 'Circle' },
  { value: 'triangle' as const, icon: Triangle, label: 'Triangle' },
  { value: 'hexagon' as const, icon: Hexagon, label: 'Hexagon' },
];

export default function CanvasSettings({ settings, onSettingsChange }: CanvasSettingsProps) {
  return (
    <Card className="animate-slide-up">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
          <Ruler className="w-5 h-5 mr-2 text-primary" />
          Canvas Settings
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="canvas-width" className="text-sm font-medium text-surface-700 mb-1">
                Width (in)
              </Label>
              <Input
                id="canvas-width"
                type="number"
                value={settings.canvasWidth}
                onChange={(e) => onSettingsChange({ canvasWidth: parseFloat(e.target.value) || 8.5 })}
                step="0.1"
                min="1"
                max="20"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="canvas-height" className="text-sm font-medium text-surface-700 mb-1">
                Height (in)
              </Label>
              <Input
                id="canvas-height"
                type="number"
                value={settings.canvasHeight}
                onChange={(e) => onSettingsChange({ canvasHeight: parseFloat(e.target.value) || 11 })}
                step="0.1"
                min="1"
                max="20"
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tile-size" className="text-sm font-medium text-surface-700 mb-1">
              Tile Size (mm)
            </Label>
            <Input
              id="tile-size"
              type="number"
              value={settings.tileSize}
              onChange={(e) => onSettingsChange({ tileSize: parseFloat(e.target.value) || 4 })}
              step="0.5"
              min="1"
              max="20"
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-surface-700 mb-2 block">
              Tile Shape
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {tileShapes.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={settings.tileShape === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSettingsChange({ tileShape: value })}
                  className={`flex items-center justify-center p-3 ${
                    settings.tileShape === value 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-surface-300 hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
