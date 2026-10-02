import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }
  async create(name: string) {
    try {
      return await this.prisma.category.create({ data: { name: name.trim() } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictException('Categoria já cadastrada');
      throw error;
    }
  }
}
