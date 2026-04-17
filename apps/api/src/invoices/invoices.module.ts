import { Module, Controller, Get, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { MailService } from '../mail/mail.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { PrismaService } from '../prisma/prisma.service';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        booking: {
          include: { home: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { booking: { include: { home: true } } }
    });
  }
}

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, MailService],
  exports: [InvoicesService, MailService],
})
export class InvoicesModule {}
