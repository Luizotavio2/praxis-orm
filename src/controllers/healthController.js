import prisma from '../lib/prisma.js';

// Health check completo com verificação de banco de dados
export const healthCheck = async (req, res) => {
  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'OK',
      message: 'API funcionando',
      database: {
        status: 'connected',
        provider: 'postgresql'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Se não conseguir conectar ao banco
    res.status(503).json({
      status: 'ERROR',
      message: 'API funcionando mas banco de dados não acessível',
      database: {
        status: 'disconnected',
        error: process.env.NODE_ENV === 'production' 
          ? 'Erro de conexão' 
          : error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

