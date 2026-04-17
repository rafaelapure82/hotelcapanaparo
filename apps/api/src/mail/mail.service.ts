import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    // Development: Create Ethereal Test Account
    const testAccount = await nodemailer.createTestAccount();
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('----------------------------------------------------');
    console.log('PRO-TIP: Usando Ethereal Mail para Pruebas de Facturación');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
    console.log('----------------------------------------------------');
  }

  async sendInvoiceEmail(to: string, clientName: string, invoiceNumber: string, pdfBuffer: Buffer) {
    const info = await this.transporter.sendMail({
      from: '"Hotel Capanaparo Suites" <no-reply@hotelcapanaparo.com>',
      to,
      subject: `Factura Digital ${invoiceNumber} - Hotel Capanaparo`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #2ec4b6; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Hotel Capanaparo Suites</h1>
          </div>
          <div style="padding: 40px; background: white;">
            <h2 style="color: #0f172a; margin-top: 0;">¡Hola, ${clientName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
              Tu reserva ha sido confirmada con éxito. Adjunto a este correo encontrarás tu **Factura Digital** oficial.
            </p>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #2ec4b6;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase;">Detalles de Factura</p>
              <h3 style="margin: 10px 0 0 0; font-size: 20px; color: #0f172a;">${invoiceNumber}</h3>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="http://localhost:3000/dashboard/invoices" 
                 style="background: #2ec4b6; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; transition: background 0.3s ease;">
                Ver en mi Portal
              </a>
            </div>

            <p style="font-size: 14px; color: #94a3b8; text-align: center;">
              Si tienes alguna duda, responde a este correo o contáctanos por WhatsApp.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; 2024 Hotel Capanaparo Suites | RIF: J-29934822-1 <br>
            Urb. El Recreo, San Fernando de Apure, Venezuela.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Factura_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`Email enviado: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  }
}
