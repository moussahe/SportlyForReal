import { User, Session } from './slices/sessionsSlice';
import { mockSports } from '../data/mockSports';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
  bio: 'Passionné de sport et de bien-être'
};

export const mockSessions: Session[] = [
  {
    id: '1',
    sport: mockSports[0],
    host: mockUser,
    participants: [mockUser],
    location: 'Stade Municipal',
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Demain
    duration: 90,
    maxPlayers: 10,
    currentPlayers: 1,
    level: 'BEGINNER',
    description: 'Match amical de football à 5 contre 5',
    status: 'UPCOMING'
  },
  {
    id: '2',
    sport: mockSports[1],
    host: mockUser,
    participants: [mockUser],
    location: 'Gymnase Central',
    dateTime: new Date(Date.now() + 172800000).toISOString(), // Dans 2 jours
    duration: 60,
    maxPlayers: 6,
    currentPlayers: 1,
    level: 'INTERMEDIATE',
    description: 'Session de basket débutant, apprentissage des bases',
    status: 'UPCOMING'
  },
  {
    id: '3',
    sport: mockSports[2],
    host: mockUser,
    participants: [mockUser],
    location: 'Club de Tennis',
    dateTime: new Date(Date.now() + 259200000).toISOString(), // Dans 3 jours
    duration: 45,
    maxPlayers: 4,
    currentPlayers: 1,
    level: 'ADVANCED',
    description: 'Entraînement avancé de tennis',
    status: 'UPCOMING'
  }
]; 