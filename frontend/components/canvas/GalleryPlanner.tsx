'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

const LAYOUT_TEMPLATES = [
  { id: 'grid_symmetric', name: 'Grid', icon: '⊞', description: 'Symmetric grid layout' },
  { id: 'salon_asymmetric', name: 'Salon', icon: '🖼️', description: 'Asymmetric salon style' },
  { id: 'horizontal_row', name: 'Row', icon: '━', description: 'Single horizontal row' },
  { id: 'vertical_column', name: 'Column', icon: '┃', description: 'Vertical column' },
  { id: 'diptych', name: 'Diptych', icon: '▪▪', description: 'Two pieces side by side' },
  { id: 'triptych', name: 'Triptych', icon: '▪▪▪', description: 'Three pieces in a row' },
  { id: 'large_center', name: 'Center', icon: '◼', description: 'Large center with smaller surrounding' },
  { id: 'staircase', name: 'Staircase', icon: '📐', description: 'Ascending diagonal' },
];

interface GalleryPlannerProps {
  onApplyLayout: (layout: string, spacing: number) => void;
}

/**
 * Gallery Wall Planner - helps users arrange multiple artworks
 * in predefined layout templates with configurable spacing.
 */
export function GalleryPlanner({ onApplyLayout }: GalleryPlannerProps) {
  const { placements } = useAppStore();
  const [selectedLayout, setSelectedLayout] = useState('grid_symmetric');
  const [spacing, setSpacing] = useState(3); // inches

  const handleApply = () => {
    onApplyLayout(selectedLayout, spacing);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Gallery Layout</h3>
      </div>

      {placements.length < 2 && (
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Place at least 2 artworks on the canvas to use gallery layouts.
        </p>
      )}

      {/* Layout Templates */}
      <div className="grid grid-cols-2 gap-2">
        {LAYOUT_TEMPLATES.map((layout) => (
          <button
            key={layout.id}
            onClick={() => setSelectedLayout(layout.id)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedLayout === layout.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-lg">{layout.icon}</span>
            <p className="text-xs font-medium mt-1">{layout.name}</p>
            <p className="text-[10px] text-muted-foreground">{layout.description}</p>
          </button>
        ))}
      </div>

      {/* Spacing Control */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Spacing</span>
          <span className="text-muted-foreground">{spacing}&quot; between frames</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          step="0.5"
          value={spacing}
          onChange={(e) => setSpacing(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>Tight (1&quot;)</span>
          <span>Spacious (6&quot;)</span>
        </div>
      </div>

      {/* Apply Button */}
      <Button
        onClick={handleApply}
        disabled={placements.length < 2}
        className="w-full"
        size="sm"
      >
        Apply Layout ({placements.length} pieces)
      </Button>
    </div>
  );
}
