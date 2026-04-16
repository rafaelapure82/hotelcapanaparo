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

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user-${userId}`);
      console.log(`Client connected: ${client.id} as User: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { senderId: number; receiverId: number; content: string; bookingId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Save message to DB
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        bookingId: data.bookingId,
      },
      include: {
        sender: { select: { firstName: true, avatar: true } },
      }
    });

    // 2. Emit to receiver
    this.server.to(`user-${data.receiverId}`).emit('new_message', message);
    
    // 3. Emit back to sender (for multi-device sync or just confirmation)
    this.server.to(`user-${data.senderId}`).emit('new_message', message);

    return message;
  }
}
