'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, ZoomIn, ZoomOut, ArrowLeft, Smartphone } from 'lucide-react';

export default function ARPage() {
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isARActive, setIsARActive] = useState(false);

  const checkARSupport = () => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsARSupported(supported);
      });
    } else {
      setIsARSupported(false);
    }
  };

  const startAR = async () => {
    try {
      const session = await (navigator as any).xr?.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.getElementById('ar-overlay') },
      });

      if (session) {
        setIsARActive(true);
      }
    } catch (error) {
      console.error('Failed to start AR session:', error);
      setIsARSupported(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/try-on">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-semibold">AR Mode</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!isARActive ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Augmented Reality Preview</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Point your camera at a wall and place artwork in real-time using AR.
                See exactly how art will look in your actual space.
              </p>
            </div>

            {isARSupported === false && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                <p className="font-medium">AR not supported on this device</p>
                <p className="mt-1">
                  AR mode requires a compatible device with WebXR support.
                  Try using Chrome on Android or Safari on iOS.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={startAR} size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                Start AR Experience
              </Button>
              <p className="text-xs text-muted-foreground">
                Requires camera permission • Works on iOS Safari & Android Chrome
              </p>
            </div>

            {/* Instructions */}
            <div className="text-left p-6 rounded-xl border border-border bg-card">
              <h3 className="font-medium mb-3">How it works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Point your camera at the wall where you want to place art
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Tap on the wall to place your selected artwork
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Pinch to resize, drag to reposition
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Take a snapshot to save the AR preview
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div id="ar-overlay" className="fixed inset-0 z-50">
            {/* AR Controls Overlay */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button size="icon" className="rounded-full w-14 h-14" aria-label="Capture">
                <Camera className="h-6 w-6" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>

            {/* Exit AR */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setIsARActive(false)}
            >
              Exit AR
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
