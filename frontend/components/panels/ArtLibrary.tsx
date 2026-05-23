'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Artwork } from '@/lib/api';
import { Search, Star, ArrowLeft, GripVertical, X, Heart, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: 'Abstract Horizon',
    artistName: 'Sarah Chen',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=500&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=250&fit=crop',
    style: ['abstract', 'minimalist'],
    colors: ['#2563eb', '#f59e0b', '#ffffff'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 89.99,
    currency: 'USD',
  },
  {
    id: '2',
    title: 'Mountain Serenity',
    artistName: 'James Park',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=250&h=200&fit=crop',
    style: ['landscape', 'photography'],
    colors: ['#1e3a5f', '#87ceeb', '#ffffff'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 129.99,
    currency: 'USD',
  },
  {
    id: '3',
    title: 'Geometric Dreams',
    artistName: 'Maria Lopez',
    imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=400&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=200&h=200&fit=crop',
    style: ['geometric', 'modern'],
    colors: ['#ef4444', '#3b82f6', '#fbbf24'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 65.0,
    currency: 'USD',
  },
  {
    id: '4',
    title: 'Botanical Study',
    artistName: 'Emma Wilson',
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=350&h=500&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=175&h=250&fit=crop',
    style: ['botanical', 'watercolor'],
    colors: ['#22c55e', '#f0fdf4', '#166534'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 75.0,
    currency: 'USD',
  },
  {
    id: '5',
    title: 'Urban Rhythm',
    artistName: 'Alex Turner',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&h=350&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=250&h=175&fit=crop',
    style: ['urban', 'photography'],
    colors: ['#1f2937', '#6b7280', '#f3f4f6'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 110.0,
    currency: 'USD',
  },
  {
    id: '6',
    title: 'Ocean Waves',
    artistName: 'Lisa Nakamura',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=300&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=150&fit=crop',
    style: ['abstract', 'coastal'],
    colors: ['#0ea5e9', '#bae6fd', '#f0f9ff'],
    sourceType: 'marketplace',
    sourceUrl: null,
    price: 95.0,
    currency: 'USD',
  },
];

const STYLE_FILTERS = [
  'All',
  'Abstract',
  'Minimalist',
  'Photography',
  'Botanical',
  'Geometric',
  'Modern',
  'Coastal',
  'Urban',
];

export function ArtLibrary() {
  const { artworks, setArtworks, roomAnalysis } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [displayArtworks, setDisplayArtworks] = useState<Artwork[]>(SAMPLE_ARTWORKS);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    if (artworks.length === 0) {
      setArtworks(SAMPLE_ARTWORKS);
    }
  }, [artworks.length, setArtworks]);

  useEffect(() => {
    let filtered = SAMPLE_ARTWORKS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (art) =>
          art.title.toLowerCase().includes(query) ||
          art.artistName?.toLowerCase().includes(query) ||
          art.style.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (activeFilter !== 'All') {
      filtered = filtered.filter((art) =>
        art.style.some((s) => s.toLowerCase() === activeFilter.toLowerCase())
      );
    }

    setDisplayArtworks(filtered);
  }, [searchQuery, activeFilter]);

  const handleDragStart = (e: React.DragEvent, artwork: Artwork) => {
    e.dataTransfer.setData('application/json', JSON.stringify(artwork));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Product Detail View
  if (selectedArtwork) {
    return (
      <ArtworkDetailView
        artwork={selectedArtwork}
        onBack={() => setSelectedArtwork(null)}
        onDragStart={handleDragStart}
      />
    );
  }

  // Grid View (browse products)
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3 border-b border-border">
        <h2 className="font-semibold text-lg">Art Library</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artworks..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap gap-1.5">
          {STYLE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      {roomAnalysis && (
        <div className="p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Recommended for Your Space</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your {roomAnalysis.room_style} style room
          </p>
        </div>
      )}

      {/* Art Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Click to view details, then drag onto your wall
        </p>
        <div className="grid grid-cols-2 gap-3">
          {displayArtworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => setSelectedArtwork(artwork)}
              className="art-card group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                <img
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                    <Maximize2 className="h-3 w-3 text-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs font-medium truncate">{artwork.title}</p>
                  <p className="text-white/70 text-[10px]">Click to view & place</p>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{artwork.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{artwork.artistName}</p>
                <div className="flex gap-1 mt-1.5">
                  {artwork.style.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayArtworks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No artworks found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Product detail view - users see full artwork info before dragging onto canvas.
 */
function ArtworkDetailView({
  artwork,
  onBack,
  onDragStart,
}: {
  artwork: Artwork;
  onBack: () => void;
  onDragStart: (e: React.DragEvent, artwork: Artwork) => void;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="Back to gallery"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium flex-1 truncate">{artwork.title}</span>
        <button
          onClick={() => setLiked(!liked)}
          className={`p-1.5 rounded-md transition-colors ${liked ? 'text-red-500' : 'hover:bg-accent'}`}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Large Preview Image */}
        <div className="relative bg-muted">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full aspect-[4/5] object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg">{artwork.title}</h3>
            <p className="text-sm text-muted-foreground">by {artwork.artistName}</p>
          </div>

          {/* Style Tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Style</p>
            <div className="flex flex-wrap gap-1.5">
              {artwork.style.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground capitalize"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Color Palette</p>
            <div className="flex gap-2">
              {artwork.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[9px] text-muted-foreground uppercase">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes Available */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Available Sizes</p>
            <div className="grid grid-cols-3 gap-1.5">
              {['12×16"', '18×24"', '24×36"'].map((size) => (
                <div key={size} className="text-center py-1.5 rounded-md border border-border text-xs">
                  {size}
                </div>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="text-xs text-muted-foreground">
            <p>Source: <span className="capitalize">{artwork.sourceType}</span></p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Drag to Place */}
      <div className="p-3 border-t border-border bg-card space-y-2">
        {/* Draggable element */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, artwork)}
          className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 cursor-grab active:cursor-grabbing hover:border-primary hover:bg-primary/10 transition-all"
        >
          <div className="p-2 rounded-md bg-primary/10">
            <GripVertical className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Drag to place on wall</p>
            <p className="text-[11px] text-muted-foreground">Grab here and drop onto your room photo</p>
          </div>
          <img
            src={artwork.thumbnailUrl}
            alt=""
            className="w-10 h-10 rounded object-cover border border-border"
            draggable={false}
          />
        </div>

        {/* Buy Button removed - direct access */}
      </div>
    </motion.div>
  );
}
