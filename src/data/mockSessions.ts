import { Session, Sport, User } from '../store/slices/sessionsSlice';
import { mockSports } from './mockSports';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Thomas Dubois',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Passionné de sport et toujours partant pour une session !',
  },
  {
    id: '2',
    name: 'Sophie Martin',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Sportive du dimanche cherchant à progresser',
  },
  {
    id: '3',
    name: 'Lucas Bernard',
    profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Coach sportif certifié, spécialisé en tennis',
  },
  {
    id: '4',
    name: 'Emma Petit',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Ancienne joueuse de basket en compétition',
  },
];

export const mockSessions: Session[] = [
  {
    id: '1',
    sport: mockSports[0], // Football
    host: mockUsers[0],
    participants: [mockUsers[1], mockUsers[2]],
    location: 'Stade Municipal, Paris',
    dateTime: '2024-03-15T14:00:00',
    duration: 90,
    maxPlayers: 10,
    currentPlayers: 3,
    level: 'BEGINNER',
    description: 'Match amical de football pour débutants. Venez vous amuser dans une ambiance décontractée !',
    status: 'UPCOMING'
  },
  {
    id: '2',
    sport: mockSports[1], // Basketball
    host: mockUsers[3],
    participants: [mockUsers[1]],
    location: 'Gymnase Jean Jaurès, Lyon',
    dateTime: '2024-03-16T18:30:00',
    duration: 60,
    maxPlayers: 8,
    currentPlayers: 2,
    level: 'INTERMEDIATE',
    description: 'Session d\'entraînement basket avec exercices techniques et mini-matchs.',
    status: 'UPCOMING'
  },
  {
    id: '3',
    sport: mockSports[2], // Tennis
    host: mockUsers[2],
    participants: [mockUsers[0], mockUsers[3]],
    location: 'Tennis Club de Bordeaux',
    dateTime: '2024-03-17T10:00:00',
    duration: 120,
    maxPlayers: 4,
    currentPlayers: 3,
    level: 'ADVANCED',
    description: 'Double de tennis niveau avancé. Échauffement suivi de matchs.',
    status: 'UPCOMING'
  }
];

export default mockSessions; 