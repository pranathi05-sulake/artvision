'use client';

import { useAppStore, FrameConfig } from '@/lib/store';
import { Frame, Check } from 'lucide-react';

const FRAME_STYLES = [
  { id: 'minimalist_black', name: 'Minimalist Black', color: '#1a1a1a', preview: '▪️' },
  { id: 'ornate_gold', name: 'Ornate Gold', color: '#d4a843', preview: '🖼️' },
  { id: 'natural_wood', name: 'Natural Wood', color: '#8B6914', preview: '🪵' },
  { id: 'white_wood', name: 'White Wood', color: '#f5f5f5', preview: '⬜' },
  { id: 'metallic_silver', name: 'Metallic Silver', color: '#c0c0c0', preview: '🔲' },
  { id: 'rustic_barn', name: 'Rustic Barn', color: '#6b4423', preview: '🏚️' },
  { id: 'acrylic_float', name: 'Acrylic Float', color: '#e8e8e8', preview: '💎' },
  { id: 'museum_metal', name: 'Museum Metal', color: '#4a4a4a', preview: '🏛️' },
  { id: 'vintage_gilt', name: 'Vintage Gilt', color: '#b8860b', preview: '✨' },
  { id: 'bamboo', name: 'Bamboo', color: '#c4a35a', preview: '🎋' },
  { id: 'rope_coastal', name: 'Rope Coastal', color: '#d2b48c', preview: '⚓' },
  { id: 'industrial_pipe', name: 'Industrial Pipe', color: '#3d3d3d', preview: '🔧' },
];

const THICKNESS_OPTIONS: { id: FrameConfig['thickness']; label: string; width: string }[] = [
  { id: 'thin', label: 'Thin (0.5")', width: '2px' },
  { id: 'medium', label: 'Medium (1.5")', width: '6px' },
  { id: 'thick', label: 'Thick (3")', width: '12px' },
];

const MAT_COLORS = [
  { id: null, name: 'None', color: 'transparent' },
  { id: '#FFFFFF', name: 'White', color: '#FFFFFF' },
  { id: '#000000', name: 'Black', color: '#000000' },
  { id: '#F5F5DC', name: 'Cream', color: '#F5F5DC' },
  { id: '#808080', name: 'Gray', color: '#808080' },
  { id: '#2F4F4F', name: 'Dark Slate', color: '#2F4F4F' },
];

const GLASS_OPTIONS: { id: FrameConfig['glassFinish']; label: string }[] = [
  { id: 'none', label: 'No Glass' },
  { id: 'glossy', label: 'Glossy' },
  { id: 'matte', label: 'Matte' },
  { id: 'anti-reflective', label: 'Anti-Reflective' },
  { id: 'museum', label: 'Museum Grade' },
];

export function FrameLibrary() {
  const { currentFrame, setCurrentFrame, selectedPlacementId, updatePlacement } = useAppStore();

  const handleFrameChange = (updates: Partial<FrameConfig>) => {
    setCurrentFrame(updates);
    if (selectedPlacementId) {
      updatePlacement(selectedPlacementId, {
        frame: { ...currentFrame, ...updates },
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Frame Styles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a frame style for your artwork
        </p>
      </div>

      {/* Frame Style Grid */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Style</h3>
          <div className="grid grid-cols-3 gap-2">
            {FRAME_STYLES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleFrameChange({ style: frame.id, color: frame.color })}
                className={`p-2 rounded-lg border text-center transition-all ${
                  currentFrame.style === frame.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div
                  className="w-full aspect-square rounded border-4 mb-1.5 mx-auto max-w-[40px]"
                  style={{ borderColor: frame.color }}
                />
                <p className="text-[10px] font-medium leading-tight">{frame.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Thickness */}
        <div>
          <h3 className="text-sm font-medium mb-3">Thickness</h3>
          <div className="flex gap-2">
            {THICKNESS_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFrameChange({ thickness: option.id })}
                className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                  currentFrame.thickness === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex justify-center mb-1.5">
                  <div
                    className="w-8 h-8 border-current rounded"
                    style={{ borderWidth: option.width, borderColor: currentFrame.color }}
                  />
                </div>
                <p className="text-[10px] font-medium">{option.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mat Board */}
        <div>
          <h3 className="text-sm font-medium mb-3">Mat Board</h3>
          <div className="flex flex-wrap gap-2">
            {MAT_COLORS.map((mat) => (
              <button
                key={mat.name}
                onClick={() => handleFrameChange({ matColor: mat.id })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                  currentFrame.matColor === mat.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {mat.id ? (
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: mat.color }}
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-border bg-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500 rotate-45 origin-center w-[1px] mx-auto" />
                  </div>
                )}
                {mat.name}
              </button>
            ))}
          </div>

          {/* Mat Width Slider */}
          {currentFrame.matColor && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Mat Width</span>
                <span>{currentFrame.matWidth || 2}&quot;</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={currentFrame.matWidth || 2}
                onChange={(e) => handleFrameChange({ matWidth: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Glass Finish */}
        <div>
          <h3 className="text-sm font-medium mb-3">Glass Finish</h3>
          <div className="space-y-1.5">
            {GLASS_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFrameChange({ glassFinish: option.id })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all ${
                  currentFrame.glassFinish === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span>{option.label}</span>
                {currentFrame.glassFinish === option.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
