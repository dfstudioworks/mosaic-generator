import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { BrowserImageProcessor } from "@/lib/browser-image-processor";
import { MosaicGenerator } from "@/lib/mosaic-generator";
import type { MosaicSettings, ColorPalette, ProcessedMosaic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const defaultSettings: MosaicSettings = {
  canvasWidth: 8.5,
  canvasHeight: 11,
  tileSize: 4,
  tileShape: 'square',
  antiAliasing: true,
  dithering: false,
  colorMatching: 'nearest',
};

const defaultColorPalette: ColorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471',
  '#82E0AA', '#F1948A', '#85929E', '#D5A6BD', '#A9CCE3', '#F9E79F',
  '#ABEBC6', '#F5B7B1', '#AEB6BF', '#E8DAEF', '#D6EAF8', '#FCF3CF'
];

export function useMosaic() {
  const [settings, setSettings] = useState<MosaicSettings>(defaultSettings);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(defaultColorPalette);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [mosaicData, setMosaicData] = useState<ProcessedMosaic | null>(null);
  const [stats, setStats] = useState<{ totalTiles: number; usedColors: number } | null>(null);
  
  const { toast } = useToast();
  const mosaicGenerator = new MosaicGenerator();
  const imageProcessor = new BrowserImageProcessor();

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      return imageProcessor.processImage(file, settings);
    },
    onSuccess: (data) => {
      setProcessedImage(data.imageData);
      toast({
        title: "Image uploaded successfully",
        description: "Ready to generate mosaic",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMosaicMutation = useMutation({
    mutationFn: async () => {
      if (!processedImage) throw new Error('No image to process');
      
      return mosaicGenerator.generateMosaic(processedImage, settings, colorPalette);
    },
    onSuccess: (data) => {
      setMosaicData(data);
      setStats({
        totalTiles: data.totalTiles,
        usedColors: data.usedColors,
      });
      toast({
        title: "Mosaic generated successfully",
        description: `Created ${data.totalTiles} tiles using ${data.usedColors} colors`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettings = useCallback((newSettings: Partial<MosaicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateColorPalette = useCallback((newPalette: ColorPalette) => {
    setColorPalette(newPalette);
  }, []);

  const uploadImage = useCallback((file: File) => {
    uploadImageMutation.mutate(file);
  }, [uploadImageMutation]);

  const generateMosaic = useCallback(() => {
    generateMosaicMutation.mutate();
  }, [generateMosaicMutation]);

  return {
    settings,
    updateSettings,
    colorPalette,
    updateColorPalette,
    processedImage,
    mosaicData,
    stats,
    isProcessing: uploadImageMutation.isPending || generateMosaicMutation.isPending,
    uploadImage,
    generateMosaic,
  };
}
