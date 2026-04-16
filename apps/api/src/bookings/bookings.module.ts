import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { HomesModule } from '../homes/homes.module';

@Module({
  imports: [HomesModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
