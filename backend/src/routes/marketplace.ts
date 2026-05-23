import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const marketplaceRouter = Router();

// Browse marketplace artworks
marketplaceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '24',
      style,
      priceMin,
      priceMax,
      source,
      sort = 'popular',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      price: { not: null },
      sourceUrl: { not: null },
    };

    if (style) {
      where.style = { has: style as string };
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) (where.price as Record<string, number>).gte = parseFloat(priceMin as string);
      if (priceMax) (where.price as Record<string, number>).lte = parseFloat(priceMax as string);
    }

    if (source) {
      where.sourceType = source as string;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price_low') orderBy = { price: 'asc' };
    if (sort === 'price_high') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
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
    console.error('Marketplace fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace' });
  }
});

// Get marketplace categories
marketplaceRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'abstract', name: 'Abstract', count: 0 },
      { id: 'photography', name: 'Photography', count: 0 },
      { id: 'landscape', name: 'Landscape', count: 0 },
      { id: 'botanical', name: 'Botanical', count: 0 },
      { id: 'minimalist', name: 'Minimalist', count: 0 },
      { id: 'geometric', name: 'Geometric', count: 0 },
      { id: 'portrait', name: 'Portrait', count: 0 },
      { id: 'modern', name: 'Modern', count: 0 },
      { id: 'vintage', name: 'Vintage', count: 0 },
      { id: 'pop_art', name: 'Pop Art', count: 0 },
    ];

    // Get counts for each category
    for (const category of categories) {
      category.count = await prisma.artwork.count({
        where: { style: { has: category.id } },
      });
    }

    res.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get featured collections
marketplaceRouter.get('/featured', async (_req: Request, res: Response) => {
  try {
    const collections = [
      {
        id: 'trending',
        name: 'Trending Now',
        description: 'Most popular artworks this week',
        artworks: await prisma.artwork.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
      },
      {
        id: 'under-50',
        name: 'Under $50',
        description: 'Affordable art for every space',
        artworks: await prisma.artwork.findMany({
          where: { price: { lte: 50, not: null } },
          take: 8,
        }),
      },
      {
        id: 'new-artists',
        name: 'New Artists',
        description: 'Discover emerging talent',
        artworks: await prisma.artwork.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
      },
    ];

    res.json(collections);
  } catch (error) {
    console.error('Failed to fetch featured:', error);
    res.status(500).json({ message: 'Failed to fetch featured collections' });
  }
});
