import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { AuthUser } from '../../http/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  attendants(actor: AuthUser) {
    if (actor.role !== UserRole.ATENDENTE)
      throw new ForbiddenException('Somente atendentes podem consultar a equipe');
    return this.prisma.user.findMany({
      where: { role: UserRole.ATENDENTE },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }
}
