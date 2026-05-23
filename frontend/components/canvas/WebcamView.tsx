'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      // Could save this or switch to photo mode with this image
      const link = document.createElement('a');
      link.download = 'room-capture.jpg';
      link.href = dataUrl;
      link.click();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-black">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Overlay UI */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Guide lines */}
            <div className="absolute inset-8 border border-white/20 rounded-lg" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-auto">
              Point at a wall • Drag items from the sidebar
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={stopCamera}
              aria-label="Stop camera"
            >
              <CameraOff className="h-4 w-4" />
            </Button>
            <button
              onClick={captureSnapshot}
              className="w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center"
              aria-label="Capture snapshot"
            >
              <Circle className="h-10 w-10 text-white fill-white/30" />
            </button>
            <div className="w-10" /> {/* Spacer for symmetry */}
          </div>
        </>
      ) : (
        <div className="text-center text-white space-y-4 p-8">
          {error ? (
            <>
              <CameraOff className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-sm text-red-300">{error}</p>
              <Button onClick={startCamera} variant="secondary">
                Try Again
              </Button>
            </>
          ) : (
            <>
              <Camera className="h-12 w-12 mx-auto opacity-50 animate-pulse" />
              <p className="text-sm opacity-70">Starting camera...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
