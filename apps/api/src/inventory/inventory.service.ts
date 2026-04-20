import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  async findAll() {
    return this.prisma.inventoryRecord.findMany({
      include: { category: true },
      orderBy: { item: 'asc' },
    });
  }

  async create(data: { 
    item: string; 
    quantity: number; 
    unit?: string;
    minStock?: number;
    costPrice?: number;
    categoryId?: number;
    homeId?: number;
    imageUrl?: string;
    supplier?: string;
    userId: number;
  }) {
    // Generate automatic SKU
    const initials = data.item.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const sku = `INV-${initials}-${random}`;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.inventoryRecord.create({
        data: {
          sku,
          item: data.item,
          quantity: data.quantity,
          unit: data.unit || 'und',
          minStock: data.minStock || 5,
          costPrice: data.costPrice || 0,
          imageUrl: data.imageUrl,
          supplier: data.supplier,
          status: this.calculateStatus(data.quantity, data.minStock || 5),
          categoryId: data.categoryId,
          homeId: data.homeId,
        },
      });

      // Initial Transaction
      await tx.inventoryTransaction.create({
        data: {
          recordId: record.id,
          type: 'IN',
          quantity: data.quantity,
          reason: 'Initial Inventory',
          userId: data.userId,
        },
      });

      // Audit Log
      await this.audit.log({
        userId: data.userId,
        action: 'CREATE_INVENTORY',
        entity: 'InventoryRecord',
        entityId: record.id,
        newData: record,
      });

      return record;
    });
  }

  async updateStock(id: number, userId: number, data: { quantity?: number; adjustment?: number; type: string; reason: string; bookingId?: number }) {
    const record = await this.prisma.inventoryRecord.findUnique({ where: { id } });
    if (!record) throw new Error('Record not found');

    const newQuantity = data.quantity !== undefined ? data.quantity : record.quantity + (data.adjustment || 0);
    const diff = newQuantity - record.quantity;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryRecord.update({
        where: { id },
        data: { 
          quantity: newQuantity,
          status: this.calculateStatus(newQuantity, record.minStock),
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          recordId: id,
          type: data.type,
          quantity: Math.abs(diff),
          reason: data.reason,
          userId: userId,
          bookingId: data.bookingId,
        },
      });

      // Audit Log
      await this.audit.log({
        userId: userId,
        action: 'UPDATE_STOCK',
        entity: 'InventoryRecord',
        entityId: id,
        prevData: { quantity: record.quantity },
        newData: { quantity: newQuantity, type: data.type, reason: data.reason },
      });

      return updated;
    });
  }

  async getTransactions(recordId: number) {
    return this.prisma.inventoryTransaction.findMany({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStats() {
    const records = await this.prisma.inventoryRecord.findMany();
    const totalValue = records.reduce((acc, r) => acc + (r.quantity * r.costPrice), 0);
    const lowStock = records.filter(r => r.status !== 'ok').length;

    return {
      totalItems: records.length,
      totalValue,
      lowStockCount: lowStock,
    };
  }

  async getCategories() {
    return this.prisma.inventoryCategory.findMany({
      include: { _count: { select: { records: true } } }
    });
  }

  async createCategory(name: string, icon?: string) {
    return this.prisma.inventoryCategory.create({
      data: { name, icon }
    });
  }

  private calculateStatus(qty: number, min: number) {
    if (qty <= 0) return 'out';
    if (qty <= min) return 'low';
    return 'ok';
  }

  async remove(id: number, userId: number) {
    const record = await this.prisma.inventoryRecord.findUnique({ where: { id } });
    
    await this.audit.log({
      userId: userId,
      action: 'DELETE_INVENTORY',
      entity: 'InventoryRecord',
      entityId: id,
      prevData: record,
    });

    return this.prisma.inventoryRecord.delete({
      where: { id },
    });
  }

  // --- Smart Consumption Logic ---

  async getConsumptionRules(homeId?: number) {
    return this.prisma.inventoryConsumptionRule.findMany({
      where: homeId ? { OR: [{ homeId }, { homeId: null }] } : {},
      include: { record: true }
    });
  }

  async createConsumptionRule(data: {
    recordId: number;
    homeId?: number;
    qtyPerGuest?: number;
    qtyPerNight?: number;
    qtyPerBooking?: number;
  }) {
    return this.prisma.inventoryConsumptionRule.create({
      data: {
        recordId: data.recordId,
        homeId: data.homeId,
        qtyPerGuest: data.qtyPerGuest || 0,
        qtyPerNight: data.qtyPerNight || 0,
        qtyPerBooking: data.qtyPerBooking || 0,
      }
    });
  }

  async calculateBookingConsumption(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { home: true }
    });

    if (!booking) throw new Error('Booking not found');

    const nights = Math.ceil(Math.abs(booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const guests = booking.numberOfGuests;

    const rules = await this.getConsumptionRules(booking.serviceId);

    return rules.map(rule => {
      const estimatedQty = (rule.qtyPerGuest * guests) + (rule.qtyPerNight * nights) + rule.qtyPerBooking;
      return {
        recordId: rule.recordId,
        item: rule.record.item,
        sku: rule.record.sku,
        estimatedQty: Math.ceil(estimatedQty),
        unit: rule.record.unit
      };
    });
  }

  async confirmBookingConsumption(bookingId: number, userId: number) {
    const consumption = await this.calculateBookingConsumption(bookingId);
    
    return this.prisma.$transaction(async (tx) => {
      for (const item of consumption) {
        if (item.estimatedQty > 0) {
          // Update Stock
          const record = await tx.inventoryRecord.findUnique({ where: { id: item.recordId } });
          if (!record) continue;

          await tx.inventoryRecord.update({
            where: { id: item.recordId },
            data: { 
              quantity: { decrement: item.estimatedQty },
              status: this.calculateStatus(record.quantity - item.estimatedQty, record.minStock)
            }
          });

          // Create Transaction
          await tx.inventoryTransaction.create({
            data: {
              recordId: item.recordId,
              bookingId: bookingId,
              userId: userId,
              type: 'OUT',
              quantity: item.estimatedQty,
              reason: `Consumo automático reserva #${bookingId}`
            }
          });
        }
      }

      await this.audit.log({
        userId,
        action: 'CONFIRM_BOOKING_CONSUMPTION',
        entity: 'Booking',
        entityId: bookingId,
        details: `Salida de suministros confirmada para reserva #${bookingId}`
      });

      return { success: true, itemsConfirmed: consumption.length };
    });
  }
}
