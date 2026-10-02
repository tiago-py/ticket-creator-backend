import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequestStatus, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthUser } from '../../http/current-user.decorator';
import { RequestPolicy } from '../../domain/request-policy';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
const include = {
  requester: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
} as const;
@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateRequestDto, actor: AuthUser) {
    const categoryName = dto.category.trim();
    return this.prisma.request.create({
      data: {
        code: `SOL-${randomUUID().slice(0, 8).toUpperCase()}`,
        title: dto.title.trim(),
        description: dto.description.trim(),
        requester: { connect: { id: actor.id } },
        category: {
          connectOrCreate: { where: { name: categoryName }, create: { name: categoryName } },
        },
      },
      include,
    });
  }
  async list(query: ListRequestsDto, actor: AuthUser) {
    const where: Prisma.RequestWhereInput = {};
    if (actor.role === UserRole.SOLICITANTE) where.requesterId = actor.id;
    if (query.q)
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { code: { contains: query.q, mode: 'insensitive' } },
      ];
    if (query.status) where.status = query.status;
    if (query.category) where.category = { name: query.category };
    if (query.from || query.to)
      where.createdAt = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(`${query.to}T23:59:59.999Z`) }),
      };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.request.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
      this.prisma.request.count({ where }),
    ]);
    return {
      data,
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.size)),
    };
  }
  async get(id: string, actor: AuthUser) {
    const item = await this.prisma.request.findUnique({ where: { id }, include });
    if (!item) throw new NotFoundException('Solicitação não encontrada');
    RequestPolicy.assertCanRead(actor, item.requesterId);
    return item;
  }
  async update(id: string, dto: UpdateRequestDto, actor: AuthUser) {
    const item = await this.prisma.request.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Solicitação não encontrada');
    RequestPolicy.assertOwner(actor, item.requesterId);
    return this.prisma.request.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description && { description: dto.description.trim() }),
        ...(dto.category && {
          category: {
            connectOrCreate: {
              where: { name: dto.category.trim() },
              create: { name: dto.category.trim() },
            },
          },
        }),
      },
      include,
    });
  }
  async remove(id: string, actor: AuthUser) {
    const item = await this.prisma.request.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Solicitação não encontrada');
    RequestPolicy.assertOwner(actor, item.requesterId);
    await this.prisma.request.delete({ where: { id } });
  }
  async updateStatus(id: string, status: RequestStatus, actor: AuthUser) {
    const item = await this.prisma.request.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Solicitação não encontrada');
    RequestPolicy.assertStatusTransition(actor, item.status, status);
    return this.prisma.request.update({ where: { id }, data: { status }, include });
  }
}
