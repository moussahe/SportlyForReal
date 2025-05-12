/**
 * @file config.ts
 * @description Configuration globale de l'application Sportly
 * Centralise les variables d'environnement et les configurations
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHost = (): string => {
  // Expo SDK ≥ 49 : expoConfig.hostUri
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // ex: "192.168.1.42:19000"
    return hostUri.split(':')[0];
  }
  // Ultime fallback
  return 'localhost';
};

const getApiUrl = (): string => {
  if (__DEV__) {
    // pour web, on reste sur localhost
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }
    // mobile (iOS/Android) : on prend l'IP du bundler
    const host = getDevHost();
    console.log('API dev@', host);
    return `http://${host}:3000/api`;
  }
  // production
  return 'https://api.sportly.com';
};

export const API_URL = getApiUrl();

export const CONFIG = {
  API_URL,
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  DEFAULT_TIMEOUT: 10000,
};
