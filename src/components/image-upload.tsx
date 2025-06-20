import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, Image, CheckCircle, Info } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUpload({ onImageUpload, isProcessing }: ImageUploadProps) {
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center">
          <CloudUpload className="w-5 h-5 mr-2 text-primary" />
          Image Upload
        </h2>
        
        <div 
          className="border-2 border-dashed border-surface-200 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-surface-50 hover:bg-primary/5"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-surface-600 font-medium">Processing image...</p>
            </div>
          ) : (
            <>
              <Image className="w-12 h-12 text-surface-400 mb-4 mx-auto" />
              <p className="text-surface-600 font-medium mb-2">Drop your image here</p>
              <p className="text-sm text-surface-500">or click to browse</p>
            </>
          )}
        </div>
        
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-surface-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>Supports: JPG, PNG, WebP</span>
          </div>
          <div className="flex items-center text-sm text-surface-600">
            <Info className="w-4 h-4 text-blue-500 mr-2" />
            <span>Max size: 10MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
