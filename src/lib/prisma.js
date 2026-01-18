// Prisma Client Configuration - Prisma 7
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Verificar se está usando Prisma Accelerate ou conexão direta
const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma+');

let prisma;

if (isAccelerate) {
  // Usar Prisma Accelerate - não precisa de adaptador
  prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });
} else {
  // Usar conexão direta com adaptador PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Erro no Pool do PostgreSQL:', err);
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
  });

  // Fechar pool ao encerrar
  process.on('beforeExit', async () => {
    await pool.end();
  });
}

// Conectar explicitamente ao banco
prisma.$connect().catch(() => {
  // Erro silencioso - será tratado nas queries
});

// Desconectar ao encerrar a aplicação
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    // Erro silencioso
  }
});

export default prisma;

