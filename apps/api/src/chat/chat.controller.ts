import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory(@Query('bookingId') bookingId: string) {
    return this.chatService.getMessagesByBooking(parseInt(bookingId));
  }

  @Get('history/:user1Id/:user2Id')
  async getUserHistory(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ) {
    return this.chatService.getMessagesBetweenUsers(
      parseInt(user1Id),
      parseInt(user2Id),
    );
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(parseInt(userId));
  }

  @Post('read')
  async markRead(@Body() data: { userId: number; fromUserId: number }) {
    return this.chatService.markAsRead(data.userId, data.fromUserId);
  }

  @Post('send')
  async sendMessage(@Body() data: {
    content: string;
    senderId: number;
    receiverId: number;
    bookingId?: number;
    attachmentUrl?: string;
  }) {
    return this.chatService.createMessage(data);
  }
}
