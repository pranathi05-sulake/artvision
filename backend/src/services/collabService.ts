import { prisma } from '../lib/prisma';

interface Participant {
  userId: string;
  role: 'owner' | 'collaborator' | 'viewer';
  joinedAt: string;
}

interface OperationLog {
  type: string;
  userId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

class CollabService {
  /**
   * Create a new collaboration room for a project.
   */
  async createRoom(projectId: string, ownerId: string): Promise<string> {
    const room = await prisma.collabRoom.create({
      data: {
        projectId,
        participants: [
          {
            userId: ownerId,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
        history: [],
        snapshots: [],
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { collabRoomId: room.id },
    });

    return room.id;
  }

  /**
   * Add a participant to a collaboration room.
   */
  async addParticipant(
    roomId: string,
    userId: string,
    role: 'collaborator' | 'viewer' = 'collaborator'
  ): Promise<void> {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');

    const participants = room.participants as Participant[];
    const existing = participants.find((p) => p.userId === userId);

    if (!existing) {
      participants.push({
        userId,
        role,
        joinedAt: new Date().toISOString(),
      });

      await prisma.collabRoom.update({
        where: { id: roomId },
        data: { participants },
      });
    }
  }

  /**
   * Remove a participant from a collaboration room.
   */
  async removeParticipant(roomId: string, userId: string): Promise<void> {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');

    const participants = (room.participants as Participant[]).filter(
      (p) => p.userId !== userId
    );

    await prisma.collabRoom.update({
      where: { id: roomId },
      data: { participants },
    });
  }

  /**
   * Log an operation to the room history for conflict resolution.
   */
  async logOperation(roomId: string, operation: OperationLog): Promise<void> {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) return;

    const history = [...(room.history as OperationLog[]), operation];

    // Keep only last 1000 operations
    const trimmedHistory = history.slice(-1000);

    await prisma.collabRoom.update({
      where: { id: roomId },
      data: { history: trimmedHistory },
    });
  }

  /**
   * Save a snapshot of the current canvas state.
   */
  async saveSnapshot(roomId: string, snapshotData: Record<string, unknown>): Promise<void> {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) return;

    const snapshots = [
      ...(room.snapshots as Record<string, unknown>[]),
      {
        ...snapshotData,
        timestamp: Date.now(),
      },
    ];

    await prisma.collabRoom.update({
      where: { id: roomId },
      data: { snapshots },
    });
  }

  /**
   * Get room details with project data.
   */
  async getRoomWithProject(roomId: string) {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) return null;

    const project = await prisma.project.findUnique({
      where: { id: room.projectId },
      include: {
        placements: { include: { artwork: true } },
      },
    });

    return { room, project };
  }

  /**
   * Check if a user has permission to edit in a room.
   */
  async canEdit(roomId: string, userId: string): Promise<boolean> {
    const room = await prisma.collabRoom.findUnique({ where: { id: roomId } });
    if (!room) return false;

    const participants = room.participants as Participant[];
    const participant = participants.find((p) => p.userId === userId);

    return participant?.role === 'owner' || participant?.role === 'collaborator';
  }
}

export const collabService = new CollabService();
