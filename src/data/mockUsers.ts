import { User } from '../store/slices/sessionsSlice';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Thomas Dubois',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Passionné de sport et coach personnel',
  },
  {
    id: '2',
    name: 'Marie Laurent',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Athlète amateur, spécialiste en course à pied',
  },
  {
    id: '3',
    name: 'Lucas Martin',
    profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Joueur de football passionné',
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
    bio: 'Instructrice de yoga et méditation',
  },
  {
    id: '5',
    name: 'Antoine Petit',
    profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
    bio: 'Basketteur et entraîneur',
  },
]; 