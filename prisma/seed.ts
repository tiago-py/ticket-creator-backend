import 'dotenv/config';
import { PrismaClient, RequestStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);
  const requester = await prisma.user.upsert({
    where: { email: 'marina@empresa.com' },
    update: {},
    create: {
      name: 'Marina Costa',
      email: 'marina@empresa.com',
      passwordHash,
      role: UserRole.SOLICITANTE,
    },
  });
  await prisma.user.upsert({
    where: { email: 'tiago@empresa.com' },
    update: {},
    create: {
      name: 'Tiago Almeida',
      email: 'tiago@empresa.com',
      passwordHash,
      role: UserRole.ATENDENTE,
    },
  });
  for (const name of ['TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura'])
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  const category = await prisma.category.findUniqueOrThrow({ where: { name: 'TI' } });
  await prisma.request.upsert({
    where: { code: 'SOL-0001' },
    update: {},
    create: {
      code: 'SOL-0001',
      title: 'Acesso ao dashboard comercial',
      description: 'Solicito acesso ao dashboard comercial para acompanhar os indicadores do time.',
      status: RequestStatus.ABERTO,
      requesterId: requester.id,
      categoryId: category.id,
    },
  });
}
main().finally(async () => prisma.$disconnect());
