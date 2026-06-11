import { prisma } from '../config/prisma.js';

export const sendNotification = async (req, userId, message) => {
  try {
    // Save to database
    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        message,
        is_read: false,
      },
    });

    // Emit via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
