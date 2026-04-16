import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [totalEarnings, activeBookings, totalProperties] = await Promise.all([
      this.prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: 'confirmed' },
      }),
      this.prisma.booking.count({
        where: { status: 'confirmed' },
      }),
      this.prisma.home.count({
        where: { status: 'publish' },
      }),
    ]);

    const occupancyRate = totalProperties > 0 ? (activeBookings / totalProperties) * 100 : 0;

    return {
      totalEarnings: totalEarnings._sum.total || 0,
      activeBookings,
      totalProperties,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }

  async getGuestStats(userId: number) {
    const [myBookings, lastStay] = await Promise.all([
      this.prisma.booking.count({
        where: { buyerId: userId },
      }),
      this.prisma.booking.findFirst({
        where: { buyerId: userId },
        orderBy: { startDate: 'desc' },
        include: { home: true },
      }),
    ]);

    return {
      myBookings,
      lastStay,
    };
  }
}
