import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const collabRouter = Router();

// Create a collaboration room
collabRouter.post('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const room = await prisma.collabRoom.create({
      data: {
        projectId,
        participants: [
          {
            userId: req.userId,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
        history: [],
        snapshots: [],
      },
    });

    // Update project with collab room ID
    await prisma.project.update({
      where: { id: projectId },
      data: { collabRoomId: room.id },
    });

    res.status(201).json({
      roomId: room.id,
      shareUrl: `/try-on/collab/${room.id}`,
    });
  } catch (error) {
    console.error('Failed to create collab room:', error);
    res.status(500).json({ message: 'Failed to create collaboration room' });
  }
});

// Get collaboration room details
collabRouter.get('/rooms/:roomId', async (req: AuthRequest, res: Response) => {
  try {
    const room = await prisma.collabRoom.findUnique({
      where: { id: req.params.roomId },
    });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: room.projectId },
      include: {
        placements: { include: { artwork: true } },
      },
    });

    res.json({
      room,
      project,
    });
  } catch (error) {
    console.error('Failed to get collab room:', error);
    res.status(500).json({ message: 'Failed to get room details' });
  }
});

// Join a collaboration room
collabRouter.post('/rooms/:roomId/join', async (req: AuthRequest, res: Response) => {
  try {
    const room = await prisma.collabRoom.findUnique({
      where: { id: req.params.roomId },
    });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const participants = room.participants as Array<{ userId: string; role: string }>;
    const isAlreadyParticipant = participants.some((p) => p.userId === req.userId);

    if (!isAlreadyParticipant) {
      participants.push({
        userId: req.userId!,
        role: 'collaborator',
      });

      await prisma.collabRoom.update({
        where: { id: req.params.roomId },
        data: { participants },
      });
    }

    res.json({ message: 'Joined room', roomId: room.id });
  } catch (error) {
    console.error('Failed to join room:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
});
