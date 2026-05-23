'use client';

import Link from 'next/link';
import { Frame, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Frame className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ArtVision</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Saved Artworks</h1>
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No saved artworks yet</p>
          <p className="text-sm mt-1">Browse the marketplace and save artworks you love</p>
          <Link href="/marketplace">
            <Button className="mt-4">Browse Marketplace</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
