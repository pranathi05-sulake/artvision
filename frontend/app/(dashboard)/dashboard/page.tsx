'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Frame, Clock, Palette, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCard {
  id: string;
  name: string;
  roomType: string;
  roomStyle: string;
  thumbnailUrl: string;
  updatedAt: string;
  placementCount: number;
}

const SAMPLE_PROJECTS: ProjectCard[] = [
  {
    id: '1',
    name: 'Living Room Refresh',
    roomType: 'Living Room',
    roomStyle: 'Scandinavian',
    thumbnailUrl: '/api/placeholder/400/300',
    updatedAt: '2024-01-15',
    placementCount: 3,
  },
  {
    id: '2',
    name: 'Office Gallery Wall',
    roomType: 'Office',
    roomStyle: 'Modern',
    thumbnailUrl: '/api/placeholder/400/300',
    updatedAt: '2024-01-12',
    placementCount: 5,
  },
];

export default function DashboardPage() {
  const [projects] = useState<ProjectCard[]>(SAMPLE_PROJECTS);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Frame className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ArtVision</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/try-on" className="text-sm text-muted-foreground hover:text-foreground">
              Try On
            </Link>
            <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
              Marketplace
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your wall art designs and room visualizations
            </p>
          </div>
          <Link href="/try-on">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/try-on">
            <div className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <Palette className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Virtual Try-On</h3>
              <p className="text-sm text-muted-foreground">Upload a room and preview art</p>
            </div>
          </Link>
          <Link href="/generate">
            <div className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <Frame className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Generate AI Art</h3>
              <p className="text-sm text-muted-foreground">Create custom artwork with AI</p>
            </div>
          </Link>
          <Link href="/marketplace">
            <div className="p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <ArrowRight className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Browse Marketplace</h3>
              <p className="text-sm text-muted-foreground">Shop curated wall art</p>
            </div>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/try-on?project=${project.id}`}>
                <div className="rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
                        {project.roomType}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
                        {project.roomStyle}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{project.name}</h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.updatedAt}
                      </span>
                      <span>{project.placementCount} artworks</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* New Project Card */}
          <Link href="/try-on">
            <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center min-h-[250px] cursor-pointer transition-colors">
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Create New Project</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
