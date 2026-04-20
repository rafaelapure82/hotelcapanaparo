import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    // Use env vars in production, Ethereal in dev
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('📧 Mail Service: Conectado a SMTP en producción');
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log('----------------------------------------------------');
      console.log('📧 Mail: Usando Ethereal (modo desarrollo)');
      console.log(`   User: ${testAccount.user}`);
      console.log('----------------------------------------------------');
    }
  }

  private baseTemplate(content: string) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2ec4b6, #1a9e93); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 900;">Hotel Capanaparo Suites</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 13px;">Lujo, Confort y Servicio Excepcional</p>
        </div>
        <div style="padding: 40px; background: white;">
          ${content}
        </div>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
          &copy; ${new Date().getFullYear()} Hotel Capanaparo Suites | RIF: J-29934822-1 <br>
          Urb. El Recreo, San Fernando de Apure, Venezuela.<br>
          <a href="mailto:info@hotelcapanaparo.com" style="color: #2ec4b6;">info@hotelcapanaparo.com</a>
        </div>
      </div>
    `;
  }

  // ===================== INVOICE EMAIL =====================
  async sendInvoiceEmail(to: string, clientName: string, invoiceNumber: string, pdfBuffer: Buffer) {
    const content = `
      <h2 style="color: #0f172a; margin-top: 0;">¡Hola, ${clientName}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Tu reserva ha sido <strong style="color: #2ec4b6;">confirmada con éxito</strong>. Adjunto encontrarás tu Factura Digital oficial.
      </p>
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #2ec4b6;">
        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Factura Nº</p>
        <h3 style="margin: 8px 0 0; font-size: 22px; color: #0f172a; font-weight: 900;">${invoiceNumber}</h3>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">
        Si tienes alguna duda, responde a este correo o contáctanos por WhatsApp.
      </p>
    `;

    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `Factura Digital ${invoiceNumber} — Hotel Capanaparo`,
      html: this.baseTemplate(content),
      attachments: [
        { filename: `Factura_${invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' },
      ],
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Preview: ${previewUrl}`);
    return info;
  }

  // ===================== BOOKING CONFIRMATION =====================
  async sendBookingConfirmation(to: string, data: {
    guestName: string;
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    bookingId: number;
  }) {
    const content = `
      <h2 style="color: #0f172a; margin-top: 0;">¡Reserva Confirmada! 🎉</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Hola <strong>${data.guestName}</strong>, tu reserva está confirmada. Te esperamos.
      </p>
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Suite</td><td style="padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a;">${data.propertyTitle}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.checkIn}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.checkOut}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Noches</td><td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.nights}</td></tr>
          <tr style="border-top: 2px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 800; font-size: 16px;">Total</td><td style="padding: 12px 0; text-align: right; font-weight: 900; font-size: 18px; color: #2ec4b6;">$${data.total.toFixed(2)}</td></tr>
        </table>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 13px; color: #94a3b8;">Referencia de reserva: <strong>#${data.bookingId}</strong></p>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `Reserva Confirmada — ${data.propertyTitle} | Hotel Capanaparo`,
      html: this.baseTemplate(content),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Booking confirmation preview: ${previewUrl}`);
    return info;
  }

  // ===================== CHECK-IN REMINDER (24h before) =====================
  async sendCheckInReminder(to: string, data: {
    guestName: string;
    propertyTitle: string;
    checkIn: string;
    address?: string;
  }) {
    const content = `
      <h2 style="color: #0f172a; margin-top: 0;">¡Tu estadía es mañana! ☀️</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Hola <strong>${data.guestName}</strong>, te recordamos que tu check-in en <strong>${data.propertyTitle}</strong> es mañana.
      </p>
      <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #22c55e;">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #16a34a; text-transform: uppercase;">Recordatorio de Check-in</p>
        <p style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">📅 ${data.checkIn} — 14:00 hrs</p>
        ${data.address ? `<p style="margin: 8px 0 0; font-size: 14px; color: #475569;">📍 ${data.address}</p>` : ''}
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
          <strong>Recuerda traer:</strong><br>
          • Documento de identidad o pasaporte<br>
          • Comprobante de pago<br>
          • Datos de contacto actualizados
        </p>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">¿Necesitas cambiar algo? Contáctanos por WhatsApp.</p>
    `;

    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `Recordatorio: Tu check-in es mañana — ${data.propertyTitle}`,
      html: this.baseTemplate(content),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Check-in reminder preview: ${previewUrl}`);
    return info;
  }

  // ===================== POST-STAY REVIEW REQUEST =====================
  async sendReviewRequest(to: string, data: {
    guestName: string;
    propertyTitle: string;
    homeId: number;
  }) {
    const content = `
      <h2 style="color: #0f172a; margin-top: 0;">¿Cómo fue tu estadía? ⭐</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Hola <strong>${data.guestName}</strong>, esperamos que hayas disfrutado tu estadía en <strong>${data.propertyTitle}</strong>.
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Tu opinión es fundamental para nosotros y ayuda a futuros huéspedes a tomar la mejor decisión. ¿Podrías dedicarnos 2 minutos para compartir tu experiencia?
      </p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3005'}/homes/${data.homeId}" 
           style="background: linear-gradient(135deg, #2ec4b6, #1a9e93); color: white; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block;">
          Dejar mi Reseña
        </a>
      </div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">
        Tu reseña se publicará de forma verificada con tu nombre.
      </p>
    `;

    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `¿Cómo fue tu estadía en ${data.propertyTitle}? — Déjanos tu opinión`,
      html: this.baseTemplate(content),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Review request preview: ${previewUrl}`);
    return info;
  }

  // ===================== BOOKING CANCELLATION =====================
  async sendCancellationEmail(to: string, data: {
    guestName: string;
    propertyTitle: string;
    bookingId: number;
  }) {
    const content = `
      <h2 style="color: #0f172a; margin-top: 0;">Reserva Cancelada</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Hola <strong>${data.guestName}</strong>, confirmamos que tu reserva <strong>#${data.bookingId}</strong> en <strong>${data.propertyTitle}</strong> ha sido cancelada.
      </p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          Si la cancelación fue dentro de las 48 horas previas al check-in, podría aplicarse un cargo según nuestra política de cancelación.
        </p>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">
        Si esto fue un error, contáctanos inmediatamente por WhatsApp o correo.
      </p>
    `;

    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `Reserva #${data.bookingId} Cancelada — Hotel Capanaparo`,
      html: this.baseTemplate(content),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Cancellation preview: ${previewUrl}`);
    return info;
  }
}
