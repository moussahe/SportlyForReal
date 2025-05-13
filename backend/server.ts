import express from 'express';
import cors from 'cors';
import { PrismaClient, SessionStatus, Level } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import sportRoutes from './routes/sportRoutes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Sportly' });
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sports', sportRoutes);

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await prisma.sportSession.findMany({
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
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.get('/api/workouts', async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      include: {
        exercises: true,
      },
    });
    res.json(workouts);
  } catch (error) {
    console.error('Erreur /api/workouts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entraînements' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        sports: true,
        level: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Erreur /api/users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Route pour créer une nouvelle session
app.post('/api/sessions', async (req, res) => {
  const { sportId, hostId, location, dateTime, duration, maxPlayers, level, description } = req.body;

  try {
    // Récupérer le sport pour connaître le nombre d'équipes nécessaires
    const sport = await prisma.sport.findUnique({
      where: { id: sportId }
    });

    if (!sport) {
      return res.status(404).json({ error: 'Sport non trouvé' });
    }

    const sessionId = uuidv4();
    
    // Créer la session avec les équipes
    const session = await prisma.sportSession.create({
      data: {
        id: sessionId,
        sport: { connect: { id: sportId } },
        host: { connect: { id: hostId } },
        location,
        dateTime: new Date(dateTime),
        duration: parseInt(duration),
        maxPlayers: parseInt(maxPlayers),
        level: level as Level,
        description,
        status: SessionStatus.UPCOMING,
        teams: {
          create: Array.from({ length: sport.teamsCount }, (_, i) => ({
            id: uuidv4(),
            name: `Équipe ${i + 1}`
          }))
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

    res.json(session);
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
});

// Mise à jour de la route pour rejoindre une session
app.post('/api/sessions/:sessionId/join', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, teamId } = req.body;

    if (!userId || !teamId) {
      return res.status(400).json({ error: 'userId et teamId sont requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si la session existe
    const session = await prisma.sportSession.findUnique({
      where: { id: sessionId },
      include: {
        sport: true,
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
      // Si l'utilisateur est déjà dans une équipe, on le change d'équipe
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
        return res.json(updatedSession);
      }
      return res.status(400).json({ error: 'Déjà participant à cette session' });
    }

    // Vérifier si la session n'est pas pleine
    if (session.participants.length >= session.maxPlayers) {
      return res.status(400).json({ error: 'Session complète' });
    }

    // Vérifier si l'équipe existe
    const team = session.teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }

    // Vérifier si l'équipe n'est pas pleine
    if (team.players.length >= session.sport.playersPerTeam) {
      return res.status(400).json({ error: 'Équipe complète' });
    }

    // Ajouter l'utilisateur aux participants et à l'équipe
    const updatedSession = await prisma.sportSession.update({
      where: { id: sessionId },
      data: {
        participants: {
          connect: { id: userId }
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
        }
      },
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

    res.json(updatedSession);
  } catch (error) {
    console.error('Erreur /api/sessions/:sessionId/join:', error);
    res.status(500).json({ error: 'Erreur lors de la participation à la session' });
  }
});

// Route pour obtenir les détails d'une session spécifique
app.get('/api/sessions/:sessionId', async (req, res) => {
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
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            bio: true,
          },
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
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    res.json(session);
  } catch (error) {
    console.error('Erreur /api/sessions/:sessionId:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
  }
});

// Route pour quitter une session
app.delete('/api/sessions/:sessionId/leave', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, teamId } = req.body;
    
    console.log('🔄 Tentative de quitter la session:', { sessionId, userId, teamId });

    if (!userId || !teamId) {
      return res.status(400).json({ error: 'userId et teamId sont requis' });
    }

    // Mise à jour directe sans vérifications complexes
    const updatedSession = await prisma.sportSession.update({
      where: { id: sessionId },
      data: {
        participants: {
          disconnect: { id: userId }
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
        }
      },
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

    console.log('✅ Utilisateur retiré avec succès');
    res.json(updatedSession);
  } catch (error) {
    console.error('❌ Erreur lors du retrait de la session:', error);
    res.status(500).json({ error: 'Erreur lors du retrait de la session' });
  }
});

// Middleware de gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur globale:', err.stack);
  res.status(500).json({ error: 'Une erreur est survenue sur le serveur' });
});

// Middleware pour les routes non trouvées
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: `Route ${req.url} non trouvée` });
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur en cours d'exécution sur http://0.0.0.0:${port}`);
});