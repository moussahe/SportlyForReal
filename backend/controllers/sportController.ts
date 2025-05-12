import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sportController = {
  // Récupérer tous les sports
  getAllSports: async (_req: Request, res: Response) => {
    try {
      const sports = await prisma.sport.findMany();
      
      if (!sports || sports.length === 0) {
        return res.status(404).json({ error: 'Aucun sport trouvé' });
      }
      
      return res.status(200).json(sports);
    } catch (error) {
      console.error('Erreur lors de la récupération des sports:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des sports' });
    }
  },

  // Récupérer un sport par son ID
  getSportById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const sport = await prisma.sport.findUnique({
        where: { id }
      });
      
      if (!sport) {
        return res.status(404).json({ error: 'Sport non trouvé' });
      }
      
      return res.status(200).json(sport);
    } catch (error) {
      console.error('Erreur lors de la récupération du sport:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération du sport' });
    }
  }
};
