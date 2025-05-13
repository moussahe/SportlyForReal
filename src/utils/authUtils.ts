import { logout } from '../store/slices/authSlice';
import { store } from '../store/store';

/**
 * Vérifie si l'erreur est liée à l'authentification (401 Unauthorized)
 * @param error L'erreur à vérifier
 * @returns true si l'erreur est liée à l'authentification
 */
export const isAuthError = (error: any): boolean => {
  // Vérifier le code de statut HTTP
  if (error?.response?.status === 401) {
    return true;
  }
  
  // Vérifier le message d'erreur
  if (error?.message?.includes('401') || 
      error?.message?.includes('Unauthorized') || 
      error?.message?.includes('Token non fourni') || 
      error?.message?.includes('Token invalide') ||
      error?.message?.includes('Token expiré')) {
    return true;
  }
  
  return false;
};

/**
 * Gère une erreur d'authentification en déconnectant l'utilisateur
 * @param error L'erreur à gérer
 */
export const handleAuthError = (error: any): void => {
  if (isAuthError(error)) {
    console.warn('❌ Erreur d\'authentification détectée, déconnexion...');
    // Déconnecter l'utilisateur
    store.dispatch(logout());
  }
};
