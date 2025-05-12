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
    // En développement
    if (Platform.OS === 'web') {
      // Pour le web, on utilise localhost
      return 'http://localhost:3000/api';
    } else {
      // Pour les appareils mobiles
      // Récupère le manifest Expo pour trouver l'adresse IP du host
      try {
        // Si on est en mode Expo Go
        if (Constants.expoConfig?.hostUri) {
          // Le format est typiquement "192.168.1.x:19000"
          const hostAddress = Constants.expoConfig.hostUri.split(':')[0];
          console.log('Adresse IP détectée automatiquement:', hostAddress);
          return `http://${hostAddress}:3000/api`;
        } else {
          // Fallback sur localhost 
          // Ceci fonctionne dans certains contextes de développement où l'app mobile
          // et le serveur sont sur le même appareil ou avec un port-forwarding
          console.log('Utilisation de localhost pour API mobile');
          return 'http://localhost:3000/api';
        }
      } catch (error) {
        console.warn('Erreur lors de la détection auto de l\'IP, fallback sur localhost:', error);
        return 'http://localhost:3000/api';
      }
    }
  }
  // En production, utiliserait une URL de production
  return 'https://api.sportly.com';
};

// Exporté pour la compatibilité avec les imports existants
export const API_URL = getApiUrl();

// Objet de configuration complet
export const CONFIG = {
  API_URL: getApiUrl(),
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  DEFAULT_TIMEOUT: 10000, // 10 secondes
};