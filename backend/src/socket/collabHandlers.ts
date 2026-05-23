import { Server, Socket } from 'socket.io';

interface CursorData {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

interface PlacementUpdate {
  roomId: string;
  placementId: string;
  userId: string;
  updates: Record<string, unknown>;
}

interface CommentData {
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
}

// Track active rooms and participants
const activeRooms = new Map<string, Set<string>>();
const userColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

function getRandomColor(): string {
  return userColors[Math.floor(Math.random() * userColors.length)];
}

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join collaboration room
    socket.on('collab:join', (data: { roomId: string; userId: string; userName: string }) => {
      const { roomId, userId, userName } = data;

      socket.join(roomId);

      // Track participant
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }
      activeRooms.get(roomId)!.add(userId);

      // Notify others in the room
      socket.to(roomId).emit('collab:user-joined', {
        userId,
        userName,
        color: getRandomColor(),
      });

      // Send current participants to the new user
      const participants = Array.from(activeRooms.get(roomId) || []);
      socket.emit('collab:participants', { roomId, participants });

      console.log(`User ${userName} joined room ${roomId}`);
    });

    // Leave collaboration room
    socket.on('collab:leave', (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);

      // Notify others
      socket.to(roomId).emit('collab:user-left', { socketId: socket.id });
    });

    // Cursor movement
    socket.on('collab:cursor', (data: CursorData & { roomId: string }) => {
      const { roomId, ...cursorData } = data;
      socket.to(roomId).emit('collab:cursor-update', {
        ...cursorData,
        socketId: socket.id,
      });
    });

    // Placement updates (art moved, resized, etc.)
    socket.on('collab:placement-update', (data: PlacementUpdate) => {
      const { roomId, ...updateData } = data;
      socket.to(roomId).emit('collab:placement-changed', updateData);
    });

    // Comments
    socket.on('collab:comment', (data: CommentData) => {
      const { roomId, ...commentData } = data;
      const comment = {
        ...commentData,
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Broadcast to all in room including sender
      io.to(roomId).emit('collab:new-comment', comment);
    });

    // Reactions
    socket.on('collab:reaction', (data: { roomId: string; placementId: string; emoji: string; userId: string }) => {
      const { roomId, ...reactionData } = data;
      socket.to(roomId).emit('collab:new-reaction', reactionData);
    });

    // Snapshot saved
    socket.on('collab:snapshot', (data: { roomId: string; snapshotId: string; userId: string }) => {
      const { roomId, ...snapshotData } = data;
      socket.to(roomId).emit('collab:snapshot-saved', snapshotData);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove from all rooms
      activeRooms.forEach((participants, roomId) => {
        socket.to(roomId).emit('collab:user-left', { socketId: socket.id });
      });
    });
  });
}
