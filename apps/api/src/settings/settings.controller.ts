import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('exchange-rate')
  async getExchangeRate() {
    return this.settingsService.getExchangeRate();
  }

  @Patch('exchange-rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateExchangeRate(@Body('rate') rate: number) {
    return this.settingsService.updateExchangeRate(rate);
  }
}
