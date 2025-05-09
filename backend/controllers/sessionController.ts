import { Request, Response } from 'express';
import { PrismaClient, Level, SessionStatus } from '@prisma/client';

// Étendre la définition Express.Request pour le type correct
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // Correction 1: Type ID comme string au lieu de number
        email: string;
      };
    }
  }
}

const prisma = new PrismaClient();

export const sessionController = {
  // Créer une nouvelle session
  createSession: async (req: Request, res: Response) => {
    try {
      const { sportId, location, dateTime, duration, maxPlayers, level, description } = req.body;
      const hostId = req.user?.id;

      if (!hostId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      // Récupérer le sport pour connaître le nombre d'équipes nécessaires
      const sport = await prisma.sport.findUnique({
        where: { id: sportId }
      });

      if (!sport) {
        return res.status(404).json({ error: 'Sport non trouvé' });
      }

      // Générer un ID unique pour la session
      const sessionId = `session_${Date.now()}`;
      
      // Créer la session avec les équipes
      const session = await prisma.sportSession.create({
        data: {
          id: sessionId,
          sport: { connect: { id: sportId } },
          host: { connect: { id: hostId } },
          location,
          dateTime: new Date(dateTime),
          duration: parseInt(String(duration)),
          maxPlayers: parseInt(String(maxPlayers)),
          level: level as Level,
          description,
          status: SessionStatus.UPCOMING,
          // Correction 2: Ajouter la création des équipes
          teams: {
            create: Array.from({ length: sport.teamsCount }, (_, i) => ({
              id: `team_${Date.now()}_${i}`,
              name: `Équipe ${i + 1}`
            }))
          }
        },
        include: {
          sport: true,
          host: true,
          participants: true,
          teams: true
        },
      });

      res.json(session);
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      res.status(400).json({ 
        error: 'Erreur lors de la création de la session', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Obtenir toutes les sessions disponibles
  getSessions: async (req: Request, res: Response) => {
    try {
      const { sport, level, date, location } = req.query;
      
      // Correction 3: Améliorer la recherche par location
      const sessions = await prisma.sportSession.findMany({
        where: {
          status: 'UPCOMING',
          sportId: sport ? String(sport) : undefined,
          level: level ? level as any : undefined,
          dateTime: date ? { gte: new Date(date as string) } : undefined,
          // La recherche par location JSON est plus complexe
          ...(location ? {
            location: {
              path: ['address'],
              string_contains: location as string,
            }
          } : {})
        },
        include: {
          sport: true,
          host: true,
          participants: true,
        },
      });

      res.json(sessions);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      res.status(400).json({ 
        error: 'Erreur lors de la récupération des sessions',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Rejoindre une session
  joinSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { teamId } = req.body; // Correction 4: Extraire teamId du body
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }
      
      if (!teamId) {
        return res.status(400).json({ error: 'ID d\'équipe requis' });
      }

      // Vérifier si la session existe et récupérer ses détails
      const session = await prisma.sportSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: true,
          teams: {
            include: {
              players: true
            }
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session non trouvée' });
      }

      // Vérifier si l'utilisateur n'est pas déjà participant
      if (session.participants.some(p => p.id === userId)) {
        // Si déjà dans une équipe, le changer d'équipe
        const currentTeam = session.teams.find(t => t.players.some(p => p.id === userId));
        if (currentTeam && currentTeam.id !== teamId) {
          // Changer d'équipe
          const updatedSession = await prisma.sportSession.update({
            where: { id: sessionId },
            data: {
              teams: {
                update: [
                  {
                    where: { id: currentTeam.id },
                    data: {
                      players: {
                        disconnect: { id: userId }
                      }
                    }
                  },
                  {
                    where: { id: teamId },
                    data: {
                      players: {
                        connect: { id: userId }
                      }
                    }
                  }
                ]
              }
            },
            include: {
              sport: true,
              host: true,
              participants: true,
              teams: {
                include: {
                  players: true
                }
              }
            }
          });
          return res.json(updatedSession);
        }
        return res.status(400).json({ error: 'Déjà participant à cette session' });
      }

      // Vérifier si la session n'est pas pleine
      if (session.participants.length >= session.maxPlayers) {
        return res.status(400).json({ error: 'Session complète' });
      }

      // Ajouter l'utilisateur aux participants et à l'équipe
      const updatedSession = await prisma.sportSession.update({
        where: { id: sessionId },
        data: {
          participants: {
            connect: { id: userId },
          },
          teams: {
            update: {
              where: { id: teamId },
              data: {
                players: {
                  connect: { id: userId }
                }
              }
            }
          },
          // Correction 5: Mise à jour du statut en fonction du nombre de joueurs
          ...(session.participants.length + 1 >= session.maxPlayers ? { status: SessionStatus.IN_PROGRESS } : {})
        },
        include: {
          sport: true,
          host: true,
          participants: true,
          teams: {
            include: {
              players: true
            }
          }
        },
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Erreur lors de la participation à la session:', error);
      res.status(400).json({ 
        error: 'Erreur lors de la participation à la session',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Quitter une session
  leaveSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { teamId } = req.body; // Correction 4: Extraire teamId du body
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }
      
      if (!teamId) {
        return res.status(400).json({ error: 'ID d\'équipe requis' });
      }

      const session = await prisma.sportSession.update({
        where: { id: sessionId },
        data: {
          participants: {
            disconnect: { id: userId },
          },
          teams: {
            update: {
              where: { id: teamId },
              data: {
                players: {
                  disconnect: { id: userId }
                }
              }
            }
          },
          status: SessionStatus.UPCOMING, // Réouvrir la session si quelqu'un la quitte
        },
        include: {
          sport: true,
          host: true,
          participants: true,
          teams: {
            include: {
              players: true
            }
          }
        },
      });

      res.json(session);
    } catch (error) {
      console.error('Erreur lors du départ de la session:', error);
      res.status(400).json({ 
        error: 'Erreur lors du départ de la session',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },
};