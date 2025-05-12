/**
 * @file config.ts
 * @description Ce fichier est maintenu pour la compatibilité avec l'ancienne structure.
 * Toute la configuration est désormais centralisée dans /src/config.ts
 */

// Re-exporte la configuration depuis le fichier principal
import { CONFIG, API_URL } from '../config';
export { CONFIG, API_URL };