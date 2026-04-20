import { Controller, Get, Post, Put, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('housekeeping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('tasks')
  @Roles('admin', 'partner')
  findAll() {
    return this.housekeepingService.findAll();
  }

  @Get('my-tasks')
  @Roles('staff-limpieza', 'admin')
  findMyTasks(@Req() req: any) {
    return this.housekeepingService.findByStaff(req.user.id);
  }

  @Post('tasks')
  @Roles('admin', 'partner')
  createTask(@Body() data: { homeId: number; priority?: string; notes?: string; assignedTo?: number }) {
    return this.housekeepingService.createTask(data);
  }

  @Patch('tasks/:id/status')
  @Roles('staff-limpieza', 'admin')
  updateStatus(
    @Param('id') id: string, 
    @Body() data: { status: string; notes?: string },
    @Req() req: any
  ) {
    return this.housekeepingService.updateStatus(+id, data.status, req.user.id, data.notes);
  }

  @Patch('tasks/:id/assign')
  @Roles('admin')
  assignTask(
    @Param('id') id: string,
    @Body() data: { staffId: number },
    @Req() req: any
  ) {
    return this.housekeepingService.assignTask(+id, data.staffId, req.user.id);
  }
}
