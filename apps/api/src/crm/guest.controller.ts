import { Controller, Get, UseGuards } from '@nestjs/common';
import { GuestService } from './guest.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  async findAll() {
    return this.guestService.findAll();
  }
}
