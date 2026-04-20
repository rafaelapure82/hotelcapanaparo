import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ExtraChargesService } from './extra-charges.service';
import { HomesModule } from '../homes/homes.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailModule } from '../mail/mail.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [HomesModule, InvoicesModule, MailModule, InventoryModule],
  controllers: [BookingsController],
  providers: [BookingsService, ExtraChargesService],
  exports: [BookingsService, ExtraChargesService],
})
export class BookingsModule {}
