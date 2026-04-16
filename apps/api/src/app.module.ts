import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HomesModule } from './homes/homes.module';
import { BookingsModule } from './bookings/bookings.module';
import { StatsModule } from './stats/stats.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    HomesModule, 
    BookingsModule, 
    StatsModule,
    SettingsModule,
    UploadsModule,
    ChatModule,
    ServeStaticModule.forRoot({

      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
