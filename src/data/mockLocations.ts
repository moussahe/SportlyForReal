import { Location } from '../types';

export const mockLocations: Location[] = [
  // Paris
  {
    address: "20 Rue de la Roquette",
    city: "Paris",
    coordinates: {
      latitude: 48.8553,
      longitude: 2.3724
    }
  },
  {
    address: "115 Rue Oberkampf",
    city: "Paris",
    coordinates: {
      latitude: 48.8651,
      longitude: 2.3783
    }
  },
  {
    address: "45 Rue des Martyrs",
    city: "Paris",
    coordinates: {
      latitude: 48.8789,
      longitude: 2.3404
    }
  },
  // Lyon
  {
    address: "20 Place des Terreaux",
    city: "Lyon",
    coordinates: {
      latitude: 45.7675,
      longitude: 4.8335
    }
  },
  {
    address: "86 Rue Masséna",
    city: "Lyon",
    coordinates: {
      latitude: 45.7677,
      longitude: 4.8498
    }
  },
  {
    address: "12 Rue de la République",
    city: "Lyon",
    coordinates: {
      latitude: 45.7628,
      longitude: 4.8360
    }
  },
  // Marseille
  {
    address: "42 Rue de la République",
    city: "Marseille",
    coordinates: {
      latitude: 43.2969,
      longitude: 5.3745
    }
  },
  {
    address: "28 Rue Paradis",
    city: "Marseille",
    coordinates: {
      latitude: 43.2951,
      longitude: 5.3778
    }
  },
  // Bordeaux
  {
    address: "15 Rue Sainte-Catherine",
    city: "Bordeaux",
    coordinates: {
      latitude: 44.8412,
      longitude: -0.5738
    }
  },
  {
    address: "45 Cours de l'Argonne",
    city: "Bordeaux",
    coordinates: {
      latitude: 44.8486,
      longitude: -0.5584
    }
  },
  // Lille
  {
    address: "100 Rue Léon Gambetta",
    city: "Lille",
    coordinates: {
      latitude: 50.6311,
      longitude: 3.0504
    }
  },
  {
    address: "32 Rue de la Monnaie",
    city: "Lille",
    coordinates: {
      latitude: 50.6366,
      longitude: 3.0635
    }
  },
  // Nantes
  {
    address: "2 Rue de la Marne",
    city: "Nantes",
    coordinates: {
      latitude: 47.2144,
      longitude: -1.5499
    }
  },
  {
    address: "4 Place du Commerce",
    city: "Nantes",
    coordinates: {
      latitude: 47.2137,
      longitude: -1.5583
    }
  },
  // Toulouse
  {
    address: "24 Rue Saint-Rome",
    city: "Toulouse",
    coordinates: {
      latitude: 43.6044,
      longitude: 1.4436
    }
  }
];

// Fonction utilitaire pour obtenir une adresse aléatoire
export const getRandomLocation = (): Location => {
  return mockLocations[Math.floor(Math.random() * mockLocations.length)];
};

// Fonction pour obtenir les adresses d'une ville spécifique
export const getLocationsByCity = (city: string): Location[] => {
  return mockLocations.filter(location => 
    location.city.toLowerCase() === city.toLowerCase()
  );
};

// Fonction pour obtenir l'adresse la plus proche d'une position donnée
export const getNearestLocation = (coordinates: { latitude: number; longitude: number }): Location => {
  return mockLocations.reduce((nearest, current) => {
    const distanceToNearest = calculateDistance(coordinates, nearest.coordinates);
    const distanceToCurrent = calculateDistance(coordinates, current.coordinates);
    return distanceToCurrent < distanceToNearest ? current : nearest;
  }, mockLocations[0]);
};

// Fonction utilitaire pour calculer la distance entre deux points
const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
}; 