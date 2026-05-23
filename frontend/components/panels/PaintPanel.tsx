'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Paintbrush, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PALETTES = {
  'Warm Neutrals': ['#F5F0E8', '#E8DFD0', '#D4C5B0', '#C4A882', '#A68B6B', '#8B7355'],
  'Cool Tones': ['#E8EEF5', '#C5D5E8', '#9BB5D4', '#6B95C0', '#4A7AAD', '#2D5F8A'],
  'Earthy': ['#F0E6D3', '#D4B896', '#B8956A', '#8B6B3D', '#6B5030', '#4A3520'],
  'Bold': ['#2D3436', '#D63031', '#0984E3', '#00B894', '#FDCB6E', '#6C5CE7'],
  'Sage & Olive': ['#E8EDE5', '#C5D4BC', '#9BB893', '#6B9B5E', '#4A7A3D', '#2D5A20'],
  'Blush & Mauve': ['#F5E6EA', '#E8C5D0', '#D4A0B5', '#C07A9A', '#A65580', '#8B3065'],
};

const WALLPAPER_PATTERNS = [
  { id: 'linen', name: 'Linen Texture', preview: '▤' },
  { id: 'brick', name: 'Exposed Brick', preview: '🧱' },
  { id: 'geometric', name: 'Geometric', preview: '◆' },
  { id: 'floral', name: 'Floral', preview: '🌸' },
  { id: 'herringbone', name: 'Herringbone', preview: '⟋' },
  { id: 'marble', name: 'Marble', preview: '🪨' },
  { id: 'wood_panel', name: 'Wood Panel', preview: '🪵' },
  { id: 'terrazzo', name: 'Terrazzo', preview: '⬡' },
];

export function PaintPanel() {
  const {
    paintColor,
    setPaintColor,
    paintTolerance,
    setPaintTolerance,
    wallpaperPattern,
    setWallpaperPattern,
    showBeforeAfter,
    setShowBeforeAfter,
  } = useAppStore();

  const [mode, setMode] = useState<'paint' | 'wallpaper'>('paint');

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-primary" />
          Wall Paint & Wallpaper
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click on any wall area in the photo to apply color or pattern
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="p-4 border-b border-border">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => { setMode('paint'); setWallpaperPattern(null); }}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === 'paint' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            Paint Color
          </button>
          <button
            onClick={() => setMode('wallpaper')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === 'wallpaper' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            Wallpaper
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {mode === 'paint' ? (
          <>
            {/* Current Color */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
                style={{ backgroundColor: paintColor }}
              />
              <div>
                <p className="text-sm font-medium">Selected Color</p>
                <p className="text-xs text-muted-foreground uppercase">{paintColor}</p>
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <label className="text-xs font-medium block mb-1.5">Custom Color</label>
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                className="w-full h-10 rounded-md border border-input cursor-pointer"
              />
            </div>

            {/* Palettes */}
            {Object.entries(PALETTES).map(([name, colors]) => (
              <div key={name}>
                <p className="text-xs font-medium mb-1.5">{name}</p>
                <div className="flex gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPaintColor(color)}
                      className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${
                        paintColor === color ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Tolerance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Edge Tolerance</span>
                <span className="text-muted-foreground">{paintTolerance}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={paintTolerance}
                onChange={(e) => setPaintTolerance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>Precise</span>
                <span>Broad</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Wallpaper Patterns */}
            <div className="grid grid-cols-2 gap-2">
              {WALLPAPER_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setWallpaperPattern(pattern.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    wallpaperPattern === pattern.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl block">{pattern.preview}</span>
                  <p className="text-xs font-medium mt-1">{pattern.name}</p>
                </button>
              ))}
            </div>

            {wallpaperPattern && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setWallpaperPattern(null)}
              >
                Clear Wallpaper
              </Button>
            )}
          </>
        )}

        {/* Before/After Toggle */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent transition-colors"
          >
            <span className="text-sm font-medium">Before / After</span>
            {showBeforeAfter ? (
              <ToggleRight className="h-5 w-5 text-primary" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
