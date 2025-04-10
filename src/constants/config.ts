/**
 * @file config.ts
 * @description Configuration globale de l'application Sportly
 * Centralise les variables d'environnement et les configurations
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Détermine l'URL de l'API en fonction de l'environnement
const getApiUrl = () => {
  if (__DEV__) {
    // En développement, utilise l'IP locale pour permettre l'accès depuis les appareils mobiles
    return Platform.OS === 'web' 
      ? 'http://localhost:3000/api'
      : 'http://192.168.1.32:3000/api';
  }
  // En production, utiliserait une URL de production
  return 'https://api.sportly.com';
};

export const CONFIG = {
  API_URL: getApiUrl(),
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  DEFAULT_TIMEOUT: 10000, // 10 secondes
}; 