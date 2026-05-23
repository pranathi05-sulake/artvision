'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';

interface ShadowRendererProps {
  placementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * ShadowRenderer creates realistic CSS-based shadows for artwork frames.
 * Shadow direction and intensity are based on the lighting configuration.
 */
export function ShadowRenderer({ placementId, x, y, width, height }: ShadowRendererProps) {
  const { lighting } = useAppStore();

  const shadowStyle = useMemo(() => {
    // Calculate shadow offset based on time of day
    // Morning (6): shadow to the right
    // Noon (12): shadow below
    // Evening (22): shadow to the left
    const normalizedTime = (lighting.timeOfDay - 6) / 16; // 0 to 1
    const angle = normalizedTime * Math.PI; // 0 to PI

    const offsetX = Math.cos(angle) * 8;
    const offsetY = Math.abs(Math.sin(angle)) * 4 + 4;
    const blur = 12 + (lighting.intensity / 100) * 8;
    const opacity = 0.15 + (lighting.intensity / 100) * 0.2;

    return {
      position: 'absolute' as const,
      left: x + offsetX,
      top: y + height + offsetY - 2,
      width: width,
      height: 8,
      background: `radial-gradient(ellipse at center, rgba(0,0,0,${opacity}) 0%, transparent 70%)`,
      filter: `blur(${blur}px)`,
      transform: `scaleX(${0.9 + (lighting.intensity / 100) * 0.1})`,
      pointerEvents: 'none' as const,
    };
  }, [x, y, width, height, lighting.timeOfDay, lighting.intensity]);

  return <div style={shadowStyle} aria-hidden="true" />;
}
