import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { getClientServices } from '../controllers/serviceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateCreateClient, validateUpdateClient, validateClientId, validateClientFilters, handleValidationErrors } from '../validators/clientValidator.js';
import { validateClientIdParam } from '../validators/serviceValidator.js';

const router = express.Router();

// Wrapper para capturar erros em funções assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Todas as rotas precisam de autenticação
router.use(authenticate);

router.get('/', validateClientFilters, handleValidationErrors, asyncHandler(getAllClients));
router.get('/:id', validateClientId, handleValidationErrors, asyncHandler(getClientById));
router.get('/:clientId/services', validateClientIdParam, handleValidationErrors, asyncHandler(getClientServices));
router.post('/', validateCreateClient, handleValidationErrors, asyncHandler(createClient));
router.put('/:id', validateUpdateClient, handleValidationErrors, asyncHandler(updateClient));
router.delete('/:id', validateClientId, handleValidationErrors, asyncHandler(deleteClient));

export default router;
