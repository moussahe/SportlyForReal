import { Sport } from '../types';

export const mockSports: Sport[] = [
  {
    id: '393dfffc-6533-43ba-80d7-ba8f773c337c',
    name: 'Football',
    icon: '⚽️',
    description: 'Le football est un sport d\'équipe joué entre deux équipes de onze joueurs avec un ballon sphérique.',
    minPlayers: 6,
    maxPlayers: 22,
    teamsCount: 2,
    playersPerTeam: 11,
    indoor: false,
    equipment: ['ballon', 'protège-tibias', 'crampons'],
    popularLocations: ['Stade', 'Terrain municipal', 'City stade']
  },
  {
    id: '445a2ac5-3595-4dfb-861e-e014dec95503',
    name: 'Basketball',
    icon: '🏀',
    description: 'Le basketball est un sport d\'équipe qui se joue avec un ballon et un panier fixé à 3,05 mètres de hauteur.',
    minPlayers: 4,
    maxPlayers: 10,
    teamsCount: 2,
    playersPerTeam: 5,
    indoor: true,
    equipment: ['ballon', 'panier'],
    popularLocations: ['Gymnase', 'Terrain extérieur']
  },
  {
    id: 'f3b69416-aeca-483e-b5be-231e7baef280',
    name: 'Padel',
    icon: '🎾',
    description: 'Le padel est un sport de raquette dérivé du tennis, se jouant sur un court plus petit, encadré de murs et grillages.',
    minPlayers: 2,
    maxPlayers: 4,
    teamsCount: 2,
    playersPerTeam: 2,
    indoor: true,
    equipment: ['raquette de padel', 'balles de padel'],
    popularLocations: ['Club de padel', 'Centre sportif']
  }
];