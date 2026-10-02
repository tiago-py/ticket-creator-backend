import 'reflect-metadata';
import { UserRole } from '@prisma/client';
import type { AuthUser } from '../../http/current-user.decorator';
import type { PrismaService } from '../../infrastructure/database/prisma.service';
import { ListRequestsDto } from './dto/list-requests.dto';
import { RequestsService } from './requests.service';
describe('RequestsService', () => {
  const findMany = jest.fn(),
    count = jest.fn(),
    create = jest.fn();
  const transaction = jest.fn((values: Promise<unknown>[]) => Promise.all(values));
  const prisma = {
    request: { findMany, count, create },
    $transaction: transaction,
  } as unknown as PrismaService;
  const service = new RequestsService(prisma);
  beforeEach(() => jest.clearAllMocks());
  it('cria solicitação vinculada ao usuário e com categoria extensível', async () => {
    create.mockResolvedValue({ id: '1' });
    const actor: AuthUser = {
      id: 'user-1',
      name: 'Marina',
      email: 'm@e.com',
      role: UserRole.SOLICITANTE,
    };
    await service.create(
      { title: 'Novo acesso', description: 'Preciso de acesso ao sistema.', category: 'Jurídico' },
      actor,
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requester: { connect: { id: 'user-1' } },
          category: {
            connectOrCreate: { where: { name: 'Jurídico' }, create: { name: 'Jurídico' } },
          },
        }),
      }),
    );
  });
  it('restringe a consulta do solicitante ao próprio id', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    const actor: AuthUser = {
      id: 'user-1',
      name: 'Marina',
      email: 'm@e.com',
      role: UserRole.SOLICITANTE,
    };
    await service.list(new ListRequestsDto(), actor);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { requesterId: 'user-1' } }),
    );
  });
  it('não restringe a consulta do atendente por autor', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    const actor: AuthUser = {
      id: 'agent',
      name: 'Tiago',
      email: 't@e.com',
      role: UserRole.ATENDENTE,
    };
    await service.list(new ListRequestsDto(), actor);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });
});
