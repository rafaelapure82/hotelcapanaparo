import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class HousekeepingService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  async findAll() {
    return this.prisma.housekeepingTask.findMany({
      include: {
        home: true,
        staff: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByStaff(staffId: number) {
    return this.prisma.housekeepingTask.findMany({
      where: { assignedTo: staffId },
      include: { home: true },
      orderBy: { priority: 'desc' }
    });
  }

  async createTask(data: { homeId: number; priority?: string; notes?: string; assignedTo?: number }) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.housekeepingTask.create({
        data: {
          homeId: data.homeId,
          priority: data.priority || 'medium',
          notes: data.notes,
          assignedTo: data.assignedTo,
          status: 'dirty'
        }
      });

      await tx.home.update({
        where: { id: data.homeId },
        data: { cleaningStatus: 'dirty' }
      });

      return task;
    });
  }

  async updateStatus(id: number, status: string, userId: number, notes?: string) {
    const task = await this.prisma.housekeepingTask.findUnique({
      where: { id },
      include: { home: true }
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.housekeepingTask.update({
        where: { id },
        data: { 
          status, 
          notes: notes || task.notes,
          completedAt: status === 'ready' ? new Date() : task.completedAt
        }
      });

      // Update home status as well
      await tx.home.update({
        where: { id: task.homeId },
        data: { cleaningStatus: status }
      });

      await this.audit.log({
        userId,
        action: 'UPDATE_HOUSEKEEPING_STATUS',
        entity: 'HousekeepingTask',
        entityId: id,
        prevData: { status: task.status },
        newData: { status }
      });

      return updatedTask;
    });
  }

  async assignTask(id: number, staffId: number, adminId: number) {
    return this.prisma.housekeepingTask.update({
      where: { id },
      data: { assignedTo: staffId }
    });
  }
}
