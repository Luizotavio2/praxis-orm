import express from 'express';
import {
  getAllServices,
  getServiceById,
  getClientServices,
  createService,
  updateService,
  updateServiceStatus,
  deleteService
} from '../controllers/serviceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  validateCreateService,
  validateUpdateService,
  validateUpdateServiceStatus,
  validateServiceId,
  validateClientIdParam,
  validateServiceFilters,
  handleValidationErrors
} from '../validators/serviceValidator.js';

const router = express.Router();

// Wrapper para capturar erros em funções assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Rotas de serviços (recurso independente)
router.get('/', validateServiceFilters, handleValidationErrors, asyncHandler(getAllServices));
router.get('/:id', validateServiceId, handleValidationErrors, asyncHandler(getServiceById));
router.post('/', validateCreateService, handleValidationErrors, asyncHandler(createService));
router.put('/:id', validateUpdateService, handleValidationErrors, asyncHandler(updateService));
router.patch('/:id/status', validateUpdateServiceStatus, handleValidationErrors, asyncHandler(updateServiceStatus));
router.delete('/:id', validateServiceId, handleValidationErrors, asyncHandler(deleteService));

export default router;

