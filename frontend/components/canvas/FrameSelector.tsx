'use client';

import { useAppStore, FrameConfig } from '@/lib/store';

const QUICK_FRAMES: Array<{ id: string; name: string; color: string }> = [
  { id: 'minimalist_black', name: 'Black', color: '#1a1a1a' },
  { id: 'white_wood', name: 'White', color: '#f5f5f5' },
  { id: 'natural_wood', name: 'Wood', color: '#8B6914' },
  { id: 'ornate_gold', name: 'Gold', color: '#d4a843' },
  { id: 'metallic_silver', name: 'Silver', color: '#c0c0c0' },
];

interface FrameSelectorProps {
  onFrameChange?: (frame: Partial<FrameConfig>) => void;
}

/**
 * Quick frame selector that appears near selected artwork.
 * Provides fast access to common frame styles without opening the full panel.
 */
export function FrameSelector({ onFrameChange }: FrameSelectorProps) {
  const { currentFrame, setCurrentFrame, selectedPlacementId, updatePlacement } = useAppStore();

  const handleSelect = (frameId: string, color: string) => {
    const updates: Partial<FrameConfig> = { style: frameId, color };
    setCurrentFrame(updates);

    if (selectedPlacementId) {
      updatePlacement(selectedPlacementId, {
        frame: { ...currentFrame, ...updates },
      });
    }

    onFrameChange?.(updates);
  };

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border rounded-lg shadow-sm">
      {QUICK_FRAMES.map((frame) => (
        <button
          key={frame.id}
          onClick={() => handleSelect(frame.id, frame.color)}
          className={`w-7 h-7 rounded border-2 transition-all ${
            currentFrame.style === frame.id
              ? 'ring-2 ring-primary ring-offset-1 scale-110'
              : 'hover:scale-105'
          }`}
          style={{ borderColor: frame.color, backgroundColor: `${frame.color}20` }}
          title={frame.name}
          aria-label={`Select ${frame.name} frame`}
        />
      ))}
    </div>
  );
}
