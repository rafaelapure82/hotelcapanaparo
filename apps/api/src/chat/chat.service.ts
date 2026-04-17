import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessagesByBooking(bookingId: number) {
    return this.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async createMessage(data: {
    content: string;
    senderId: number;
    receiverId: number;
    bookingId?: number;
    attachmentUrl?: string;
  }) {
    return this.prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getConversations(userId: number) {
    // This is a complex query to get unique conversations (grouped by pair of users)
    // For simplicity in this SQL/Prisma setup, we'll get last messages for each unique sender/receiver combination
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, avatarUrl: true } }
      }
    });

    const conversations = new Map();
    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          otherUser,
          lastMessage: msg,
          unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        conversations.get(otherUser.id).unreadCount++;
      }
    });

    return Array.from(conversations.values());
  }

  async markAsRead(userId: number, fromUserId: number) {
    return this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: fromUserId,
        isRead: false
      },
      data: { isRead: true }
    });
  }
}
