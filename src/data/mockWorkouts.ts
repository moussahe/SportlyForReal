import { Difficulty, WorkoutType } from '@prisma/client';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes
  sets?: number;
  reps?: number;
  restTime?: number; // en secondes
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  sport: string;
  duration: number; // en minutes
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'MIXED';
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export const mockWorkouts = [
  {
    id: "workout1",
    title: "Entraînement Football - Débutant",
    description: "Session d'initiation au football avec exercices de base",
    sport: "Football",
    duration: 60,
    difficulty: Difficulty.EASY,
    type: WorkoutType.MIXED,
    exercises: [
      {
        name: "Échauffement",
        description: "Course légère et étirements dynamiques",
        duration: 10
      },
      {
        name: "Passes courtes",
        description: "Exercices de passes courtes en binôme",
        duration: 15,
        sets: 3,
        reps: 10,
        restTime: 60
      },
      {
        name: "Conduite de balle",
        description: "Parcours de slalom avec le ballon",
        duration: 15,
        sets: 4,
        restTime: 45
      },
      {
        name: "Mini-match",
        description: "Match à effectif réduit",
        duration: 20
      }
    ],
    createdAt: new Date("2024-03-01T08:00:00Z"),
    updatedAt: new Date("2024-03-01T08:00:00Z")
  },
  {
    id: "workout2",
    title: "Entraînement Basketball - Intermédiaire",
    description: "Session de perfectionnement en basketball",
    sport: "Basketball",
    duration: 75,
    difficulty: Difficulty.MEDIUM,
    type: WorkoutType.MIXED,
    exercises: [
      {
        name: "Échauffement spécifique",
        description: "Exercices de mobilité et dribbles",
        duration: 15
      },
      {
        name: "Tirs en course",
        description: "Layups et tirs en mouvement",
        duration: 20,
        sets: 4,
        reps: 8,
        restTime: 45
      },
      {
        name: "Exercices de passes",
        description: "Passes en mouvement et jeu rapide",
        duration: 20,
        sets: 3,
        reps: 12,
        restTime: 30
      },
      {
        name: "Jeu réduit",
        description: "3 contre 3 sur demi-terrain",
        duration: 20
      }
    ],
    createdAt: new Date("2024-03-01T09:00:00Z"),
    updatedAt: new Date("2024-03-01T09:00:00Z")
  },
  {
    id: "workout3",
    title: "Entraînement Tennis - Avancé",
    description: "Session intensive de tennis pour joueurs avancés",
    sport: "Tennis",
    duration: 90,
    difficulty: Difficulty.HARD,
    type: WorkoutType.MIXED,
    exercises: [
      {
        name: "Échauffement technique",
        description: "Échanges de fond de court et mobilité",
        duration: 15
      },
      {
        name: "Service et retour",
        description: "Travail spécifique sur le service et le retour",
        duration: 25,
        sets: 5,
        reps: 10,
        restTime: 60
      },
      {
        name: "Jeu au filet",
        description: "Volées et approches",
        duration: 25,
        sets: 4,
        reps: 8,
        restTime: 45
      },
      {
        name: "Points disputés",
        description: "Situations de match avec contraintes",
        duration: 25
      }
    ],
    createdAt: new Date("2024-03-01T10:00:00Z"),
    updatedAt: new Date("2024-03-01T10:00:00Z")
  }
]; 