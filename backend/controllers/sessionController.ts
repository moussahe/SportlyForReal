import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sessionController = {
  // Créer une nouvelle session
  createSession: async (req: Request, res: Response) => {
    try {
      const { sportId, location, dateTime, duration, maxPlayers, level, description } = req.body;
      const hostId = req.user?.id; // À implémenter avec l'authentification

      const session = await prisma.sportSession.create({
        data: {
          sport: { connect: { id: sportId } },
          host: { connect: { id: hostId } },
          location,
          dateTime: new Date(dateTime),
          duration,
          maxPlayers,
          level,
          description,
        },
        include: {
          sport: true,
          host: true,
          participants: true,
        },
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la création de la session' });
    }
  },

  // Obtenir toutes les sessions disponibles
  getSessions: async (req: Request, res: Response) => {
    try {
      const { sport, level, date, location } = req.query;
      
      const sessions = await prisma.sportSession.findMany({
        where: {
          status: 'OPEN',
          sportId: sport ? Number(sport) : undefined,
          level: level ? level as any : undefined,
          dateTime: date ? { gte: new Date(date as string) } : undefined,
          location: location ? { contains: location as string } : undefined,
        },
        include: {
          sport: true,
          host: true,
          participants: true,
        },
      });

      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la récupération des sessions' });
    }
  },

  // Rejoindre une session
  joinSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id; // À implémenter avec l'authentification

      const session = await prisma.sportSession.update({
        where: { id: Number(sessionId) },
        data: {
          participants: {
            connect: { id: userId },
          },
        },
        include: {
          participants: true,
        },
      });

      // Vérifier si la session est pleine
      if (session.participants.length >= session.maxPlayers) {
        await prisma.sportSession.update({
          where: { id: Number(sessionId) },
          data: { status: 'FULL' },
        });
      }

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la participation à la session' });
    }
  },

  // Quitter une session
  leaveSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id; // À implémenter avec l'authentification

      const session = await prisma.sportSession.update({
        where: { id: Number(sessionId) },
        data: {
          participants: {
            disconnect: { id: userId },
          },
          status: 'OPEN', // Réouvrir la session si quelqu'un la quitte
        },
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors du départ de la session' });
    }
  },
}; 