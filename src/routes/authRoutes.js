import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../validators/userValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Wrapper para capturar erros em funções assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.post('/register', validateRegister, handleValidationErrors, asyncHandler(register));
router.post('/login', validateLogin, handleValidationErrors, asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getCurrentUser));

export default router;

