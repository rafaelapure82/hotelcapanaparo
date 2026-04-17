import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    
    // Count invoices for today
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));

    const count = await this.prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${datePrefix}-${sequence}`;
  }

  async createFromBooking(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { home: true },
    });

    if (!booking) throw new BadRequestException('Booking not found');
    if (booking.invoice) return booking.invoice; // Already has one

    const { rate } = await this.settingsService.getExchangeRate();
    const amountUSD = booking.total;
    const amountVES = amountUSD * rate;
    const number = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        number,
        bookingId: booking.id,
        amountUSD,
        amountVES,
        exchangeRate: rate,
        status: 'paid',
      },
    });
  }

  async generatePDFBuffer(booking: any, invoice: any): Promise<Buffer> {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(46, 196, 182); // --primary
    doc.text('HOTEL CAPANAPARO SUITES', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('RIF: J-29934822-1 | Urb. El Recreo, San Fernando de Apure', 105, 28, { align: 'center' });
    doc.text('Contacto: +58 412-1234567 | hotelcapanaparo.com', 105, 33, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(20, 40, 190, 40);

    // Invoice Meta
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`FACTURA DIGITAL: #${invoice.number}`, 20, 55);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date(invoice.createdAt).toLocaleDateString()}`, 150, 55);

    // Customer Info
    doc.setFontSize(11);
    doc.text('CLIENTE:', 20, 70);
    doc.text(`${booking.firstName} ${booking.lastName}`, 20, 75);
    doc.text(booking.email, 20, 80);
    doc.text(booking.phone, 20, 85);

    // Table
    (doc as any).autoTable({
      startY: 95,
      head: [['Descripción', 'Tasa Ref.', 'Monto ($)', 'Monto (Bs)']],
      body: [
        [
          `Estadía en ${booking.home?.title || 'Suite'}\nDesde: ${new Date(booking.startDate).toLocaleDateString()} Hasta: ${new Date(booking.endDate).toLocaleDateString()}`,
          `${invoice.exchangeRate} Bs/$`,
          `$${invoice.amountUSD.toFixed(2)}`,
          `${invoice.amountVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`
        ]
      ],
      headStyles: { fillColor: [46, 196, 182], textColor: 255 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('TOTAL PAGADO:', 120, finalY);
    doc.setFontSize(18);
    doc.setTextColor(255, 159, 28);
    doc.text(`$${invoice.amountUSD.toFixed(2)}`, 120, finalY + 10);
    doc.setFontSize(12);
    doc.setTextColor(46, 196, 182);
    doc.text(`${invoice.amountVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`, 120, finalY + 18);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Esta es una factura digital válida para control interno y servicios de hospedaje.', 105, 280, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  }
}
