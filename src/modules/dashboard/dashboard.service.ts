import { Injectable } from '@nestjs/common';
import { RequestStatus, UserRole } from '@prisma/client';
import type { AuthUser } from '../../http/current-user.decorator';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(actor: AuthUser) {
    const where =
      actor.role === UserRole.SOLICITANTE
        ? { requesterId: actor.id, deletedAt: null }
        : { deletedAt: null };
    const [total, open, inProgress, completed] = await this.prisma.$transaction([
      this.prisma.request.count({ where }),
      this.prisma.request.count({ where: { ...where, status: RequestStatus.ABERTO } }),
      this.prisma.request.count({ where: { ...where, status: RequestStatus.EM_ATENDIMENTO } }),
      this.prisma.request.count({ where: { ...where, status: RequestStatus.CONCLUIDO } }),
    ]);
    return { total, open, inProgress, completed };
  }
}
