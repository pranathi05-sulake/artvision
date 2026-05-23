'use client';

import { useAppStore, StyleTheme } from '@/lib/store';
import { Wand2, Check, Sparkles } from 'lucide-react';

const THEMES: Array<{
  id: StyleTheme;
  name: string;
  description: string;
  colors: string[];
  emoji: string;
}> = [
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Clean lines, light woods, white & grey palette, minimal clutter',
    colors: ['#FFFFFF', '#F5F5F0', '#D4C5B0', '#8B7355', '#2D3436'],
    emoji: '🇸🇪',
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'Japanese minimalism meets Scandinavian warmth. Natural materials, muted tones',
    colors: ['#F5F0E8', '#D4C5B0', '#8B7355', '#4A3520', '#2D3436'],
    emoji: '🇯🇵',
  },
  {
    id: 'boho',
    name: 'Bohemian',
    description: 'Layered textures, warm earth tones, plants, macramé, global patterns',
    colors: ['#F5E6D3', '#D4956A', '#8B5030', '#6B9B5E', '#C07A9A'],
    emoji: '🌿',
  },
  {
    id: 'maximalist',
    name: 'Maximalist',
    description: 'Bold colors, mixed patterns, statement pieces, gallery walls',
    colors: ['#D63031', '#6C5CE7', '#FDCB6E', '#00B894', '#0984E3'],
    emoji: '🎨',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Exposed brick, metal accents, dark tones, raw materials',
    colors: ['#2D3436', '#636E72', '#B2BEC3', '#A68B6B', '#8B4513'],
    emoji: '🏭',
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Ocean blues, sandy neutrals, natural textures, relaxed vibe',
    colors: ['#FFFFFF', '#E8EEF5', '#6B95C0', '#D4C5B0', '#2D5F8A'],
    emoji: '🌊',
  },
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    description: 'Retro shapes, warm woods, mustard & teal accents, tapered legs',
    colors: ['#F5F0E8', '#D4956A', '#2D5F8A', '#6B9B5E', '#8B4513'],
    emoji: '🪑',
  },
];

export function ThemePanel() {
  const { activeTheme, setActiveTheme, detectedStyle } = useAppStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Style Themes
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Select a theme to filter products and get matching suggestions
        </p>
      </div>

      {/* Detected Style */}
      {detectedStyle && (
        <div className="p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Detected Style</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your room looks <span className="font-medium capitalize">{detectedStyle}</span>
          </p>
        </div>
      )}

      {/* Theme Cards */}
      <div className="p-4 space-y-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(activeTheme === theme.id ? null : theme.id)}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              activeTheme === theme.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                : 'border-border hover:border-primary/40 hover:bg-accent/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{theme.emoji}</span>
                <span className="text-sm font-medium">{theme.name}</span>
              </div>
              {activeTheme === theme.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {theme.description}
            </p>
            <div className="flex gap-1.5 mt-2">
              {theme.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Active Theme Info */}
      {activeTheme && (
        <div className="p-4 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Products in Art, Furniture, and Décor panels are now filtered to match your{' '}
            <span className="font-medium capitalize">{activeTheme}</span> theme.
          </p>
        </div>
      )}
    </div>
  );
}
