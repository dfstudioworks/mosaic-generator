import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import type { MosaicSettings } from "@shared/schema";

interface ProcessingOptionsProps {
  settings: MosaicSettings;
  onSettingsChange: (settings: Partial<MosaicSettings>) => void;
}

export default function ProcessingOptions({ settings, onSettingsChange }: ProcessingOptionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary" />
          Processing Options
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="anti-aliasing" className="text-sm font-medium text-surface-700">
              Anti-aliasing
            </Label>
            <Switch
              id="anti-aliasing"
              checked={settings.antiAliasing}
              onCheckedChange={(checked) => onSettingsChange({ antiAliasing: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dithering" className="text-sm font-medium text-surface-700">
              Dithering
            </Label>
            <Switch
              id="dithering"
              checked={settings.dithering}
              onCheckedChange={(checked) => onSettingsChange({ dithering: checked })}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-surface-700 mb-2 block">
              Color Matching
            </Label>
            <Select 
              value={settings.colorMatching} 
              onValueChange={(value: 'nearest' | 'perceptual' | 'lab') => 
                onSettingsChange({ colorMatching: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">Nearest Color</SelectItem>
                <SelectItem value="perceptual">Perceptual</SelectItem>
                <SelectItem value="lab">Lab Delta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
