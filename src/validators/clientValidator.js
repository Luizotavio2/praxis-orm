import { body, param, query, validationResult } from 'express-validator';

// Validação para criar cliente
export const validateCreateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Telefone contém caracteres inválidos'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Nota deve ter no máximo 5000 caracteres'),
];

// Validação para atualizar cliente
export const validateUpdateClient = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode estar vazio')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Telefone contém caracteres inválidos'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Nota deve ter no máximo 5000 caracteres'),
];

// Validação para ID de parâmetro
export const validateClientId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro válido'),
];

// Validação para query parameters (busca e paginação)
export const validateClientFilters = [
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
