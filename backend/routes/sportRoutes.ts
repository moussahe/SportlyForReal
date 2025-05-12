import { Router } from 'express';
import { sportController } from '../controllers/sportController';

const router = Router();

// Routes pour les sports
router.get('/', sportController.getAllSports);
router.get('/:id', sportController.getSportById);

export default router;
