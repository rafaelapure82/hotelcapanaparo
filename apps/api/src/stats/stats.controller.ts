import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin')
  @Roles('admin', 'partner')
  async getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('guest')
  @Roles('guest', 'admin')
  async getGuestStats(@Request() req: any) {
    return this.statsService.getGuestStats(req.user.userId);
  }
}
