import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestService {
  constructor(private prisma: PrismaService) {}

  async upsertGuest(data: {
    email: string;
    documentId: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // Upsert by documentId (Cédula/DNI/Pasaporte) as requested by the user
    return this.prisma.guest.upsert({
      where: { documentId: data.documentId },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      create: {
        email: data.email,
        documentId: data.documentId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });
  }

  async getGuestStats(guestId: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { bookings: { where: { status: 'completed' } } },
    });

    if (!guest) return null;

    const totalStays = guest.bookings.length;
    const totalSpent = guest.bookings.reduce((acc, b) => acc + b.total, 0);

    // Dynamic loyalty calculation
    let status = 'Regular';
    if (totalSpent > 2000 || totalStays > 10) status = 'Platinum';
    else if (totalSpent > 1000 || totalStays > 5) status = 'Gold';
    else if (totalSpent > 500 || totalStays > 2) status = 'Silver';

    return {
      totalStays,
      totalSpent,
      status,
    };
  }

  async updateGuestLoyalty(guestId: number) {
    const stats = await this.getGuestStats(guestId);
    if (!stats) return;

    return this.prisma.guest.update({
      where: { id: guestId },
      data: {
        totalStays: stats.totalStays,
        totalSpentPayed: stats.totalSpent,
        loyaltyStatus: stats.status,
      },
    });
  }

  async findAll() {
    return this.prisma.guest.findMany({
      orderBy: { totalSpentPayed: 'desc' },
    });
  }
}
