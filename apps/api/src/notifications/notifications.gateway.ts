import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`notification-user-${userId}`);
      console.log(`🔌 Client connected to Notifications: ${client.id} joined room notification-user-${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from Notifications: ${client.id}`);
  }

  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`notification-user-${userId}`).emit(event, data);
  }

  broadcastToAdmins(event: string, data: any) {
    // In a real app, you'd filter by role. 
    // Here we'll broadcast to a special room or just emit to all if simple.
    this.server.emit(event, data);
  }
}
