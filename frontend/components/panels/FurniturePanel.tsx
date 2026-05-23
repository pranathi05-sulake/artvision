'use client';

import { useState } from 'react';
import { useAppStore, FurnitureItem, PlacedFurniture } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { Sofa, Trash2, GripVertical } from 'lucide-react';

const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'sofa-1', name: 'Modern Sofa', category: 'seating', imageUrl: '🛋️', widthM: 2.2, heightM: 0.85 },
  { id: 'sofa-2', name: 'L-Shape Sectional', category: 'seating', imageUrl: '🛋️', widthM: 2.8, heightM: 1.6 },
  { id: 'chair-1', name: 'Accent Chair', category: 'seating', imageUrl: '🪑', widthM: 0.8, heightM: 0.85 },
  { id: 'chair-2', name: 'Lounge Chair', category: 'seating', imageUrl: '💺', widthM: 0.9, heightM: 0.9 },
  { id: 'table-1', name: 'Coffee Table', category: 'tables', imageUrl: '🪵', widthM: 1.2, heightM: 0.6 },
  { id: 'table-2', name: 'Side Table', category: 'tables', imageUrl: '🔲', widthM: 0.5, heightM: 0.5 },
  { id: 'table-3', name: 'Dining Table', category: 'tables', imageUrl: '🍽️', widthM: 1.8, heightM: 0.9 },
  { id: 'shelf-1', name: 'Bookshelf', category: 'storage', imageUrl: '📚', widthM: 0.9, heightM: 1.8 },
  { id: 'shelf-2', name: 'TV Console', category: 'storage', imageUrl: '📺', widthM: 1.6, heightM: 0.5 },
  { id: 'shelf-3', name: 'Sideboard', category: 'storage', imageUrl: '🗄️', widthM: 1.4, heightM: 0.8 },
  { id: 'rug-1', name: 'Area Rug (Large)', category: 'rugs', imageUrl: '🟫', widthM: 2.4, heightM: 1.7 },
  { id: 'rug-2', name: 'Runner Rug', category: 'rugs', imageUrl: '🟤', widthM: 2.0, heightM: 0.7 },
  { id: 'bed-1', name: 'Queen Bed', category: 'beds', imageUrl: '🛏️', widthM: 1.6, heightM: 2.0 },
  { id: 'bed-2', name: 'King Bed', category: 'beds', imageUrl: '🛏️', widthM: 1.9, heightM: 2.0 },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'seating', label: 'Seating' },
  { id: 'tables', label: 'Tables' },
  { id: 'storage', label: 'Storage' },
  { id: 'rugs', label: 'Rugs' },
  { id: 'beds', label: 'Beds' },
];

export function FurniturePanel() {
  const {
    roomWidthM,
    setRoomWidthM,
    placedFurniture,
    addFurniture,
    removeFurniture,
    selectedFurnitureId,
    setSelectedFurniture,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFurniture = activeCategory === 'all'
    ? FURNITURE_CATALOG
    : FURNITURE_CATALOG.filter((f) => f.category === activeCategory);

  const handleDragStart = (e: React.DragEvent, item: FurnitureItem) => {
    const dragData = {
      type: 'furniture',
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      widthM: item.widthM,
      heightM: item.heightM,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDelete = (id: string) => {
    removeFurniture(id);
    if (selectedFurnitureId === id) setSelectedFurniture(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Sofa className="h-5 w-5 text-primary" />
          Furniture
        </h2>

        {/* Room Width */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Room width:
          </label>
          <input
            type="number"
            min="2"
            max="15"
            step="0.5"
            value={roomWidthM}
            onChange={(e) => setRoomWidthM(parseFloat(e.target.value) || 4)}
            className="w-16 px-2 py-1 rounded border border-input bg-background text-sm text-center"
          />
          <span className="text-xs text-muted-foreground">meters</span>
        </div>

        {/* Categories */}
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

      {/* Furniture Grid - Draggable */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
          <GripVertical className="h-3 w-3" /> Drag items onto your room
        </p>
        <div className="grid grid-cols-2 gap-2">
          {filteredFurniture.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-center cursor-grab active:cursor-grabbing"
            >
              <span className="text-2xl block mb-1">{item.imageUrl}</span>
              <p className="text-xs font-medium">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.widthM}×{item.heightM}m
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Placed List */}
      {placedFurniture.length > 0 && (
        <div className="border-t border-border p-3 max-h-36 overflow-y-auto">
          <p className="text-xs font-medium mb-2">On Canvas ({placedFurniture.length})</p>
          <div className="space-y-1">
            {placedFurniture.map((pf) => (
              <div
                key={pf.id}
                className={`flex items-center justify-between p-1.5 rounded text-xs ${
                  selectedFurnitureId === pf.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedFurniture(pf.id)}
              >
                <span>{pf.item.imageUrl} {pf.item.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(pf.id); }}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
