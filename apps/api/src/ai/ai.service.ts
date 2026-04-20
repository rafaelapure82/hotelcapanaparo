import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private notifications: NotificationsService,
  ) {}

  private readonly faq = [
    {
      keywords: ['wifi', 'internet', 'conexión'],
      answer: '📶 ¡Claro que sí! Contamos con **Fibra Óptica de alta velocidad** en todas las áreas del hotel y suites. La clave te será entregada al momento del Check-in. ¡Es totalmente gratuita! 🚀',
    },
    {
      keywords: ['check-in', 'entrada', 'hora', 'llegada'],
      answer: '🕒 Nuestro horario de **Check-in es a partir de las 14:00 (2 PM)**. Si llegas antes, podemos resguardar tu equipaje en recepción mientras tu suite queda impecable. ✨',
    },
    {
      keywords: ['check-out', 'salida', 'hora'],
      answer: '🕘 El **Check-out debe realizarse antes de las 11:00 AM**. Si necesitas un "Late Check-out", por favor consúltalo en recepción (sujeto a disponibilidad). 😊',
    },
    {
      keywords: ['desayuno', 'comida', 'restaurante'],
      answer: '🍳 ¡Sí! Ofrecemos un **Desayuno Criollo e Internacional** exquisito. Se sirve en el área del comedor de 7:30 AM a 10:00 AM. ¡Pregunta por nuestras famosas arepas apureñas! ☕',
    },
    {
      keywords: ['mascotas', 'perro', 'gato', 'animales'],
      answer: '🐾 En Hotel Capanaparo amamos a los animales, pero por políticas de mantenimiento y alergias, actualmente **no aceptamos mascotas** en las suites. ¡Gracias por tu comprensión! 🙏',
    },
    {
      keywords: ['ubicación', 'donde', 'dirección', 'llegar'],
      answer: '📍 Estamos ubicados en la **Urb. El Recreo, San Fernando de Apure**. Cerca de los principales centros comerciales y con fácil acceso a la zona colonial. ¡Te esperamos! 🗺️',
    },
    {
      keywords: ['piscina', 'alberca', 'bañarse'],
      answer: '🏊‍♂️ Contamos con una refrescante **piscina privada** para nuestros huéspedes, abierta de 9:00 AM a 8:00 PM. ¡Ideal para el calor de Apure! ☀️',
    }
  ];

  async processMessage(content: string, userId: number, bookingId?: number) {
    console.log(`🤖 CapaBot procesando mensaje de usuario ${userId}: "${content}"`);
    const text = content.toLowerCase();
    
    // 1. Check for Suite Sales / Prices
    if (text.includes('precio') || text.includes('cuanto cuesta') || text.includes('disponibilidad') || text.includes('habitacion') || text.includes('suite')) {
      console.log('🤖 CapaBot: Detectó intención de Venta/Precios');
      return this.getSuitesBrief();
    }

    // 2. Check FAQ
    for (const item of this.faq) {
      if (item.keywords.some(k => text.includes(k))) {
        console.log(`🤖 CapaBot: Respondiendo FAQ sobre ${item.keywords[0]}`);
        return item.answer;
      }
    }

    // 3. Handoff logic (Notification to admin)
    console.log('🤖 CapaBot: No reconoció intención, activando Handoff');
    await this.notifyAdmin(content, userId);
    
    return '🤔 Vaya, esa es una excelente pregunta que no tengo en mi base de datos actual. Pero no te preocupes, **he notificado a un agente humano** para que te responda lo antes posible. 👨‍💻 ¿Hay algo más en lo que pueda ayudarte mientras tanto?';
  }

  private async getSuitesBrief() {
    try {
      const suites = await this.prisma.home.findMany({
        where: { status: 'publish' },
        take: 3
      });

      let response = '🏨 ¡Claro! Tenemos varias opciones de lujo para ti en **Hotel Capanaparo Suites**:\n\n';
      
      suites.forEach(s => {
        response += `✨ **${s.title}**\n💰 Precio: **$${s.basePrice} / noche**\n📍 [Ver Disponibilidad y Fotos](http://localhost:3005/rooms/${s.id})\n\n`;
      });

      response += '¿Te gustaría que te ayude a iniciar el proceso de reserva para alguna de ellas? 🥂';
      return response;
    } catch (err) {
      console.error('🤖 CapaBot Error fetching suites:', err);
      return '🏨 Tenemos suites maravillosas disponibles. ¿Puedes decirme para qué fecha las buscas?';
    }
  }

  private async notifyAdmin(content: string, userId: number) {
    try {
      let userName = 'Invitado';
      if (userId > 0) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) userName = user.firstName || 'Invitado';
      }

      console.log(`🚨 [AI HANDOFF] El usuario ${userName} (${userId}) hizo una pregunta compleja: "${content}"`);

      // Create a real-time notification for admins (assuming admin ID is 1 for now or broadcast)
      await this.notifications.create({
        userId: 1, // In a real app, this would be a loop for all admins or a global channel
        type: 'handoff',
        title: 'Atención Requerida: CapaBot',
        message: `${userName} ha hecho una pregunta que la IA no pudo responder: "${content.substring(0, 50)}..."`,
        link: `/dashboard/messages?userId=${userId}`
      });
      
    } catch (err) {
      console.error('🤖 CapaBot Error notifying admin:', err);
    }
  }
}
