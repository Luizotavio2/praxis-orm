# CRM API

API REST para gerenciamento de clientes e serviços.

## Pré-requisitos

- Node.js 18+
- PostgreSQL ou Prisma Accelerate

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 3. Configurar banco de dados
npm run prisma:generate
npm run prisma:migrate

# 4. Iniciar servidor
npm run dev  # desenvolvimento
# ou
npm start    # produção
```

## Variáveis de Ambiente

Configure no arquivo `.env`:

| Variável | Obrigatório | Descrição |
|----------|------------|-----------|
| `DATABASE_URL` | Sim | URL do PostgreSQL ou Prisma Accelerate |
| `JWT_SECRET` | Sim (produção) | Segredo para tokens JWT |
| `PORT` | Sim | Porta do servidor (padrão: 3000) |
| `FRONTEND_URL` | Não | URL do frontend para CORS |

## Autenticação

Todas as rotas (exceto `/api/auth/*` e `/health`) requerem autenticação JWT.

**Como obter token:**
1. Registrar: `POST /api/auth/register`
2. Login: `POST /api/auth/login`

**Como usar o token:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Postman:**
- Aba "Authorization" → "Bearer Token" → Cole o token

## Rotas da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Obter usuário atual |

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clients` | Listar clientes |
| GET | `/api/clients/:id` | Buscar cliente |
| GET | `/api/clients/:clientId/services` | Serviços do cliente |
| POST | `/api/clients` | Criar cliente |
| PUT | `/api/clients/:id` | Atualizar cliente |
| DELETE | `/api/clients/:id` | Deletar cliente |

**Query Parameters (GET /api/clients):**
- `search` - Buscar por nome
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20, máx: 100)

### Serviços

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/services` | Listar serviços |
| GET | `/api/services/:id` | Buscar serviço |
| POST | `/api/services` | Criar serviço |
| PUT | `/api/services/:id` | Atualizar serviço |
| PATCH | `/api/services/:id/status` | Atualizar status |
| DELETE | `/api/services/:id` | Deletar serviço |

**Query Parameters (GET /api/services):**
- `clientId` - Filtrar por cliente
- `status` - Filtrar por status (pending, completed, cancelled)
- `search` - Buscar por descrição
- `startDate` - Data inicial (ISO 8601)
- `endDate` - Data final (ISO 8601)
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20, máx: 100)

### Dashboard

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Estatísticas consolidadas |

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status da API e banco |

## Exemplos de Requisições

### Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Senha123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Senha123"
  }'
```

### Criar Cliente

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "note": "Cliente importante"
  }'
```

### Listar Clientes com Busca

```bash
curl -X GET "http://localhost:3000/api/clients?search=João&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Serviço

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "clientId": 1,
    "description": "Desenvolvimento de site",
    "price": 5000.00,
    "serviceDate": "2024-02-01T10:00:00.000Z",
    "status": "pending"
  }'
```

### Obter Dashboard

```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Respostas de Erro

A API retorna erros em formato JSON:

```json
{
  "error": "Mensagem de erro"
}
```

**Códigos HTTP:**
- `200` - Sucesso
- `201` - Criado
- `204` - Sem conteúdo (delete)
- `400` - Erro de validação
- `401` - Não autenticado
- `404` - Não encontrado
- `409` - Conflito
- `500` - Erro interno

## Validações Importantes

- **Email:** Deve ser válido e único
- **Senha:** Mínimo 6 caracteres, deve conter letra maiúscula, minúscula e número
- **Status de Serviço:** `pending`, `completed` ou `cancelled`
- **Datas:** Formato ISO 8601 (ex: `2024-02-01T10:00:00.000Z`)
