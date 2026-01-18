import { body, param, query, validationResult } from 'express-validator';

// Validação para criar serviço
export const validateCreateService = [
  body('clientId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro válido'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 3, max: 500 })
    .withMessage('Descrição deve ter entre 3 e 500 caracteres'),
  
  body('price')
    .notEmpty()
    .withMessage('Preço é obrigatório')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  
  body('serviceDate')
    .notEmpty()
    .withMessage('Data do serviço é obrigatória')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)'),
  
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, completed ou cancelled'),
];

// Validação para atualizar serviço
export const validateUpdateService = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Descrição não pode estar vazia')
    .isLength({ min: 3, max: 500 })
    .withMessage('Descrição deve ter entre 3 e 500 caracteres'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  
  body('serviceDate')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)'),
  
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, completed ou cancelled'),
];

// Validação para atualizar apenas status
export const validateUpdateServiceStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido'),
  
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, completed ou cancelled'),
];

// Validação para ID de parâmetro
export const validateServiceId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido'),
];

// Validação para ID de cliente em parâmetro
export const validateClientIdParam = [
  param('clientId')
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro válido'),
];

// Validação para query parameters (filtros)
export const validateServiceFilters = [
  query('clientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('clientId deve ser um número inteiro válido'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, completed ou cancelled'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Busca deve ter entre 1 e 255 caracteres'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve estar no formato ISO 8601'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final deve estar no formato ISO 8601'),
];

// Middleware para tratar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array() 
    });
  }
  next();
};

