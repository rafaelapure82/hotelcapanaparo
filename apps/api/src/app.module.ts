import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HomesModule } from './homes/homes.module';
import { BookingsModule } from './bookings/bookings.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    HomesModule, 
    BookingsModule, StatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
