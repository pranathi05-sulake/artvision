'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Frame, Search, Filter, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Abstract', 'Photography', 'Landscape', 'Botanical', 'Minimalist', 'Modern', 'Vintage'];

const SAMPLE_MARKETPLACE_ART = [
  { id: '1', title: 'Coastal Serenity', artist: 'Maya Chen', price: 89, style: 'Photography', image: '' },
  { id: '2', title: 'Abstract Flow', artist: 'James Rivera', price: 120, style: 'Abstract', image: '' },
  { id: '3', title: 'Botanical Garden', artist: 'Emma Wilson', price: 65, style: 'Botanical', image: '' },
  { id: '4', title: 'Urban Geometry', artist: 'Alex Park', price: 95, style: 'Modern', image: '' },
  { id: '5', title: 'Mountain Dawn', artist: 'Sarah Lee', price: 150, style: 'Landscape', image: '' },
  { id: '6', title: 'Minimalist Lines', artist: 'Tom Baker', price: 55, style: 'Minimalist', image: '' },
  { id: '7', title: 'Vintage Bloom', artist: 'Lisa Nakamura', price: 78, style: 'Vintage', image: '' },
  { id: '8', title: 'Ocean Depths', artist: 'David Kim', price: 110, style: 'Abstract', image: '' },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const filteredArt = SAMPLE_MARKETPLACE_ART.filter((art) => {
    if (activeCategory !== 'All' && art.style !== activeCategory) return false;
    if (searchQuery && !art.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (art.price < priceRange[0] || art.price > priceRange[1]) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
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
            <span className="text-sm text-muted-foreground hidden sm:inline">/ Marketplace</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/try-on">
              <Button variant="outline" size="sm">Try On</Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artworks, artists, styles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Art Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArt.map((art) => (
            <div key={art.id} className="group rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-muted relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{art.title}</h3>
                <p className="text-xs text-muted-foreground">{art.artist}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-sm">${art.price}</span>
                  <Link href="/try-on">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Try On
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArt.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No artworks found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
