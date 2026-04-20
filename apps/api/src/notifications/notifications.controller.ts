import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req) {
    // Basic userId extraction from JWT req.user
    const userId = req.user?.userId || 1; // Default to 1 if not guarded for now
    return this.notificationsService.findAll(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user?.userId || 1;
    return { count: await this.notificationsService.getUnreadCount(userId) };
  }

  @Post(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user?.userId || 1;
    return this.notificationsService.markAllAsRead(userId);
  }
}
