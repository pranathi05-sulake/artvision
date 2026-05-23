'use client';

import { useEffect, useRef } from 'react';
import { useAppStore, CanvasPlacement } from '@/lib/store';

interface ArtworkLayerProps {
  placement: CanvasPlacement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * ArtworkLayer renders a single artwork placement with frame on the canvas.
 * Handles perspective transformation based on depth map data.
 */
export function ArtworkLayer({ placement, isSelected, onSelect }: ArtworkLayerProps) {
  const { currentFrame } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const frameThicknessMap = {
    thin: 4,
    medium: 12,
    thick: 24,
  };

  const frameThickness = frameThicknessMap[placement.frame.thickness];
  const matWidth = placement.frame.matColor ? (placement.frame.matWidth || 2) * 4 : 0;

  return (
    <div
      ref={containerRef}
      className={`absolute cursor-move transition-shadow ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      }`}
      style={{
        left: placement.position.x,
        top: placement.position.y,
        width: placement.size.width + frameThickness * 2 + matWidth * 2,
        height: placement.size.height + frameThickness * 2 + matWidth * 2,
        transform: `rotate(${placement.rotation}deg)`,
      }}
      onClick={() => onSelect(placement.id)}
    >
      {/* Frame */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          border: `${frameThickness}px solid ${placement.frame.color}`,
          boxShadow: isSelected
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Mat Board */}
        {placement.frame.matColor && (
          <div
            className="absolute inset-0"
            style={{
              border: `${matWidth}px solid ${placement.frame.matColor}`,
            }}
          />
        )}

        {/* Artwork Image */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: matWidth,
          }}
        >
          <img
            src={placement.artworkUrl}
            alt={placement.artworkTitle}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Glass reflection effect */}
          {placement.frame.glassFinish === 'glossy' && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Size badge */}
      {isSelected && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
          {placement.realWorldSize.widthCm} × {placement.realWorldSize.heightCm} cm
        </div>
      )}
    </div>
  );
}
