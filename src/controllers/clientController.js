import prisma from '../lib/prisma.js';

// Listar todos os clientes do usuário logado (com busca e paginação)
export const getAllClients = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Construir filtro
        const where = {
            userId: req.userId
        };

        // Busca por nome
        if (search && search.trim() !== '') {
            where.name = {
                contains: search.trim(),
                mode: 'insensitive'
            };
        }

        // Buscar total de registros (para paginação)
        const total = await prisma.client.count({ where });

        // Buscar clientes
        const clients = await prisma.client.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { services: true }
                }
            },
            skip,
            take: limitNum
        });

        res.status(200).json({
            data: clients,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
};

// Buscar cliente específico do usuário logado
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = parseInt(id);
        
        if (isNaN(clientId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: req.userId
            },
            include: {
                services: {
                    orderBy: {
                        serviceDate: 'desc'
                    }
                }
            }
        });

        if (!client) {
            return res.status(404).json({ 
                error: 'Cliente não encontrado ou não pertence a você' 
            });
        }

        res.status(200).json(client);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
};

// Criar novo cliente (sempre associado ao usuário logado)
export const createClient = async (req, res) => {
    try {
        const { name, phone, note } = req.body;

        // Validação básica
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const client = await prisma.client.create({
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
                note: note?.trim() || null,
                userId: req.userId  // ✅ Corrigido: usar req.userId
            },
            include: {
                _count: {
                    select: { services: true }
                }
            }
        });

        res.status(201).json(client);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
};

// Atualizar cliente (apenas se pertencer ao usuário logado)
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, note } = req.body;
        const clientId = parseInt(id);

        if (isNaN(clientId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o cliente existe e pertence ao usuário
        const existingClient = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: req.userId
            }
        });

        if (!existingClient) {
            return res.status(404).json({ 
                error: 'Cliente não encontrado' 
            });
        }

        // Preparar dados para atualização
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone?.trim() || null;
        if (note !== undefined) updateData.note = note?.trim() || null;

        const client = await prisma.client.update({
            where: { id: clientId },
            data: updateData,
            include: {
                _count: {
                    select: { services: true }
                }
            }
        });

        res.status(200).json(client);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
};

// Deletar cliente (apenas se pertencer ao usuário logado)
export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = parseInt(id);

        if (isNaN(clientId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Verificar se o cliente existe e pertence ao usuário
        const existingClient = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: req.userId
            }
        });

        if (!existingClient) {
            return res.status(404).json({ 
                error: 'Cliente não encontrado ou não pertence a você' 
            });
        }

        // Deletar cliente (os serviços serão deletados em cascade)
        await prisma.client.delete({
            where: { id: clientId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
};
