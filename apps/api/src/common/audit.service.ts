import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: number;
    action: string;
    entity: string;
    entityId?: number;
    details?: string;
    prevData?: any;
    newData?: any;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
          prevData: data.prevData,
          newData: data.newData,
        },
      });
    } catch (error) {
      console.error('Audit Log failed:', error);
      // We don't want to break the main transaction if logging fails
    }
  }
}
