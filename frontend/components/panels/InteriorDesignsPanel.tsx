'use client';

import { useState } from 'react';
import { LayoutDashboard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesignPreset {
  id: string;
  name: string;
  style: string;
  description: string;
  thumbnail: string;
  items: string[];
  palette: string[];
}

const INTERIOR_DESIGNS: DesignPreset[] = [
  {
    id: 'scandi-living',
    name: 'Scandinavian Living Room',
    style: 'scandinavian',
    description: 'Light oak, white walls, minimal art, cozy textiles',
    thumbnail: '🏠',
    items: ['Light oak shelf', 'White sofa', 'Sheepskin rug', 'Pendant lamp', 'Abstract line art'],
    palette: ['#FFFFFF', '#F5F0E8', '#D4C5B0', '#8B7355', '#2D3436'],
  },
  {
    id: 'japandi-bedroom',
    name: 'Japandi Bedroom',
    style: 'japandi',
    description: 'Low platform bed, paper lanterns, bonsai, neutral tones',
    thumbnail: '🛏️',
    items: ['Low bed frame', 'Paper lantern', 'Bonsai plant', 'Linen curtains', 'Ink wash art'],
    palette: ['#F5F0E8', '#D4C5B0', '#8B7355', '#4A3520', '#1A1A1A'],
  },
  {
    id: 'boho-studio',
    name: 'Bohemian Studio',
    style: 'boho',
    description: 'Macramé, layered rugs, plants everywhere, warm lighting',
    thumbnail: '🌿',
    items: ['Macramé wall hanging', 'Layered rugs', 'Rattan chair', 'String lights', 'Gallery wall'],
    palette: ['#F5E6D3', '#D4956A', '#8B5030', '#6B9B5E', '#C07A9A'],
  },
  {
    id: 'industrial-loft',
    name: 'Industrial Loft',
    style: 'industrial',
    description: 'Exposed brick, metal shelving, Edison bulbs, dark leather',
    thumbnail: '🏭',
    items: ['Metal bookshelf', 'Leather sofa', 'Edison pendant', 'Concrete planter', 'Vintage poster'],
    palette: ['#2D3436', '#636E72', '#B2BEC3', '#A68B6B', '#8B4513'],
  },
  {
    id: 'coastal-retreat',
    name: 'Coastal Retreat',
    style: 'coastal',
    description: 'Ocean blues, driftwood, linen, seashell accents',
    thumbnail: '🌊',
    items: ['Linen sofa', 'Driftwood mirror', 'Jute rug', 'Blue throw pillows', 'Ocean photography'],
    palette: ['#FFFFFF', '#E8EEF5', '#6B95C0', '#D4C5B0', '#2D5F8A'],
  },
  {
    id: 'midcentury-den',
    name: 'Mid-Century Den',
    style: 'mid-century',
    description: 'Walnut furniture, mustard accents, geometric patterns, tapered legs',
    thumbnail: '🪑',
    items: ['Walnut credenza', 'Egg chair', 'Sputnik chandelier', 'Geometric rug', 'Retro clock'],
    palette: ['#F5F0E8', '#D4956A', '#2D5F8A', '#6B9B5E', '#8B4513'],
  },
  {
    id: 'maximalist-glam',
    name: 'Maximalist Glam',
    style: 'maximalist',
    description: 'Bold patterns, velvet, gold accents, gallery walls, statement pieces',
    thumbnail: '✨',
    items: ['Velvet sofa', 'Gold mirror', 'Gallery wall (8 frames)', 'Chandelier', 'Patterned rug'],
    palette: ['#D63031', '#6C5CE7', '#FDCB6E', '#00B894', '#0984E3'],
  },
  {
    id: 'minimalist-zen',
    name: 'Minimalist Zen',
    style: 'minimalist',
    description: 'Empty space as design, single statement piece, monochrome',
    thumbnail: '⬜',
    items: ['Floor cushion', 'Single large art', 'Bonsai', 'Paper lamp', 'Stone tray'],
    palette: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E', '#212121'],
  },
];

export function InteriorDesignsPanel() {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [appliedDesign, setAppliedDesign] = useState<string | null>(null);

  const handleApply = (designId: string) => {
    setAppliedDesign(designId);
    // In production, this would place all items from the design onto the canvas
  };

  const activeDesign = INTERIOR_DESIGNS.find((d) => d.id === selectedDesign);

  if (activeDesign) {
    return (
      <div className="flex flex-col h-full">
        {/* Detail View */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setSelectedDesign(null)}
            className="text-xs text-primary hover:underline mb-2 block"
          >
            ← Back to designs
          </button>
          <h3 className="font-semibold text-lg">{activeDesign.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{activeDesign.description}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preview */}
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-6xl">
            {activeDesign.thumbnail}
          </div>

          {/* Color Palette */}
          <div>
            <p className="text-xs font-medium mb-2">Color Palette</p>
            <div className="flex gap-2">
              {activeDesign.palette.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[9px] text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Included Items */}
          <div>
            <p className="text-xs font-medium mb-2">Included Items</p>
            <div className="space-y-1.5">
              {activeDesign.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            onClick={() => handleApply(activeDesign.id)}
          >
            {appliedDesign === activeDesign.id ? (
              <><Check className="h-4 w-4 mr-2" /> Applied</>
            ) : (
              'Apply This Design'
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Places all items onto your room canvas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Interior Designs
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Complete room designs — click to preview, apply to place all items at once
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {INTERIOR_DESIGNS.map((design) => (
          <button
            key={design.id}
            onClick={() => setSelectedDesign(design.id)}
            className={`w-full p-3 rounded-xl border text-left transition-all hover:shadow-md ${
              appliedDesign === design.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{design.thumbnail}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{design.name}</p>
                  {appliedDesign === design.id && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  {design.description}
                </p>
                <div className="flex gap-1 mt-2">
                  {design.palette.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
