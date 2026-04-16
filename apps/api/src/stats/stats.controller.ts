import { Controller, Get, UseGuards, Request, Header, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin')
  @Roles('admin', 'partner')
  async getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('guest')
  @Roles('guest', 'admin')
  async getGuestStats(@Request() req: any) {
    return this.statsService.getGuestStats(req.user.userId);
  }

  @Get('export-revenue')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="reporte_ingresos.csv"')
  async exportRevenue(@Query('year') year: string, @Query('month') month: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    return this.statsService.getMonthlyRevenueReport(y, m);
  }
}
