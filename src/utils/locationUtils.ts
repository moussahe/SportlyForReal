import * as Location from 'expo-location';

/**
 * Calcule un score de pertinence entre un lieu et un terme de recherche
 * Plus le score est élevé, plus le lieu est pertinent
 */
export const calculateLocationRelevance = (
  location: { address: string; city: string },
  searchTerm: string
): number => {
  const searchTermLower = searchTerm.toLowerCase().trim();
  const addressLower = location.address.toLowerCase();
  const cityLower = location.city.toLowerCase();

  let score = 0;

  // Correspondance exacte avec la ville (score le plus élevé)
  if (cityLower === searchTermLower) {
    score += 100;
  }
  // La ville commence par le terme recherché
  else if (cityLower.startsWith(searchTermLower)) {
    score += 80;
  }
  // Le terme recherché est contenu dans la ville
  else if (cityLower.includes(searchTermLower)) {
    score += 60;
  }

  // Correspondance exacte avec l'adresse
  if (addressLower === searchTermLower) {
    score += 50;
  }
  // L'adresse commence par le terme recherché
  else if (addressLower.startsWith(searchTermLower)) {
    score += 40;
  }
  // Le terme recherché est contenu dans l'adresse
  else if (addressLower.includes(searchTermLower)) {
    score += 30;
  }

  // Bonus pour les correspondances de mots complets
  const searchWords = searchTermLower.split(/\s+/);
  const addressWords = addressLower.split(/\s+/);
  const cityWords = cityLower.split(/\s+/);

  searchWords.forEach(word => {
    if (word.length > 2) { // Ignorer les mots trop courts
      if (cityWords.includes(word)) {
        score += 10;
      }
      if (addressWords.includes(word)) {
        score += 5;
      }
    }
  });

  return score;
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calcule la distance en kilomètres entre deux points GPS
 * Utilise la formule de Haversine
 */
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

/**
 * Vérifie et demande les permissions de géolocalisation
 * Retourne true si l'utilisateur a accordé la permission, false sinon
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erreur lors de la demande de permission de géolocalisation:', error);
    return false;
  }
};

/**
 * Obtient la position actuelle de l'utilisateur
 * Retourne une promesse avec les coordonnées
 * Fournit des coordonnées par défaut pour le web ou en cas d'erreur
 * Vérifie d'abord les permissions
 */
export const getCurrentPosition = async (): Promise<{
  coords: Coordinates;
  permissionGranted: boolean;
}> => {
  // Coordonnées par défaut (Paris)
  const defaultCoordinates: Coordinates = {
    latitude: 48.8566,
    longitude: 2.3522
  };

  try {
    // Vérification des permissions (sans afficher de popup)
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('📍 Permission de géolocalisation non accordée');
      return {
        coords: defaultCoordinates,
        permissionGranted: false
      };
    }

    // Obtention de la position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      permissionGranted: true
    };
  } catch (error) {
    console.log('📍 Erreur de géolocalisation, utilisation des coordonnées par défaut', error);
    return {
      coords: defaultCoordinates,
      permissionGranted: false
    };
  }
};

/**
 * Formate une distance en texte lisible
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${Math.round(distance * 10) / 10} km`;
};

/**
 * Convertit une adresse en coordonnées GPS
 * Utilise l'API de géocodification d'Expo Location
 * @param address Adresse à géocoder
 * @param city Ville de l'adresse
 * @returns Promise<Coordinates | null> Coordonnées GPS ou null si échec
 */
export const geocodeAddress = async (address: string, city: string): Promise<Coordinates | null> => {
  try {
    const searchAddress = `${address}, ${city}`;
    console.log(`🔍 Géocodage de l'adresse: ${searchAddress}`);
    
    const result = await Location.geocodeAsync(searchAddress);
    
    if (result && result.length > 0) {
      const { latitude, longitude } = result[0];
      console.log(`✅ Coordonnées trouvées: ${latitude}, ${longitude}`);
      return { latitude, longitude };
    }
    
    console.log('❌ Aucun résultat trouvé pour cette adresse');
    return null;
  } catch (error) {
    console.error('❌ Erreur lors du géocodage:', error);
    return null;
  }
};