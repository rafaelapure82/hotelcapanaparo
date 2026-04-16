import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Home, Prisma } from '@prisma/client';

@Injectable()
export class HomesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.HomeWhereUniqueInput;
    where?: Prisma.HomeWhereInput;
    orderBy?: Prisma.HomeOrderByWithRelationInput;
  }): Promise<Home[]> {
    return this.prisma.home.findMany(params);
  }

  async findOne(id: number): Promise<Home | null> {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!home) throw new NotFoundException('Home not found');
    return home;
  }

  async create(data: Prisma.HomeCreateInput): Promise<Home> {
    return this.prisma.home.create({ data });
  }

  async update(id: number, data: Prisma.HomeUpdateInput): Promise<Home> {
    return this.prisma.home.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Home> {
    return this.prisma.home.delete({ where: { id } });
  }

  async checkAvailability(homeId: number, startDate: Date, endDate: Date, excludeBookingId?: number): Promise<boolean> {
    const overlappingBookings = await this.prisma.booking.count({
      where: {
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        serviceId: homeId,
        serviceType: 'home',
        status: { notIn: ['cancelled', 'rejected'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    return overlappingBookings === 0;
  }

  async getCalendarData() {
    return this.prisma.home.findMany({
      where: { status: 'publish' },
      include: {
        bookings: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            total: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
