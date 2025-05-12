/**
 * @file config.ts
 * @description Ce fichier est maintenu pour la compatibilité avec l'ancienne structure.
 * Toute la configuration est désormais centralisée dans /src/config.ts
 */

// Re-exporte la configuration depuis le fichier principal
import { CONFIG, EXPO_PUBLIC_API_URL  } from '../config';
export { CONFIG, EXPO_PUBLIC_API_URL  };