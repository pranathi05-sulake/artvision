'use client';

import { useState } from 'react';
import { useAppStore, DecorItem, PlacedDecor } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { Flower2, Trash2, FlipHorizontal } from 'lucide-react';

const DECOR_CATALOG: DecorItem[] = [
  { id: 'plant-1', name: 'Fiddle Leaf Fig', category: 'plants', imageUrl: '🌿' },
  { id: 'plant-2', name: 'Snake Plant', category: 'plants', imageUrl: '🪴' },
  { id: 'plant-3', name: 'Monstera', category: 'plants', imageUrl: '🌱' },
  { id: 'plant-4', name: 'Pothos Hanging', category: 'plants', imageUrl: '☘️' },
  { id: 'plant-5', name: 'Cactus Trio', category: 'plants', imageUrl: '🌵' },
  { id: 'vase-1', name: 'Ceramic Vase', category: 'vases', imageUrl: '🏺' },
  { id: 'vase-2', name: 'Glass Vase', category: 'vases', imageUrl: '⚱️' },
  { id: 'vase-3', name: 'Terracotta Pot', category: 'vases', imageUrl: '🫙' },
  { id: 'mirror-1', name: 'Round Mirror', category: 'mirrors', imageUrl: '🪞' },
  { id: 'mirror-2', name: 'Arch Mirror', category: 'mirrors', imageUrl: '🔲' },
  { id: 'cushion-1', name: 'Throw Pillow', category: 'cushions', imageUrl: '🟫' },
  { id: 'cushion-2', name: 'Velvet Cushion', category: 'cushions', imageUrl: '🟪' },
  { id: 'candle-1', name: 'Pillar Candle', category: 'candles', imageUrl: '🕯️' },
  { id: 'candle-2', name: 'Candle Set', category: 'candles', imageUrl: '🕯️' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'plants', label: 'Plants' },
  { id: 'vases', label: 'Vases' },
  { id: 'mirrors', label: 'Mirrors' },
  { id: 'cushions', label: 'Cushions' },
  { id: 'candles', label: 'Candles' },
];

export function DecorPanel() {
  const {
    placedDecor,
    addDecor,
    removeDecor,
    updateDecor,
    selectedDecorId,
    setSelectedDecor,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredDecor = activeCategory === 'all'
    ? DECOR_CATALOG
    : DECOR_CATALOG.filter((d) => d.category === activeCategory);

  const handleDragStart = (e: React.DragEvent, item: DecorItem) => {
    const dragData = {
      type: 'decor',
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handlePlaceDecor = (item: DecorItem) => {
    const placed: PlacedDecor = {
      id: generateId(),
      item,
      position: { x: 250, y: 300 },
      scale: 1,
      flipped: false,
      opacity: 100,
    };
    addDecor(placed);
  };

  const handleFlip = (id: string) => {
    const item = placedDecor.find((d) => d.id === id);
    if (item) updateDecor(id, { flipped: !item.flipped });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-primary" />
          Décor & Greenery
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Add plants, vases, mirrors, and accessories
        </p>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decor Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] text-muted-foreground mb-2">
          Drag items onto your room or click to place
        </p>
        <div className="grid grid-cols-3 gap-2">
          {filteredDecor.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => handlePlaceDecor(item)}
              className="p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-center cursor-grab active:cursor-grabbing"
            >
              <span className="text-2xl block">{item.imageUrl}</span>
              <p className="text-[10px] font-medium mt-1 truncate">{item.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Placed Decor List */}
      {placedDecor.length > 0 && (
        <div className="border-t border-border p-3 max-h-36 overflow-y-auto">
          <p className="text-xs font-medium mb-2">Placed ({placedDecor.length})</p>
          <div className="space-y-1">
            {placedDecor.map((pd) => (
              <div
                key={pd.id}
                className={`flex items-center justify-between p-1.5 rounded text-xs ${
                  selectedDecorId === pd.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDecor(pd.id)}
              >
                <span>{pd.item.imageUrl} {pd.item.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFlip(pd.id); }}
                    className="p-1 hover:bg-accent rounded"
                    title="Flip"
                  >
                    <FlipHorizontal className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeDecor(pd.id); }}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
