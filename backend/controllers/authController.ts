import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sportly_secret_key_to_change';
const JWT_EXPIRES_IN = '7d';

export const authController = {
  // Inscription d'un nouvel utilisateur
  signup: async (req: Request, res: Response) => {
    try {
      const { email, name, password, profilePicture = '', bio = '' } = req.body;

      // Vérification que l'email est unique
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Création de l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          id: uuidv4(), // Génération d'un UUID unique
          email,
          name,
          password: hashedPassword,
          profilePicture: profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200&bold=true&format=png`,
          bio: bio || `Bonjour, je suis ${name} et j'utilise Sportly !`,
          sports: [],
          level: {}, // Map vide pour les niveaux par sport
        },
      });

      // Génération du token JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Renvoyer l'utilisateur sans le mot de passe et avec le token
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ 
        error: 'Une erreur est survenue lors de l\'inscription',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Connexion d'un utilisateur
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Rechercher l'utilisateur par email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Renvoyer l'utilisateur sans le mot de passe et avec le token
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ 
        error: 'Une erreur est survenue lors de la connexion',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Récupérer les informations de l'utilisateur connecté
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          hostedSessions: true,
          participations: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Renvoyer l'utilisateur sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ 
        error: 'Une erreur est survenue lors de la récupération du profil',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },
};
