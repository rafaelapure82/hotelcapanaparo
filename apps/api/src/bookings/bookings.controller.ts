import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Delete, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ExtraChargesService } from './extra-charges.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingStatusDto, CreateExtraChargeDto } from './dto/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly extraChargesService: ExtraChargesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      buyerId: Number(req.user.userId),
    });
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  async findMyBookings(@Request() req: any) {
    return this.bookingsService.findAll({ buyerId: Number(req.user.userId) });
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard)
  async manageBookings(@Request() req: any) {
    return this.bookingsService.findAll({ ownerId: Number(req.user.userId) });
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string, 
    @Body() body: UpdateBookingStatusDto,
    @Request() req: any,
  ) {
    return this.bookingsService.updateStatus(+id, body.status, req.user.userId);
  }

  @Post(':id/extras')
  @UseGuards(JwtAuthGuard)
  async addExtra(@Param('id', ParseIntPipe) id: number, @Body() data: any, @Request() req) {
    const userId = req.user.userId;
    return this.extraChargesService.addExtraCharge({
      bookingId: id,
      recordId: data.recordId,
      name: data.name,
      quantity: data.quantity,
      amount: data.amount,
      userId
    });
  }

  @Delete('extras/:id')
  @UseGuards(JwtAuthGuard)
  async removeExtra(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.extraChargesService.removeExtraCharge(id, userId);
  }
}
