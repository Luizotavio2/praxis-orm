import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Wrapper para capturar erros em funções assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Todas as rotas precisam de autenticação
router.use(authenticate);

router.get('/', asyncHandler(getDashboard));

export default router;

