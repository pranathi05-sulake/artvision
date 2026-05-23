'use client';

import { useAppStore, LightSource } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { Lamp, Plus, Trash2, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LAMP_TYPES = [
  { id: 'floor_lamp', name: 'Floor Lamp', emoji: '🪔' },
  { id: 'pendant', name: 'Pendant Light', emoji: '💡' },
  { id: 'sconce', name: 'Wall Sconce', emoji: '🔆' },
  { id: 'ceiling', name: 'Ceiling Fixture', emoji: '⭕' },
];

const TEMP_PRESETS = [
  { value: 2700, label: 'Warm', color: '#FF9329' },
  { value: 4000, label: 'Neutral', color: '#FFF4E8' },
  { value: 5000, label: 'Cool', color: '#E3F0FF' },
];

export function LightingPanel() {
  const { lightSources, addLightSource, updateLightSource, removeLightSource } = useAppStore();

  const handleAddLight = (type: string) => {
    const newLight: LightSource = {
      id: generateId(),
      name: LAMP_TYPES.find((l) => l.id === type)?.name || 'Light',
      type: type as LightSource['type'],
      position: { x: 300, y: 200 },
      colorTemp: 2700,
      intensity: 70,
      glowRadius: 150,
    };
    addLightSource(newLight);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Lamp className="h-5 w-5 text-primary" />
          Lighting Visualizer
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Add light sources to see how they affect your space
        </p>
      </div>

      {/* Add Light Source */}
      <div className="p-4 border-b border-border">
        <p className="text-xs font-medium mb-2">Add a light source</p>
        <div className="grid grid-cols-2 gap-2">
          {LAMP_TYPES.map((lamp) => (
            <button
              key={lamp.id}
              onClick={() => handleAddLight(lamp.id)}
              className="p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-center"
            >
              <span className="text-xl block">{lamp.emoji}</span>
              <p className="text-[10px] font-medium mt-1">{lamp.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Light Sources */}
      <div className="p-4 space-y-4">
        {lightSources.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sun className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No lights added yet</p>
            <p className="text-xs mt-1">Click a lamp type above to place it</p>
          </div>
        ) : (
          lightSources.map((light) => (
            <div key={light.id} className="p-3 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{light.name}</span>
                <button
                  onClick={() => removeLightSource(light.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Color Temperature */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Color Temperature</p>
                <div className="flex gap-1.5">
                  {TEMP_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => updateLightSource(light.id, { colorTemp: preset.value })}
                      className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                        light.colorTemp === preset.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-0.5 border border-border"
                        style={{ backgroundColor: preset.color }}
                      />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Intensity</span>
                  <span>{light.intensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={light.intensity}
                  onChange={(e) => updateLightSource(light.id, { intensity: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Glow Radius */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Glow Radius</span>
                  <span>{light.glowRadius}px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  value={light.glowRadius}
                  onChange={(e) => updateLightSource(light.id, { glowRadius: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
