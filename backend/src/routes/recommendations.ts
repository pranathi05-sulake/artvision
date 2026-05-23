import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { mlService } from '../services/mlService';

export const recommendationsRouter = Router();

// Get recommendations for a project
recommendationsRouter.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.userId,
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Call ML service for style matching
    try {
      const recommendations = await mlService.getStyleMatch(project.roomImageUrl);
      res.json(recommendations);
    } catch (mlError) {
      console.error('ML service unavailable, returning fallback recommendations:', mlError);

      // Fallback: return artworks matching room style
      const artworks = await prisma.artwork.findMany({
        where: {
          style: { hasSome: [project.roomStyle] },
        },
        take: 20,
      });

      const fallbackRecommendations = artworks.map((artwork) => ({
        artwork,
        score: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
        colorMatch: Math.random() * 0.3 + 0.7,
        styleMatch: Math.random() * 0.3 + 0.7,
      }));

      res.json(fallbackRecommendations);
    }
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// Get recommendations by room type
recommendationsRouter.get('/room-type/:type', async (_req: AuthRequest, res: Response) => {
  try {
    const roomType = _req.params.type;

    const stylesByRoomType: Record<string, string[]> = {
      residential: ['abstract', 'photography', 'landscape', 'botanical'],
      office: ['abstract', 'geometric', 'minimalist', 'cityscape'],
      hotel: ['landscape', 'abstract', 'photography', 'luxury'],
      restaurant: ['food', 'vintage', 'local', 'thematic'],
      hospital: ['nature', 'abstract', 'calming', 'botanical'],
      school: ['educational', 'inspirational', 'world_art', 'colorful'],
      retail: ['brand', 'lifestyle', 'aspirational', 'modern'],
    };

    const styles = stylesByRoomType[roomType] || ['abstract', 'modern'];

    const artworks = await prisma.artwork.findMany({
      where: {
        style: { hasSome: styles },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    res.json(artworks);
  } catch (error) {
    console.error('Failed to get room type recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});
