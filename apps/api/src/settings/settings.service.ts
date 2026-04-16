import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getExchangeRate() {
    let setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'exchange_rate_ves' },
    });
    
    if (!setting) {
      setting = await this.prisma.systemSetting.create({
        data: { key: 'exchange_rate_ves', value: '36.5' },
      });
    }
    
    return { rate: parseFloat(setting.value) };
  }

  async updateExchangeRate(rate: number) {
    return this.prisma.systemSetting.upsert({
      where: { key: 'exchange_rate_ves' },
      update: { value: rate.toString() },
      create: { key: 'exchange_rate_ves', value: rate.toString() },
    });
  }
}
