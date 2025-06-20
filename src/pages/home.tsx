import { useState } from "react";
import { useMosaic } from "@/hooks/use-mosaic";
import ImageUpload from "@/components/image-upload";
import CanvasSettings from "@/components/canvas-settings";
import ProcessingOptions from "@/components/processing-options";
import MosaicCanvas from "@/components/mosaic-canvas";
import ColorPaletteModal from "@/components/color-palette-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportColoredVersion, exportNumberedVersion, exportBoth } from "@/lib/export-utils";
import { Download, FileImage, Layers, Palette } from "lucide-react";

type PreviewMode = 'colored' | 'numbered' | 'split';

export default function Home() {
  const {
    settings,
    updateSettings,
    colorPalette,
    updateColorPalette,
    processedImage,
    mosaicData,
    isProcessing,
    uploadImage,
    generateMosaic,
    stats
  } = useMosaic();

  const [previewMode, setPreviewMode] = useState<PreviewMode>('colored');
  const [showColorPalette, setShowColorPalette] = useState(false);

  const handleExportColored = async () => {
    if (mosaicData && processedImage) {
      await exportColoredVersion(mosaicData, colorPalette, settings);
    }
  };

  const handleExportNumbered = async () => {
    if (mosaicData && processedImage) {
      await exportNumberedVersion(mosaicData, colorPalette, settings);
    }
  };

  const handleExportBoth = async () => {
    if (mosaicData && processedImage) {
      await exportBoth(mosaicData, colorPalette, settings);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-white rounded-lg p-2">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900">Mystery Mosaic Generator</h1>
                <p className="text-sm text-muted-foreground">Professional Coloring Book Creator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleExportColored}
                disabled={!mosaicData}
                variant="default"
                className="bg-accent-500 hover:bg-accent-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Colored
              </Button>
              <Button 
                onClick={handleExportNumbered}
                disabled={!mosaicData}
                variant="default"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Export Numbered
              </Button>
              <Button 
                onClick={handleExportBoth}
                disabled={!mosaicData}
                variant="default"
                className="bg-surface-800 hover:bg-surface-900"
              >
                <Layers className="w-4 h-4 mr-2" />
                Export Both
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 min-h-screen">
          
          {/* Control Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <ImageUpload 
              onImageUpload={uploadImage}
              isProcessing={isProcessing}
            />
            
            <CanvasSettings 
              settings={settings}
              onSettingsChange={updateSettings}
            />
            
            <ProcessingOptions 
              settings={settings}
              onSettingsChange={updateSettings}
            />

            <Button 
              onClick={generateMosaic}
              disabled={!processedImage || isProcessing}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary py-4 px-6 text-lg font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Palette className="w-5 h-5 mr-2" />
                  Generate Mosaic
                </>
              )}
            </Button>
          </div>

          {/* Preview Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Preview Mode Toggle */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-surface-900 flex items-center">
                    <FileImage className="w-5 h-5 mr-2 text-primary" />
                    Preview Mode
                  </h2>
                  
                  <div className="flex bg-surface-100 rounded-lg p-1">
                    <Button
                      variant={previewMode === 'colored' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('colored')}
                      className={previewMode === 'colored' ? 'bg-primary text-white' : ''}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Colored View
                    </Button>
                    <Button
                      variant={previewMode === 'numbered' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('numbered')}
                      className={previewMode === 'numbered' ? 'bg-primary text-white' : ''}
                    >
                      #
                      <span className="ml-1">Numbered View</span>
                    </Button>
                    <Button
                      variant={previewMode === 'split' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('split')}
                      className={previewMode === 'split' ? 'bg-primary text-white' : ''}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Split View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canvas Area */}
            <MosaicCanvas
              processedImage={processedImage}
              mosaicData={mosaicData}
              colorPalette={colorPalette}
              settings={settings}
              previewMode={previewMode}
            />

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalTiles.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground font-medium">Total Tiles</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-accent-500">{stats.usedColors}</div>
                    <div className="text-sm text-muted-foreground font-medium">Colors Used</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">300 DPI</div>
                    <div className="text-sm text-muted-foreground font-medium">Print Quality</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Color Palette Button */}
      <Button
        onClick={() => setShowColorPalette(true)}
        className="fixed bottom-6 right-6 bg-accent-500 hover:bg-accent-600 text-white p-4 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Palette className="w-6 h-6" />
      </Button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        colorPalette={colorPalette}
        onColorPaletteChange={updateColorPalette}
      />
    </div>
  );
}
