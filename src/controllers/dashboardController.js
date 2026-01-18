import prisma from '../lib/prisma.js';

// Obter estatísticas consolidadas do dashboard
export const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar todos os dados em paralelo para performance
    const [
      totalClients,
      totalServices,
      servicesByStatus,
      revenueData,
      recentClients,
      recentServices
    ] = await Promise.all([
      // Total de clientes
      prisma.client.count({
        where: { userId }
      }),

      // Total de serviços
      prisma.service.count({
        where: {
          client: { userId }
        }
      }),

      // Serviços agrupados por status
      prisma.service.groupBy({
        by: ['status'],
        where: {
          client: { userId }
        },
        _count: { status: true }
      }),

      // Receita total e média de serviços completos
      prisma.service.aggregate({
        where: {
          client: { userId },
          status: 'completed'
        },
        _sum: { price: true },
        _avg: { price: true }
      }),

      // Clientes recentes (últimos 5)
      prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          _count: { 
            select: { services: true } 
          }
        }
      }),

      // Serviços recentes (últimos 10)
      prisma.service.findMany({
        where: {
          client: { userId }
        },
        orderBy: { serviceDate: 'desc' },
        take: 10,
        select: {
          id: true,
          description: true,
          price: true,
          status: true,
          serviceDate: true,
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ]);

    // Processar serviços por status
    const servicesByStatusMap = {};
    servicesByStatus.forEach(item => {
      servicesByStatusMap[item.status] = item._count.status;
    });

    // Calcular receita por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completedServices = await prisma.service.findMany({
      where: {
        client: { userId },
        status: 'completed',
        serviceDate: { gte: sixMonthsAgo }
      },
      select: {
        price: true,
        serviceDate: true
      }
    });

    // Agrupar receita por mês
    const revenueByMonth = {};
    completedServices.forEach(service => {
      const month = service.serviceDate.toISOString().substring(0, 7); // YYYY-MM
      const price = Number(service.price);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + price;
    });

    // Converter para array ordenado
    const revenueByMonthArray = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      summary: {
        totalClients,
        totalServices,
        totalRevenue: Number(revenueData._sum.price || 0).toFixed(2),
        averageServicePrice: Number(revenueData._avg.price || 0).toFixed(2),
        pendingServices: servicesByStatusMap.pending || 0,
        completedServices: servicesByStatusMap.completed || 0,
        cancelledServices: servicesByStatusMap.cancelled || 0
      },
      recentClients,
      recentServices,
      revenueByMonth: revenueByMonthArray,
      servicesByStatus: servicesByStatusMap
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
};

