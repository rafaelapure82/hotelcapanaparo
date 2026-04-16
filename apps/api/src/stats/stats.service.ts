import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalEarnings, 
      newBookingsCount,
      checkInsToday,
      checkOutsToday,
      totalProperties,
      revenueEvolution,
      platformStats
    ] = await Promise.all([
      // 1. Total Earnings
      this.prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      }),
      // 2. New Bookings (Last 30 days)
      this.prisma.booking.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // 3. Check-ins Today
      this.prisma.booking.count({
        where: { 
          startDate: { gte: startOfToday, lte: endOfToday },
          status: { in: ['confirmed', 'paid'] }
        },
      }),
      // 4. Check-outs Today
      this.prisma.booking.count({
        where: { 
          endDate: { gte: startOfToday, lte: endOfToday },
          status: { in: ['confirmed', 'paid'] }
        },
      }),
      // 5. Total Properties
      this.prisma.home.count({
        where: { status: 'publish' },
      }),
      // 6. Revenue Evolution (Last 6 Months)
      this.prisma.booking.groupBy({
        by: ['createdAt'],
        _sum: { total: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      }),
      // 7. Platform Analysis
      this.prisma.booking.groupBy({
        by: ['platform'],
        _count: { id: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      })
    ]);

    // Format Revenue Evolution for Chart
    // This is a simplified version, ideally we group by Date in DB if DB permits or here
    const evolution = await this.groupRevenueByMonth();
    
    // Format Platform Stats
    const platforms = platformStats.map(p => ({
      name: p.platform || 'Direct',
      value: p._count.id
    }));

    return {
      totalRevenue: totalEarnings._sum.total || 0,
      newBookings: newBookingsCount,
      checkIn: checkInsToday,
      checkOut: checkOutsToday,
      totalProperties,
      revenueChart: evolution,
      platforms
    };
  }

  private async groupRevenueByMonth() {
    // Fetch last 6 months of data
    const months: { name: string; total: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const name = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const res = await this.prisma.booking.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ['confirmed', 'paid'] }
        }
      });

      months.push({ name, total: res._sum.total || 0 });
    }
    return months;
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

  async getMonthlyRevenueReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['confirmed', 'paid'] },
      },
      include: {
        home: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Propiedad,Huesped,Total,Fecha de Reserva,Check-in,Check-out,Estado,Plataforma\n';
    const rows = bookings.map(b => {
      return `${b.id},"${b.home?.title || 'N/A'}","${b.firstName} ${b.lastName}",${b.total},${b.createdAt.toISOString().split('T')[0]},${b.startDate.toISOString().split('T')[0]},${b.endDate.toISOString().split('T')[0]},${b.status},${b.platform || 'Direct'}`;
    }).join('\n');

    return header + rows;
  }
}
