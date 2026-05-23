'use client';

import Link from 'next/link';
import { Frame, Plus, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Frame className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ArtVision</span>
          </Link>
          <Link href="/try-on">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">All Projects</h1>
        <div className="text-center py-12 text-muted-foreground">
          <Frame className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
          <Link href="/try-on">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
