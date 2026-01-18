// Prisma Client Configuration - Prisma 7
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// No Prisma 7, é necessário usar um adaptador para conexões diretas ao banco
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Desconectar ao encerrar a aplicação
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;