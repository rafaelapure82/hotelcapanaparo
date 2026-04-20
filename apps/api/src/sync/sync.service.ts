import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ical, { ICalCalendarMethod } from 'ical-generator';
import * as nodeIcal from 'node-ical';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  // 1. EXPORT: Generate iCal feed for a specific room (Suite)
  async generateICalFeed(homeId: number) {
    const home = await this.prisma.home.findUnique({
      where: { id: homeId },
      include: { bookings: { where: { status: { notIn: ['cancelled', 'rejected'] } } } }
    });

    if (!home) throw new Error('Home not found');

    const calendar = ical({ name: `Capanaparo - ${home.title}` });
    calendar.method(ICalCalendarMethod.PUBLISH);

    home.bookings.forEach(booking => {
      calendar.createEvent({
        start: booking.startDate,
        end: booking.endDate,
        summary: `Reservado (${booking.platform || 'Directo'})`,
        description: `Reserva #${booking.id} - Hotel Capanaparo Suite`,
        id: `booking-${booking.id}@capanaparo.com`,
      });
    });

    return calendar.toString();
  }

  // 2. IMPORT: Sync from external calendar (Airbnb/Booking)
  @Cron(CronExpression.EVERY_HOUR)
  async syncAllExternalCalendars() {
    this.logger.log('🔄 Iniciando sincronización masiva de calendarios externos...');
    const homes = await this.prisma.home.findMany({
      where: { externalCalendarUrl: { not: null } }
    });

    for (const home of homes) {
      await this.syncHomeCalendar(home.id);
    }
    this.logger.log('✅ Sincronización masiva completada.');
  }

  async syncHomeCalendar(homeId: number) {
    const home = await this.prisma.home.findUnique({ where: { id: homeId } });
    if (!home || !home.externalCalendarUrl) return;

    this.logger.log(`📥 Sincronizando: ${home.title}...`);

    try {
      const events = await nodeIcal.fromURL(home.externalCalendarUrl);
      
      const externalBookings = Object.values(events).filter((e: any) => e?.type === 'VEVENT');

      // Create internal bookings for these external blocks
      for (const event of externalBookings as any[]) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const uid = event.uid;

        // Check if already exists (using tokenCode to store external UID)
        const existing = await this.prisma.booking.findFirst({
          where: { serviceId: homeId, tokenCode: uid }
        });

        if (!existing) {
          await this.prisma.booking.create({
            data: {
              serviceId: homeId,
              serviceType: 'home',
              startDate: start,
              endDate: end,
              total: 0, // Blocked dates have 0 internal price reference
              status: 'confirmed',
              firstName: 'Huésped',
              lastName: 'Externo (Sync)',
              email: 'sync@capanaparo.com',
              phone: 'N/A',
              buyerId: home.authorId, // Assigned to owner
              ownerId: home.authorId,
              currency: 'USD',
              paymentType: 'external_sync',
              platform: 'External Sync',
              tokenCode: uid, // Store UID to avoid duplicates
            }
          });
          this.logger.log(`🆕 Bloqueo creado para ${home.title}: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
        }
      }

      await this.prisma.home.update({
        where: { id: homeId },
        data: { lastSync: new Date() }
      });
    } catch (err) {
      this.logger.error(`❌ Falló la sincronización para ${home.title}:`, err.message);
    }
  }
}
