import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { loadSavedAuth } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';
import colors from '../theme/colors';

// Composant qui s'occupe de charger les données d'authentification au démarrage de l'application
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Charger les données d'authentification sauvegardées
        await dispatch(loadSavedAuth());
        console.log('🔐 Initialisation de l\'authentification terminée');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.light }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
