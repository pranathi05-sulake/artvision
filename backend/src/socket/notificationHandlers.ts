import { Server, Socket } from 'socket.io';

interface Notification {
  id: string;
  type: 'collab_invite' | 'comment' | 'reaction' | 'project_shared';
  title: string;
  message: string;
  userId: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
}

// In-memory notification store (use Redis in production)
const userNotifications = new Map<string, Notification[]>();

export function setupNotificationHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    // Subscribe to user notifications
    socket.on('notifications:subscribe', (data: { userId: string }) => {
      socket.join(`user:${data.userId}`);

      // Send unread notifications
      const notifications = userNotifications.get(data.userId) || [];
      const unread = notifications.filter((n) => !n.read);
      socket.emit('notifications:unread', unread);
    });

    // Mark notification as read
    socket.on('notifications:read', (data: { userId: string; notificationId: string }) => {
      const notifications = userNotifications.get(data.userId) || [];
      const notification = notifications.find((n) => n.id === data.notificationId);
      if (notification) {
        notification.read = true;
      }
    });

    // Mark all as read
    socket.on('notifications:read-all', (data: { userId: string }) => {
      const notifications = userNotifications.get(data.userId) || [];
      notifications.forEach((n) => (n.read = true));
    });
  });
}

/**
 * Send a notification to a specific user.
 */
export function sendNotification(io: Server, userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  const fullNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false,
  };

  // Store notification
  const existing = userNotifications.get(userId) || [];
  existing.push(fullNotification);
  // Keep only last 100 notifications
  if (existing.length > 100) existing.shift();
  userNotifications.set(userId, existing);

  // Send to user's socket room
  io.to(`user:${userId}`).emit('notifications:new', fullNotification);
}
