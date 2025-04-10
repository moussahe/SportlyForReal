export interface Session {
  id: string;
  sport: string;
  hostId: string;
  hostName: string;
  hostProfilePicture?: string;
  location: string;
  dateTime: string;
  duration: number;
  maxPlayers: number;
  currentPlayers: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  description: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  participants: {
    id: string;
    name: string;
    profilePicture?: string;
  }[];
} 