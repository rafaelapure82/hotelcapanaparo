import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomesService } from '../homes/homes.service';
import { Booking, Prisma } from '@prisma/client';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../common/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { GuestService } from '../crm/guest.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private homesService: HomesService,
    private invoicesService: InvoicesService,
    private mailService: MailService,
    private audit: AuditService,
    private inventoryService: InventoryService,
    private guestService: GuestService,
  ) {}

  async create(data: {
    serviceId: number;
    startDate: Date;
    endDate: Date;
    buyerId: number;
    numberOfGuests?: number;
    paymentProofUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentId?: string;
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

    // 1. CRM: Upsert Guest profile
    let guestId: number | undefined = undefined;
    if (data.email && data.documentId) {
      const guest = await this.guestService.upsertGuest({
        email: data.email,
        documentId: data.documentId,
        firstName: data.firstName || 'Invitado',
        lastName: data.lastName || '',
        phone: data.phone,
      });
      guestId = guest.id;
    }

    // Calculate nights
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const total = (home.basePrice || 0) * nights;

    const booking = await this.prisma.booking.create({
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
        documentId: data.documentId,
        buyerId: data.buyerId,
        guestId: guestId,
        ownerId: home.authorId,
        currency: 'USD',
        paymentType: 'transfer',
        paymentProofUrl: data.paymentProofUrl,
        numberOfGuests: data.numberOfGuests || 1,
      },
    });

    await this.audit.log({
      userId: data.buyerId,
      action: 'CREATE_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      newData: { status: booking.status, total: booking.total },
    });

    return booking;
  }


  async findAll(where: Prisma.BookingWhereInput): Promise<Booking[]> {
    return this.prisma.booking.findMany({ where, include: { home: true } });
  }

  async updateStatus(id: number, status: string, userId?: number): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new BadRequestException('Booking not found');
    
    if (status === 'confirmed') {
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

    // ===================== AUTOMATIONS =====================

    // 1. Audit Log
    if (userId) {
      await this.audit.log({
        userId: userId,
        action: 'UPDATE_BOOKING_STATUS',
        entity: 'Booking',
        entityId: id,
        prevData: { status: booking.status },
        newData: { status: status },
      });
    }

    // 2. Inventory Consumption (Auto)
    if (status === 'confirmed') {
      try {
        await this.inventoryService.confirmBookingConsumption(id, userId || booking.ownerId);
      } catch (err) {
        console.error('Inventory consumption failed:', err);
      }
    }

    // 3. CRM: Update Guest Statistics
    if (status === 'confirmed' || status === 'completed') {
      if (updatedBooking.guestId) {
        try {
          await this.guestService.updateGuestLoyalty(updatedBooking.guestId);
        } catch (err) {
          console.error('Guest loyalty update failed:', err);
        }
      }
    }

    // ===================== EMAIL AUTOMATIONS =====================

    if (status === 'confirmed') {
      try {
        // 1. Generate Invoice + Send Invoice Email
        const invoice = await this.invoicesService.createFromBooking(id);
        const pdfBuffer = await this.invoicesService.generatePDFBuffer(updatedBooking, invoice);
        await this.mailService.sendInvoiceEmail(
          updatedBooking.email, 
          updatedBooking.firstName, 
          invoice.number, 
          pdfBuffer
        );

        // 2. Send Booking Confirmation Email
        const nights = Math.ceil(
          Math.abs(updatedBooking.endDate.getTime() - updatedBooking.startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) || 1;

        await this.mailService.sendBookingConfirmation(updatedBooking.email, {
          guestName: `${updatedBooking.firstName} ${updatedBooking.lastName}`,
          propertyTitle: (updatedBooking as any).home?.title || 'Suite',
          checkIn: updatedBooking.startDate.toLocaleDateString('es-ES'),
          checkOut: updatedBooking.endDate.toLocaleDateString('es-ES'),
          nights,
          total: updatedBooking.total,
          bookingId: updatedBooking.id,
        });

        // 3. Schedule review request email (fires after checkout date)
        const msUntilCheckout = updatedBooking.endDate.getTime() - Date.now() + (24 * 60 * 60 * 1000); // 1 day after checkout
        if (msUntilCheckout > 0 && msUntilCheckout < 90 * 24 * 60 * 60 * 1000) { // Max 90 days
          setTimeout(async () => {
            try {
              await this.mailService.sendReviewRequest(updatedBooking.email, {
                guestName: updatedBooking.firstName,
                propertyTitle: (updatedBooking as any).home?.title || 'Suite',
                homeId: updatedBooking.serviceId,
              });
            } catch (e) {
              console.error('Review request email failed:', e);
            }
          }, msUntilCheckout);
        }
      } catch (err) {
        console.error('Email Automation Failed:', err);
      }
    }

    // Cancellation email
    if (status === 'cancelled') {
      try {
        await this.mailService.sendCancellationEmail(booking.email, {
          guestName: booking.firstName,
          propertyTitle: (updatedBooking as any).home?.title || 'Suite',
          bookingId: booking.id,
        });
      } catch (err) {
        console.error('Cancellation email failed:', err);
      }
    }

    return updatedBooking;
  }
}
