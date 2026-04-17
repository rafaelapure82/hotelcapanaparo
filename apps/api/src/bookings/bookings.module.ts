import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { HomesModule } from '../homes/homes.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [HomesModule, InvoicesModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
