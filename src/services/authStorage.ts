import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'sportly_auth_token';
const USER_DATA_KEY = 'sportly_user_data';

export const authStorage = {
  // Sauvegarder le token et les données utilisateur
  storeAuthData: async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
      return false;
    }
  },

  // Récupérer le token
  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  // Récupérer les données utilisateur
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  },

  // Effacer les données d'authentification lors de la déconnexion
  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des données d\'authentification:', error);
      return false;
    }
  }
};
