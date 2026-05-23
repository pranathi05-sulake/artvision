'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppStore } from '@/lib/store';
import { mlServiceApi } from '@/lib/api';
import { Upload, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/utils';

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function UploadPanel() {
  const {
    roomImage,
    isAnalyzing,
    analysisError,
    roomAnalysis,
    setRoomImage,
    setRoomAnalysis,
    setIsAnalyzing,
    setAnalysisError,
    setUploadProgress,
    uploadProgress,
  } = useAppStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processImage = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPreviewUrl(dataUrl);
          setRoomImage(dataUrl, file);
        };
        reader.readAsDataURL(file);

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setUploadProgress(Math.min(progress, 90));
          if (progress >= 90) clearInterval(progressInterval);
        }, 200);

        // Convert to base64 for ML service
        const base64 = await fileToBase64(file);

        // Call ML service for room analysis
        const analysis = await mlServiceApi.analyzeRoom(base64);
        setRoomAnalysis(analysis);

        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (error) {
        console.error('Room analysis failed:', error);
        setAnalysisError(
          'Failed to analyze room. The image will still work for manual art placement.'
        );
        setUploadProgress(100);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setRoomImage, setRoomAnalysis, setIsAnalyzing, setAnalysisError, setUploadProgress]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      processImage(file);
    },
    [processImage]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleReset = () => {
    setPreviewUrl(null);
    setRoomImage(null);
    setRoomAnalysis(null);
    setUploadProgress(0);
    setAnalysisError(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Upload Room Photo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a photo of your room and we&apos;ll detect the walls automatically.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!roomImage ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-sm">
                {isDragActive ? 'Drop your photo here' : 'Drag & drop a room photo'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                JPG, PNG, WEBP, HEIC • Max 20MB
              </p>
            </div>

            {fileRejections.length > 0 && (
              <div className="mt-3 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {fileRejections[0].errors.map((err) => (
                    <p key={err.code}>{err.message}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Preview Image */}
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={previewUrl || roomImage}
                alt="Room preview"
                className="w-full h-48 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm font-medium">Analyzing room...</p>
                  <p className="text-xs text-muted-foreground">Detecting walls & style</p>
                  <div className="w-48 h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {roomAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Room analyzed successfully</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <p className="text-sm font-medium capitalize">{roomAnalysis.room_type}</p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Style</p>
                    <p className="text-sm font-medium capitalize">{roomAnalysis.room_style}</p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Wall Size</p>
                    <p className="text-sm font-medium">
                      {roomAnalysis.wall_dimensions.width_cm}×{roomAnalysis.wall_dimensions.height_cm}cm
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Colors</p>
                    <div className="flex gap-1 mt-0.5">
                      {roomAnalysis.dominant_colors.slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {analysisError && (
              <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-yellow-800">{analysisError}</p>
                    <p className="text-yellow-600 text-xs mt-1">
                      You can still place art manually on the canvas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
              Upload Different Photo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-medium mb-2">Tips for best results</h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <Image className="h-3 w-3 mt-0.5 shrink-0" />
            Take photo straight-on facing the wall
          </li>
          <li className="flex items-start gap-2">
            <Image className="h-3 w-3 mt-0.5 shrink-0" />
            Include some floor and ceiling for scale
          </li>
          <li className="flex items-start gap-2">
            <Image className="h-3 w-3 mt-0.5 shrink-0" />
            Good lighting helps with color matching
          </li>
          <li className="flex items-start gap-2">
            <Image className="h-3 w-3 mt-0.5 shrink-0" />
            Clear wall space where you want art
          </li>
        </ul>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get raw base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
