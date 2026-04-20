import { Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('ical/:id')
  async getICalFeed(@Param('id', ParseIntPipe) id: number) {
    return this.syncService.generateICalFeed(id);
  }

  @Post(':id/trigger')
  async triggerSync(@Param('id', ParseIntPipe) id: number) {
    await this.syncService.syncHomeCalendar(id);
    return { success: true };
  }
}
