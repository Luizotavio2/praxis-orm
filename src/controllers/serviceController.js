import prisma from '../lib/prisma.js';

// Listar todos os serviços do usuário logado (com busca, filtros e paginação)
export const getAllServices = async (req, res) => {
    try {
        const { clientId, status, search, page = 1, limit = 20, startDate, endDate } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Construir filtro base
        const where = {
            client: {
                userId: req.userId
            }
        };

        // Filtros opcionais
        if (clientId) {
            where.clientId = parseInt(clientId);
        }

        if (status) {
            where.status = status;
        }

        // Busca por descrição
        if (search && search.trim() !== '') {
            where.description = {
                contains: search.trim(),
                mode: 'insensitive'
            };
        }

        // Filtro por data (range)
        if (startDate || endDate) {
            where.serviceDate = {};
            if (startDate) {
                where.serviceDate.gte = new Date(startDate);
            }
            if (endDate) {
                where.serviceDate.lte = new Date(endDate);
            }
        }

        // Buscar total de registros (para paginação)
        const total = await prisma.service.count({ where });

        const services = await prisma.service.findMany({
            where,
            orderBy: {
                serviceDate: 'desc'
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip,
            take: limitNum
        });

        res.status(200).json({
            data: services,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços' });
    }
};

// Buscar serviço específico do usuário logado
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                client: {
                    userId: req.userId
                }
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        if (!service) {
            return res.status(404).json({
                error: 'Serviço não encontrado ou não pertence a você'
            });
        }

        res.status(200).json(service);
    } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
};

// Listar serviços de um cliente específico
export const getClientServices = async (req, res) => {
    try {
        const { clientId } = req.params;
        const clientIdInt = parseInt(clientId);

        if (isNaN(clientIdInt)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        // Verificar se o cliente pertence ao usuário
        const client = await prisma.client.findFirst({
            where: {
                id: clientIdInt,
                userId: req.userId
            }
        });

        if (!client) {
            return res.status(404).json({
                error: 'Cliente não encontrado ou não pertence a você'
            });
        }

        const services = await prisma.service.findMany({
            where: {
                clientId: clientIdInt
            },
            orderBy: {
                serviceDate: 'desc'
            }
        });

        res.status(200).json(services);
    } catch (error) {
        console.error('Erro ao buscar serviços do cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços do cliente' });
    }
};

// Criar novo serviço
export const createService = async (req, res) => {
    try {
        const { clientId, description, price, serviceDate, status } = req.body;
        const clientIdInt = parseInt(clientId);

        if (isNaN(clientIdInt)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        // Verificar se o cliente pertence ao usuário
        const client = await prisma.client.findFirst({
            where: {
                id: clientIdInt,
                userId: req.userId
            }
        });

        if (!client) {
            return res.status(404).json({
                error: 'Cliente não encontrado ou não pertence a você'
            });
        }

        const service = await prisma.service.create({
            data: {
                description: description.trim(),
                price: parseFloat(price),
                serviceDate: new Date(serviceDate),
                status: status || 'pending',
                clientId: clientIdInt
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ error: 'Erro ao criar serviço' });
    }
};

// Atualizar serviço
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, price, serviceDate, status } = req.body;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o serviço pertence ao usuário
        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                client: {
                    userId: req.userId
                }
            }
        });

        if (!existingService) {
            return res.status(404).json({
                error: 'Serviço não encontrado ou não pertence a você'
            });
        }

        // Preparar dados para atualização
        const updateData = {};
        if (description !== undefined) updateData.description = description.trim();
        if (price !== undefined) updateData.price = parseFloat(price);
        if (serviceDate !== undefined) updateData.serviceDate = new Date(serviceDate);
        if (status !== undefined) updateData.status = status;

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: updateData,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(service);
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
};

// Atualizar apenas o status do serviço
export const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o serviço pertence ao usuário
        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                client: {
                    userId: req.userId
                }
            }
        });

        if (!existingService) {
            return res.status(404).json({
                error: 'Serviço não encontrado ou não pertence a você'
            });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status é obrigatório' });
        }

        const validStatuses = ['pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Status inválido. Use: ${validStatuses.join(', ')}`
            });
        }

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: { status },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(service);
    } catch (error) {
        console.error('Erro ao atualizar status do serviço:', error);
        res.status(500).json({ error: 'Erro ao atualizar status do serviço' });
    }
};

// Deletar serviço
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceId = parseInt(id);

        if (isNaN(serviceId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o serviço pertence ao usuário
        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                client: {
                    userId: req.userId
                }
            }
        });

        if (!existingService) {
            return res.status(404).json({
                error: 'Serviço não encontrado ou não pertence a você'
            });
        }

        await prisma.service.delete({
            where: { id: serviceId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar serviço:', error);
        res.status(500).json({ error: 'Erro ao deletar serviço' });
    }
};
