import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomesService } from '../homes/homes.service';
import { Booking, Prisma } from '@prisma/client';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private homesService: HomesService,
    private invoicesService: InvoicesService,
    private mailService: MailService,
  ) {}

  async create(data: {
    serviceId: number;
    startDate: Date;
    endDate: Date;
    buyerId: number;
    numberOfGuests: number;
    paymentProofUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
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
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const total = (home.basePrice || 0) * nights;

    return this.prisma.booking.create({
      data: {
        serviceId: data.serviceId,
        serviceType: 'home',
        startDate: data.startDate,
        endDate: data.endDate,
        total: total,
        status: data.paymentProofUrl ? 'processing' : 'pending',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        buyerId: data.buyerId,
        ownerId: home.authorId,
        currency: 'USD',
        paymentType: 'transfer',
        paymentProofUrl: data.paymentProofUrl,
        numberOfGuests: data.numberOfGuests || 1,
      },
    });
  }


  async findAll(where: Prisma.BookingWhereInput): Promise<Booking[]> {
    return this.prisma.booking.findMany({ where, include: { home: true } });
  }

  async updateStatus(id: number, status: string): Promise<Booking> {
    if (status === 'confirmed') {
      const booking = await this.prisma.booking.findUnique({ where: { id } });
      if (!booking) throw new BadRequestException('Booking not found');
      
      const isAvailable = await this.homesService.checkAvailability(
        booking.serviceId,
        booking.startDate,
        booking.endDate,
        booking.id // Exclude self
      );

      if (!isAvailable) {
        throw new BadRequestException('Property is no longer available for these dates');
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { home: true }
    });

    // Automation: Generate Invoice and Send Email
    if (status === 'confirmed') {
      try {
        const invoice = await this.invoicesService.createFromBooking(id);
        const pdfBuffer = await this.invoicesService.generatePDFBuffer(updatedBooking, invoice);
        await this.mailService.sendInvoiceEmail(
          updatedBooking.email, 
          updatedBooking.firstName, 
          invoice.number, 
          pdfBuffer
        );
      } catch (err) {
        console.error('Automation Failed:', err);
        // We don't throw here to avoid rollback of the status update, 
        // but we log it for admin review.
      }
    }

    return updatedBooking;
  }
}
