import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomesService } from '../homes/homes.service';
import { Booking, Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private homesService: HomesService,
  ) {}

  async create(data: {
    serviceId: number;
    startDate: Date;
    endDate: Date;
    buyerId: number;
    numberOfGuest: number;
    // ... other fields
  }): Promise<Booking> {
    const isAvailable = await this.homesService.checkAvailability(
      data.serviceId,
      data.startDate,
      data.endDate,
    );

    if (!isAvailable) {
      throw new BadRequestException('Property is not available for these dates');
    }

    const home = await this.homesService.findOne(data.serviceId);
    if (!home) throw new BadRequestException('Property not found');

    // Calculate nights
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const total = (home.basePrice || 0) * nights;

    return this.prisma.booking.create({
      data: {
        serviceId: data.serviceId,
        serviceType: 'home',
        startDate: data.startDate,
        endDate: data.endDate,
        total: total,
        status: 'pending',
        firstName: '', // These would come from a DTO
        lastName: '',
        email: '',
        phone: '',
        buyerId: data.buyerId,
        ownerId: home.authorId,
        currency: 'USD',
        paymentType: 'none',
      },
    });
  }

  async findAll(where: Prisma.BookingWhereInput): Promise<Booking[]> {
    return this.prisma.booking.findMany({ where, include: { home: true } });
  }

  async updateStatus(id: number, status: string): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}
