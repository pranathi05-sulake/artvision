'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Frame, Sparkles, Palette, ArrowLeft, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mlServiceApi } from '@/lib/api';

const STYLE_PRESETS = [
  { id: 'abstract_expressionism', label: 'Abstract', emoji: '🎨' },
  { id: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { id: 'oil_painting', label: 'Oil Painting', emoji: '🖌️' },
  { id: 'digital_art', label: 'Digital Art', emoji: '💻' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'line_art', label: 'Line Art', emoji: '✏️' },
  { id: 'impressionism', label: 'Impressionism', emoji: '🌸' },
  { id: 'pop_art', label: 'Pop Art', emoji: '🎪' },
  { id: 'minimalist', label: 'Minimalist', emoji: '⬜' },
  { id: 'geometric', label: 'Geometric', emoji: '🔷' },
  { id: 'botanical', label: 'Botanical', emoji: '🌿' },
  { id: 'typography', label: 'Typography', emoji: '🔤' },
];

const COLOR_PALETTES = [
  { id: 'warm', colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'] },
  { id: 'cool', colors: ['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'] },
  { id: 'earth', colors: ['#8D6E63', '#A1887F', '#D7CCC8', '#4E342E', '#3E2723'] },
  { id: 'pastel', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },
  { id: 'monochrome', colors: ['#212121', '#424242', '#616161', '#9E9E9E', '#BDBDBD'] },
  { id: 'vibrant', colors: ['#FF1744', '#F50057', '#D500F9', '#651FFF', '#2979FF'] },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('abstract_expressionism');
  const [selectedPalette, setSelectedPalette] = useState('warm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      const palette = COLOR_PALETTES.find((p) => p.id === selectedPalette);
      const result = await mlServiceApi.generateArt({
        prompt: prompt.trim(),
        style: selectedStyle,
        colors: palette?.colors || [],
        width: 1024,
        height: 1024,
        num_variations: 4,
      });

      setGeneratedImages(result.images);
    } catch (err) {
      setError('Generation failed. Please try again.');
      console.error('Art generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Go back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Frame className="h-5 w-5 text-primary" />
              <span className="font-semibold">ArtVision</span>
            </div>
            <span className="text-sm text-muted-foreground">/ AI Art Generator</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Art Generator
              </h1>
              <p className="text-muted-foreground mt-1">
                Describe the artwork you want and our AI will create it
              </p>
            </div>

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="text-sm font-medium block mb-2">
                Describe your artwork
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain landscape at sunset with golden light reflecting on a calm lake..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Style Selection */}
            <div>
              <label className="text-sm font-medium block mb-2">
                <Palette className="h-4 w-4 inline mr-1" />
                Art Style
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 rounded-lg border text-center transition-all text-xs ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg block">{style.emoji}</span>
                    <span className="font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-sm font-medium block mb-2">Color Palette</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setSelectedPalette(palette.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedPalette === palette.id
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-0.5 justify-center mb-1">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-medium capitalize">{palette.id}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating (this may take 20-30s)...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate 4 Variations
                </>
              )}
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Right: Results */}
          <div>
            <h2 className="text-sm font-medium mb-3">Generated Artwork</h2>
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {generatedImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={`data:image/png;base64,${img}`}
                      alt={`Generated artwork variation ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="gap-1">
                        <Download className="h-3 w-3" />
                        Save
                      </Button>
                      <Link href="/try-on">
                        <Button size="sm" className="gap-1">
                          Try On Wall
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Your generated artwork will appear here</p>
                  <p className="text-xs mt-1">4 variations per generation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
