import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.inventoryService.getStats();
  }

  @Get('categories')
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() data: { name: string; icon?: string }) {
    return this.inventoryService.createCategory(data.name, data.icon);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id') id: string) {
    return this.inventoryService.getTransactions(+id);
  }

  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.inventoryService.create({ ...data, userId: req.user.id });
  }

  @Get('rules')
  getConsumptionRules() {
    return this.inventoryService.getConsumptionRules();
  }

  @Post('rules')
  createConsumptionRule(@Body() data: any) {
    return this.inventoryService.createConsumptionRule(data);
  }

  @Get('bookings/:bookingId/consumption')
  calculateBookingConsumption(@Param('bookingId') bookingId: string) {
    return this.inventoryService.calculateBookingConsumption(+bookingId);
  }

  @Post('bookings/:bookingId/confirm-consumption')
  confirmBookingConsumption(@Param('bookingId') bookingId: string, @Req() req: any) {
    return this.inventoryService.confirmBookingConsumption(+bookingId, req.user.id);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() data: { quantity?: number; adjustment?: number; type: string; reason: string; bookingId?: number }, @Req() req: any) {
    return this.inventoryService.updateStock(+id, req.user.id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.remove(+id, req.user.id);
  }
}
