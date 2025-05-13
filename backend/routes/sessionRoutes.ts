import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sessionController } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

const router = express.Router();

// Routes publiques
router.get('/', sessionController.getSessions);

// Routes protégées
router.use(authMiddleware);
router.post('/', sessionController.createSession);
router.post('/:sessionId/join', sessionController.joinSession);
router.post('/:sessionId/leave', sessionController.leaveSession);
router.patch('/:sessionId/status', sessionController.updateSessionStatus);
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.sportSession.findUnique({
      where: { id: sessionId },
      include: {
        sport: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            bio: true,
          }
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            bio: true,
          }
        },
        teams: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                bio: true,
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    res.json(session);
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
  }
});

export default router; 