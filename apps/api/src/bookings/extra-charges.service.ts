import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ExtraChargesService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService
  ) {}

  async addExtraCharge(data: {
    bookingId: number;
    recordId?: number; // Link to inventory
    name: string;
    quantity: number;
    amount: number;
    userId: number;
  }) {
    const total = data.quantity * data.amount;

    return this.prisma.$transaction(async (tx) => {
      const charge = await tx.extraCharge.create({
        data: {
          bookingId: data.bookingId,
          recordId: data.recordId,
          name: data.name,
          quantity: data.quantity,
          amount: data.amount,
          total: total,
        },
      });

      // Update Booking Total
      await tx.booking.update({
        where: { id: data.bookingId },
        data: { total: { increment: total } },
      });

      // 3. User Decision: Discount automatically from Inventory
      if (data.recordId) {
        await this.inventory.updateStock(data.recordId, data.userId, {
          adjustment: -data.quantity,
          type: 'OUT',
          reason: `Venta extra en reserva #${data.bookingId}`,
          bookingId: data.bookingId
        });
      }

      return charge;
    });
  }

  async removeExtraCharge(id: number, userId: number) {
    const charge = await this.prisma.extraCharge.findUnique({ where: { id } });
    if (!charge) throw new Error('Charge not found');

    return this.prisma.$transaction(async (tx) => {
      // Revert booking total
      await tx.booking.update({
        where: { id: charge.bookingId },
        data: { total: { decrement: charge.total } },
      });

      // Revert Inventory if applicable
      if (charge.recordId) {
        await this.inventory.updateStock(charge.recordId, userId, {
          adjustment: charge.quantity,
          type: 'IN',
          reason: `Anulación de cargo extra en reserva #${charge.bookingId}`,
          bookingId: charge.bookingId
        });
      }

      return tx.extraCharge.delete({ where: { id } });
    });
  }
}
