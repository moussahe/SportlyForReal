/**
 * @file types.ts
 * @description Types TypeScript pour la navigation et les modèles de données de l'application Sportly.
 * Ce fichier définit :
 * - Les types pour la navigation (RootStackParamList)
 * - Les interfaces des modèles de données (Session, User, etc.)
 * - Les types pour les différents styles de session et niveaux
 * 
 * @types
 * - RootStackParamList : Définit les routes et leurs paramètres
 * - Session : Structure complète d'une session sportive
 * - Participant : Structure d'un utilisateur participant
 * - Sport : Structure d'un sport
 */

export type RootStackParamList = {
  Main: undefined;
  Lobby: { sessionId: number };
};

export interface Session {
  id: number;
  sport: {
    id: number;
    name: string;
    icon: string;
  };
  host: {
    id: number;
    name: string;
    email: string;
    profilePicture: string;
    bio: string;
  };
  participants: {
    id: number;
    name: string;
    profilePicture: string;
    level: string;
  }[];
  location: string;
  dateTime: Date;
  duration: number;
  maxPlayers: number;
  level: string;
  sessionStyle: 'CHILL' | 'CASUAL' | 'COMPETITIVE' | 'TRAINING';
  title: string;
  description: string;
  rules: string;
  intensity: number;
  status: string;
  tags: string[];
} 