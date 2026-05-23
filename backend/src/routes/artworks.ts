import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const artworksRouter = Router();

// List artworks with filtering
artworksRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { style, color, priceMin, priceMax, source, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (style) {
      where.style = { has: style as string };
    }

    if (source) {
      where.sourceType = source as string;
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) (where.price as Record<string, number>).gte = parseFloat(priceMin as string);
      if (priceMax) (where.price as Record<string, number>).lte = parseFloat(priceMax as string);
    }

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.artwork.count({ where }),
    ]);

    res.json({
      artworks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Failed to list artworks:', error);
    res.status(500).json({ message: 'Failed to fetch artworks' });
  }
});

// Get single artwork
artworksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
    });

    if (!artwork) {
      res.status(404).json({ message: 'Artwork not found' });
      return;
    }

    res.json(artwork);
  } catch (error) {
    console.error('Failed to get artwork:', error);
    res.status(500).json({ message: 'Failed to fetch artwork' });
  }
});

// Search artworks
artworksRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ message: 'Search query required' });
      return;
    }

    const artworks = await prisma.artwork.findMany({
      where: {
        OR: [
          { title: { contains: q as string, mode: 'insensitive' } },
          { artistName: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    res.json(artworks);
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get similar artworks (CLIP-based)
artworksRouter.get('/:id/similar', async (req: Request, res: Response) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
    });

    if (!artwork) {
      res.status(404).json({ message: 'Artwork not found' });
      return;
    }

    // In production, this would use FAISS vector search with CLIP embeddings
    // For now, return artworks with similar styles
    const similar = await prisma.artwork.findMany({
      where: {
        id: { not: artwork.id },
        style: { hasSome: artwork.style },
      },
      take: 10,
    });

    res.json(similar);
  } catch (error) {
    console.error('Failed to find similar artworks:', error);
    res.status(500).json({ message: 'Failed to find similar artworks' });
  }
});
