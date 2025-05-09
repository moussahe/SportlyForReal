import express from 'express';
import { sessionController } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/sessions', sessionController.getSessions);

// Routes protégées
router.use(authMiddleware);
router.post('/sessions', sessionController.createSession);
router.post('/sessions/:sessionId/join', sessionController.joinSession);
router.post('/sessions/:sessionId/leave', sessionController.leaveSession);
router.post('/sessions/createSession', sessionController.createSession);

export default router; 