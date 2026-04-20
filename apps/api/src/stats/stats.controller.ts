import { Controller, Get, UseGuards, Request, Header, Query, Res } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as express from 'express';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin')
  @Roles('admin', 'partner')
  async getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('bi')
  @Roles('admin')
  async getBIAnalytics() {
    return this.statsService.getBIAnalytics();
  }

  @Get('guest')
  @Roles('guest', 'admin')
  async getGuestStats(@Request() req: any) {
    return this.statsService.getGuestStats(Number(req.user.userId));
  }

  @Get('export-revenue')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="reporte_ingresos.csv"')
  async exportRevenue(@Query('year') year: string, @Query('month') month: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    return this.statsService.getMonthlyRevenueReport(y, m);
  }

  @Get('reports')
  @Roles('admin', 'partner')
  async getReports(@Query() query: { startDate: string, endDate: string, type: string }) {
    return this.statsService.getFlexibleReportData(query);
  }

  @Get('reports/export')
  @Roles('admin', 'partner')
  async exportReport(@Query() query: { startDate: string, endDate: string, type: string, format: string }, @Res() res: express.Response) {
    const buffer = await this.statsService.exportReport(query);
    
    if (!buffer) {
      return res.status(404).send('No data found for the selected criteria');
    }

    const mimeTypes = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf'
    };

    const extensions = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' };
    const fileName = `reporte_${query.type}_${new Date().toISOString().split('T')[0]}.${extensions[query.format] || 'dat'}`;

    res.set({
      'Content-Type': mimeTypes[query.format] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
