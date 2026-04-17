import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

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
        },
      });

      return record;
    });
  }

  async updateStock(id: number, data: { quantity?: number; adjustment?: number; type: string; reason: string }) {
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
        },
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

  async remove(id: number) {
    return this.prisma.inventoryRecord.delete({
      where: { id },
    });
  }
}
