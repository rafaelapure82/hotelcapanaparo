import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { AiService } from '../ai/ai.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      const room = `user-${String(userId)}`;
      client.join(room);
      console.log(`🔌 Client connected: ${client.id} joined room ${room}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { senderId: number; receiverId: number; content: string; bookingId?: number; attachmentUrl?: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`💬 Message received from ${data.senderId} to ${data.receiverId}: "${data.content}"`);
    
    // 1. Save message to DB if users exist (positive IDs)
    let message: any;
    const canSave = data.senderId > 0 && data.receiverId > 0;

    if (canSave) {
      try {
        message = await this.prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId,
            bookingId: data.bookingId,
            attachmentUrl: data.attachmentUrl,
          },
          include: {
            sender: { select: { id: true, firstName: true, avatar: true, avatarUrl: true } },
          }
        });
      } catch (err) {
        console.error('Failed to save message to DB:', err);
      }
    }

    // 2. If not saved (guest), create a mock object for real-time delivery
    if (!message) {
      message = {
        id: Date.now(), // Temporary ID
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        createdAt: new Date().toISOString(),
        sender: { 
          id: data.senderId, 
          firstName: data.senderId === 2 ? 'CapaBot' : 'Invitado', 
          avatarUrl: null 
        }
      };
    }

    // 3. Emit to receiver and sender
    const receiverRoom = `user-${String(data.receiverId)}`;
    const senderRoom = `user-${String(data.senderId)}`;
    
    this.server.to(receiverRoom).emit('new_message', message);
    this.server.to(senderRoom).emit('new_message', message);

    // 4. Handle AI Response if receiver is CapaBot (ID 2)
    if (data.receiverId === 2) {
      await this.handleAIResponse(data);
    }

    return message;
  }

  private async handleAIResponse(data: { senderId: number; content: string; bookingId?: number }) {
    console.log(`🤖 Starting handleAIResponse for user ${data.senderId}`);
    const userRoom = `user-${String(data.senderId)}`;
    
    // 1. Simulate typing
    this.server.to(userRoom).emit('user_typing', { userId: 2, isTyping: true });
    
    // 2. Wait for natural delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Get AI content
    const response = await this.ai.processMessage(data.content, data.senderId, data.bookingId);
    console.log(`🤖 AI generated response: "${response.substring(0, 30)}..."`);

    // 4. Save AI response to DB if guest is registered
    let aiMessage: any;
    if (data.senderId > 0) {
      try {
        aiMessage = await this.prisma.message.create({
          data: {
            content: response,
            senderId: 2, // CapaBot
            receiverId: data.senderId,
            bookingId: data.bookingId,
          },
          include: {
            sender: { select: { id: true, firstName: true, avatar: true, avatarUrl: true } },
          }
        });
      } catch (err) {
        console.error('Failed to save AI response to DB:', err);
      }
    }

    // 5. If not saved (guest), create mock AI message
    if (!aiMessage) {
      aiMessage = {
        id: Date.now() + 1,
        content: response,
        senderId: 2,
        receiverId: data.senderId,
        createdAt: new Date().toISOString(),
        sender: { id: 2, firstName: 'CapaBot', avatarUrl: null }
      };
    }

    // 6. Emit response
    this.server.to(userRoom).emit('new_message', aiMessage);
    this.server.to(userRoom).emit('user_typing', { userId: 2, isTyping: false });
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { senderId: number; receiverId: number; isTyping: boolean }) {
    this.server.to(`user-${data.receiverId}`).emit('user_typing', {
      userId: data.senderId,
      isTyping: data.isTyping
    });
  }
}
