import express from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Routes protégées
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
