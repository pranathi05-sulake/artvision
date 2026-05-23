import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Collaboration events
export interface CollabCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

export interface CollabPlacementUpdate {
  placementId: string;
  userId: string;
  updates: Record<string, unknown>;
}

export interface CollabComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
  timestamp: number;
}

export function joinCollabRoom(roomId: string, userId: string, userName: string): void {
  const s = getSocket();
  s.emit('collab:join', { roomId, userId, userName });
}

export function leaveCollabRoom(roomId: string): void {
  const s = getSocket();
  s.emit('collab:leave', { roomId });
}

export function sendCursorUpdate(roomId: string, cursor: Omit<CollabCursor, 'userId' | 'userName'>): void {
  const s = getSocket();
  s.emit('collab:cursor', { roomId, ...cursor });
}

export function sendPlacementUpdate(roomId: string, update: CollabPlacementUpdate): void {
  const s = getSocket();
  s.emit('collab:placement-update', { roomId, ...update });
}

export function sendComment(roomId: string, comment: Omit<CollabComment, 'id' | 'timestamp'>): void {
  const s = getSocket();
  s.emit('collab:comment', { roomId, ...comment });
}
