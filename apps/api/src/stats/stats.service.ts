import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalEarnings, 
      newBookingsCount,
      checkInsToday,
      checkOutsToday,
      totalProperties,
      revenueEvolution,
      platformStats
    ] = await Promise.all([
      // 1. Total Earnings
      this.prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      }),
      // 2. New Bookings (Last 30 days)
      this.prisma.booking.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // 3. Check-ins Today
      this.prisma.booking.count({
        where: { 
          startDate: { gte: startOfToday, lte: endOfToday },
          status: { in: ['confirmed', 'paid'] }
        },
      }),
      // 4. Check-outs Today
      this.prisma.booking.count({
        where: { 
          endDate: { gte: startOfToday, lte: endOfToday },
          status: { in: ['confirmed', 'paid'] }
        },
      }),
      // 5. Total Properties
      this.prisma.home.count({
        where: { status: 'publish' },
      }),
      // 6. Revenue Evolution (Last 6 Months)
      this.prisma.booking.groupBy({
        by: ['createdAt'],
        _sum: { total: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      }),
      // 7. Platform Analysis
      this.prisma.booking.groupBy({
        by: ['platform'],
        _count: { id: true },
        where: { status: { in: ['confirmed', 'paid'] } },
      })
    ]);

    // Format Revenue Evolution for Chart
    // This is a simplified version, ideally we group by Date in DB if DB permits or here
    const evolution = await this.groupRevenueByMonth();
    
    // Format Platform Stats
    const platforms = platformStats.map(p => ({
      name: p.platform || 'Direct',
      value: p._count.id
    }));

    return {
      totalRevenue: totalEarnings._sum.total || 0,
      newBookings: newBookingsCount,
      checkIn: checkInsToday,
      checkOut: checkOutsToday,
      totalProperties,
      revenueChart: evolution,
      platforms
    };
  }

  private async groupRevenueByMonth() {
    // Fetch last 6 months of data
    const months: { name: string; total: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const name = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const res = await this.prisma.booking.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ['confirmed', 'paid'] }
        }
      });

      months.push({ name, total: res._sum.total || 0 });
    }
    return months;
  }

  async getGuestStats(userId: number) {
    const [myBookings, lastStay] = await Promise.all([
      this.prisma.booking.count({
        where: { buyerId: userId },
      }),
      this.prisma.booking.findFirst({
        where: { buyerId: userId },
        orderBy: { startDate: 'desc' },
        include: { home: true },
      }),
    ]);

    return {
      myBookings,
      lastStay,
    };
  }

  async getMonthlyRevenueReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['confirmed', 'paid'] },
      },
      include: {
        home: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Propiedad,Huesped,Total,Fecha de Reserva,Check-in,Check-out,Estado,Plataforma\n';
    const rows = bookings.map(b => {
      return `${b.id},"${b.home?.title || 'N/A'}","${b.firstName} ${b.lastName}",${b.total},${b.createdAt.toISOString().split('T')[0]},${b.startDate.toISOString().split('T')[0]},${b.endDate.toISOString().split('T')[0]},${b.status},${b.platform || 'Direct'}`;
    }).join('\n');

    return header + rows;
  }

  async getBIAnalytics() {
    const now = new Date();
    
    // 1. Projections (Weekly, Monthly, Yearly)
    const projections = await this.calculateFinancialProjections();
    
    // 2. Profitability (Revenue vs Cost per Suite)
    const profitability = await this.calculateSuiteProfitability();
    
    // 3. Occupancy Heatmap (Last 12 weeks)
    const occupancyPulse = await this.getOccupancyPulse();

    return {
      projections,
      profitability,
      occupancyPulse,
      operational: await this.getOperationalMetrics()
    };
  }

  private async calculateFinancialProjections() {
    const now = new Date();
    
    // Next 12 weeks (Weekly)
    const weekly: { name: string, total: number }[] = [];
    for (let i = 0; i < 12; i++) {
        const start = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        const res = await this.prisma.booking.aggregate({
            _sum: { total: true },
            where: {
                startDate: { gte: start, lte: end },
                status: { in: ['confirmed', 'paid'] }
            }
        });
        weekly.push({ name: `W${i + 1}`, total: res._sum.total || 0 });
    }

    // Next 12 months (Monthly)
    const monthly: { name: string, total: number }[] = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const name = d.toLocaleString('es-ES', { month: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const res = await this.prisma.booking.aggregate({
            _sum: { total: true },
            where: {
                startDate: { gte: start, lte: end },
                status: { in: ['confirmed', 'paid'] }
            }
        });
        monthly.push({ name, total: res._sum.total || 0 });
    }

    // Next 5 years (Yearly)
    const yearly: { name: string, total: number }[] = [];
    for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() + i;
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59);
        const res = await this.prisma.booking.aggregate({
            _sum: { total: true },
            where: {
                startDate: { gte: start, lte: end },
                status: { in: ['confirmed', 'paid'] }
            }
        });
        yearly.push({ name: year.toString(), total: res._sum.total || 0 });
    }

    return { weekly, monthly, yearly };
  }

  private async calculateSuiteProfitability() {
    // Top 5 suites profitability
    const homes = await this.prisma.home.findMany({
        where: { status: 'publish' },
        take: 5,
        include: {
            bookings: {
                where: { status: { in: ['confirmed', 'paid'] } },
                include: { inventoryTransactions: { include: { record: true } } }
            }
        }
    });

    return homes.map(home => {
        const revenue = home.bookings.reduce((sum, b) => sum + b.total, 0);
        const cost = home.bookings.reduce((sum, b) => {
            return sum + b.inventoryTransactions.reduce((iSum, t) => iSum + (t.quantity * (t.record?.costPrice || 0)), 0);
        }, 0);
        
        return {
            name: home.title,
            ingresos: revenue,
            costos: cost,
            margen: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
        };
    });
  }

  private async getOccupancyPulse() {
      // Analyze last 30 days occupancy percentage
      const homes = await this.prisma.home.findMany({
          where: { status: 'publish' },
          include: { bookings: { where: { status: { in: ['confirmed', 'paid'] } } } }
      });

      return homes.map(h => ({
          name: h.title,
          active: h.bookings.length // Simplified for now
      })).sort((a, b) => b.active - a.active).slice(0, 5);
  }

  async getOperationalMetrics() {
    const tasks = await this.prisma.housekeepingTask.findMany({
        where: { status: 'ready' },
        orderBy: { updatedAt: 'desc' },
        take: 50
    });

    // Calculate avg cleaning time (createdAt to updatedAt for 'ready' tasks)
    // This is an approximation
    let totalMs = 0;
    tasks.forEach(t => {
        totalMs += t.updatedAt.getTime() - t.createdAt.getTime();
    });

    const avgMinutes = tasks.length > 0 ? (totalMs / tasks.length) / (1000 * 60) : 0;

    return {
        avgCleaningTime: Math.round(avgMinutes),
        tasksCompleted: tasks.length,
        efficiencyScore: avgMinutes < 60 ? 'Excedente' : avgMinutes < 120 ? 'Óptimo' : 'Crítico'
    };
  }

  // --- NEW FLEXIBLE REPORTS MODULE ---

  async getFlexibleReportData(query: { startDate: string, endDate: string, type: string }) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    end.setHours(23, 59, 59, 999);

    if (query.type === 'income') {
      const records = await this.prisma.booking.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ['confirmed', 'paid'] }
        },
        include: { home: { select: { title: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return records.map(r => ({
        ID: r.id,
        Propiedad: r.home?.title || 'N/A',
        Cliente: `${r.firstName} ${r.lastName}`,
        Monto: `$${r.total.toFixed(2)}`,
        Fecha: r.createdAt.toISOString().split('T')[0],
        Estado: r.status,
        Plataforma: r.platform || 'Direct'
      }));
    }

    if (query.type === 'inventory') {
      const records = await this.prisma.inventoryTransaction.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { record: true, booking: { include: { home: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return records.map(r => ({
        ID: r.id,
        Item: r.record?.item || 'N/A',
        SKU: r.record?.sku || 'N/A',
        Cantidad: r.quantity,
        Tipo: r.type, // IN / OUT
        Motivo: r.reason,
        Suite: r.booking?.home?.title || 'General',
        Fecha: r.createdAt.toISOString().split('T')[0]
      }));
    }

    if (query.type === 'occupancy') {
      const homes = await this.prisma.home.findMany({
        include: {
          bookings: {
            where: {
              startDate: { lte: end },
              endDate: { gte: start },
              status: { in: ['confirmed', 'paid'] }
            }
          }
        }
      });

      return homes.map(h => ({
        ID: h.id,
        Propiedad: h.title,
        Categoria: h.homeType || 'Suite',
        Reservas: h.bookings.length,
        Estatus: h.status,
        Limpieza: h.cleaningStatus
      }));
    }

    return [];
  }

  async exportReport(query: { startDate: string, endDate: string, type: string, format: string }) {
    const data = await this.getFlexibleReportData(query);
    if (data.length === 0) return null;

    const typeLabels = { income: 'Ingresos', inventory: 'Inventario', occupancy: 'Ocupacion' };
    const title = `Reporte de ${typeLabels[query.type] || 'Sistema'}`;

    if (query.format === 'csv') {
      return this.generateCSVBuffer(data);
    } else if (query.format === 'excel') {
      return this.generateExcelBuffer(data, title);
    } else if (query.format === 'pdf') {
      return this.generatePDFBuffer(data, title, query.startDate, query.endDate);
    }
    
    return null;
  }

  private generateCSVBuffer(data: any[]): Buffer {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }

  private async generateExcelBuffer(data: any[], title: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Title and Header
    worksheet.mergeCells('A1:F1');
    const titleRow = worksheet.getRow(1);
    titleRow.values = [title.toUpperCase()];
    titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2EC4B6' } };

    const headers = Object.keys(data[0]);
    worksheet.getRow(3).values = headers;
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    data.forEach((item, index) => {
      worksheet.addRow(Object.values(item));
    });

    // Auto-width
    worksheet.columns.forEach(column => {
      let maxLen = 0;
      (column as any).eachCell({ includeEmpty: true }, (cell: any) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLen) maxLen = len;
      });
      column.width = maxLen < 12 ? 12 : maxLen + 2;
    });

    return await workbook.xlsx.writeBuffer() as any as Buffer;
  }

  private generatePDFBuffer(data: any[], title: string, start: string, end: string): Buffer {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(46, 196, 182);
    doc.text('HOTEL CAPANAPARO SUITES', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(title, 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Periodo: ${start} al ${end}`, 105, 33, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(20, 38, 190, 38);

    // Table
    const headers = Object.keys(data[0]);
    const rows = data.map(item => Object.values(item));

    (doc as any).autoTable({
      startY: 45,
      head: [headers],
      body: rows,
      headStyles: { fillColor: [46, 196, 182], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
    }

    return Buffer.from(doc.output('arraybuffer'));
  }
}
