import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory(@Query('bookingId') bookingId: string) {
    return this.chatService.getMessagesByBooking(parseInt(bookingId));
  }

  @Post('send')
  async sendMessage(@Body() data: {
    content: string;
    senderId: number;
    receiverId: number;
    bookingId?: number;
  }) {
    return this.chatService.createMessage(data);
  }
}
