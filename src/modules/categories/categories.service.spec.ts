import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { AuthUser } from '../../http/current-user.decorator';
import type { PrismaService } from '../../infrastructure/database/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const findMany = jest.fn();
  const prisma = { category: { findMany } } as unknown as PrismaService;
  const service = new CategoriesService(prisma);
  const requester = { id: '1', role: UserRole.SOLICITANTE } as AuthUser;
  const attendant = { id: '2', role: UserRole.ATENDENTE } as AuthUser;

  it('lista somente categorias ativas para uso comum', async () => {
    findMany.mockResolvedValue([]);
    await service.list(false, requester);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true } }));
  });

  it('restringe a administração de categorias a atendentes', () => {
    expect(() => service.list(true, requester)).toThrow(ForbiddenException);
    expect(() => service.list(true, attendant)).not.toThrow();
  });
});
