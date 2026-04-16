import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: any, @Request() req: any) {
    return this.bookingsService.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      buyerId: req.user.userId,
    });
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  async findMyBookings(@Request() req: any) {
    return this.bookingsService.findAll({ buyerId: req.user.userId });
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard)
  async manageBookings(@Request() req: any) {
    return this.bookingsService.findAll({ ownerId: req.user.userId });
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingsService.updateStatus(+id, status);
  }
}
