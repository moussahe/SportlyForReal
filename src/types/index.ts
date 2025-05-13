export enum Level {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum SessionStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  level: Record<string, Level>;
  createdAt: string;
  updatedAt: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  teamsCount: number;
  playersPerTeam: number;
  indoor: boolean;
  equipment: string[];
  popularLocations: string[];
}

export interface Team {
  id: string;
  name: string;
  players: User[];
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  city: string;
  coordinates: Coordinates;
}

export interface Session {
  id: string;
  sport: Sport;
  host: User;
  participants: User[];
  teams: Team[];
  location: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  dateTime: string;
  duration: number;
  maxPlayers: number;
  level: Level;
  description: string;
  status: SessionStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  sessions: SessionsState;
}

export interface SportSession {
  id: number;
  sport: Sport;
  host: User;
  participants: User[];
  location: string;
  dateTime: string;
  duration: number;
  maxPlayers: number;
  level: Level;
  description?: string;
  status: SessionStatus;
}

export interface Workout {
  id: number;
  title: string;
  description: string;
  duration: number; // en minutes
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  type: 'cardio' | 'musculation' | 'yoga' | 'autre';
  exercises: Exercise[];
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  sets: number;
  reps: number;
  restTime: number; // en secondes
  image?: string;
}

export interface WorkoutProgress {
  id: number;
  userId: number;
  workoutId: number;
  date: Date;
  completed: boolean;
  duration: number; // temps réel en minutes
  feedback?: string;
  rating?: number; // 1-5
} 