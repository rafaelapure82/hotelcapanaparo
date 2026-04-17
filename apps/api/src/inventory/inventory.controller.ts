import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
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
  create(@Body() data: any) {
    return this.inventoryService.create(data);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() data: { quantity?: number; adjustment?: number; type: string; reason: string }) {
    return this.inventoryService.updateStock(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
