import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const projectsRouter = Router();

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  roomImageUrl: z.string().url(),
  roomType: z.string().optional(),
  roomStyle: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  roomType: z.string().optional(),
  roomStyle: z.string().optional(),
  wallMaskUrl: z.string().optional(),
  depthMapUrl: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// List user's projects
projectsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        placements: {
          include: { artwork: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Failed to list projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get single project
projectsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId },
          { isPublic: true },
        ],
      },
      include: {
        placements: {
          include: { artwork: true },
        },
        snapshots: true,
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Failed to get project:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// Create project
projectsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...data,
        userId: req.userId!,
        roomType: data.roomType || 'unknown',
        roomStyle: data.roomStyle || 'unknown',
        wallMaskUrl: '',
        depthMapUrl: '',
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.errors });
      return;
    }
    console.error('Failed to create project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update project
projectsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
projectsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Delete related placements first
    await prisma.placement.deleteMany({ where: { projectId: req.params.id } });
    await prisma.snapshot.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Add placement to project
projectsRouter.post('/:id/placements', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const placement = await prisma.placement.create({
      data: {
        projectId: req.params.id,
        artworkId: req.body.artworkId,
        frameStyle: req.body.frameStyle || 'minimalist_black',
        frameColor: req.body.frameColor || '#000000',
        matColor: req.body.matColor || null,
        matWidth: req.body.matWidth || null,
        glassFinish: req.body.glassFinish || 'none',
        positionX: req.body.positionX || 0,
        positionY: req.body.positionY || 0,
        width: req.body.width || 60,
        height: req.body.height || 90,
        rotation: req.body.rotation || 0,
        lightingMode: req.body.lightingMode || 'natural',
      },
      include: { artwork: true },
    });

    res.status(201).json(placement);
  } catch (error) {
    console.error('Failed to add placement:', error);
    res.status(500).json({ message: 'Failed to add placement' });
  }
});
