import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { AuthUser } from '../../http/current-user.decorator';
import type { UpdateCategoryDto } from './dto/update-category.dto';
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  list(all: boolean, actor: AuthUser) {
    if (all && actor.role !== UserRole.ATENDENTE) throw new ForbiddenException();
    return this.prisma.category.findMany({
      where: all ? undefined : { active: true },
      orderBy: { name: 'asc' },
    });
  }
  async create(name: string, actor: AuthUser) {
    this.assertAttendant(actor);
    try {
      return await this.prisma.category.create({ data: { name: name.trim() } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictException('Categoria já cadastrada');
      throw error;
    }
  }
  async update(id: string, dto: UpdateCategoryDto, actor: AuthUser) {
    this.assertAttendant(actor);
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.name && { name: dto.name.trim() }) },
    });
  }
  private assertAttendant(actor: AuthUser) {
    if (actor.role !== UserRole.ATENDENTE)
      throw new ForbiddenException('Somente atendentes podem gerenciar categorias');
  }
}
