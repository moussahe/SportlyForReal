import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import { RootState, AppDispatch } from '../store/store';
import { checkAndUpdateSessionStatus } from '../store/slices/sessionsSlice';
import { Session, SessionStatus } from '../types';
import { determineSessionStatus } from '../utils/timeUtils';

/**
 * Composant qui gère le cycle de vie des sessions automatiquement
 * et redirige l'utilisateur vers l'écran ActiveSession lorsqu'une session commence
 */
const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation<any>(); // Type any pour permettre la navigation vers n'importe quel écran
  const dispatch = useDispatch<AppDispatch>();
  const appState = useRef(AppState.currentState);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Récupérer les sessions et l'utilisateur courant du store Redux
  const sessions = useSelector((state: RootState) => state.sessions.sessions);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const auth = useSelector((state: RootState) => state.auth);
  const isAuthenticated = auth?.isAuthenticated;

  // Fonction memoizée pour vérifier l'état de toutes les sessions concernant l'utilisateur
  const checkSessionsStatus = useCallback(() => {
    if (!isAuthenticated || !currentUser || !sessions?.length) return;

    console.log('Vérification des statuts de session...');

    // Filtrer les sessions auxquelles l'utilisateur participe
    const userSessions = sessions.filter(session => 
      session.participants.some(participant => participant.id === currentUser.id) || 
      session.host.id === currentUser.id
    );

    // Pour chaque session, vérifier et mettre à jour le statut si nécessaire
    userSessions.forEach(session => {
      // Vérifier d'abord si la session devrait être en cours ou terminée
      const statusInfo = determineSessionStatus(session);
      
      if ((session.status === SessionStatus.UPCOMING && statusInfo.shouldStart) || 
          (session.status === SessionStatus.IN_PROGRESS && !statusInfo.shouldEnd)) {
        
        // Si la session est en cours mais pas encore marquée comme telle, la mettre à jour
        dispatch(checkAndUpdateSessionStatus(session.id))
          .unwrap()
          .then((updatedSession: Session | null) => {
            if (updatedSession && updatedSession.status === SessionStatus.IN_PROGRESS) {
              redirectToActiveSession(updatedSession);
            }
          })
          .catch(error => {
            console.error('Erreur lors de la vérification du statut de session:', error);
          });
      }
    });

    // Vérifier s'il y a des sessions déjà en cours
    const activeSession = userSessions.find(session => 
      session.status === SessionStatus.IN_PROGRESS && 
      !determineSessionStatus(session).shouldEnd
    );
    
    if (activeSession) {
      redirectToActiveSession(activeSession);
    }
  }, [sessions, currentUser, isAuthenticated, dispatch]);

  // Fonction pour rediriger l'utilisateur vers l'écran ActiveSession
  const redirectToActiveSession = useCallback((session: Session) => {
    // Vérifier si l'utilisateur n'est pas déjà sur l'écran ActiveSession pour cette session
    const currentRoute = navigation.getCurrentRoute();
    if (currentRoute && 
        currentRoute.name === 'ActiveSession' && 
        currentRoute.params?.sessionId === session.id) {
      return; // L'utilisateur est déjà sur l'écran ActiveSession pour cette session
    }

    console.log(`Redirection vers la session active ${session.id}`);
    
    // Rediriger l'utilisateur vers l'écran ActiveSession avec un reset pour éviter les problèmes de navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'ActiveSession', params: { sessionId: session.id } }
        ],
      })
    );
  }, [navigation]);

  // Effet pour surveiller les changements d'état de l'application et vérifier les sessions
  useEffect(() => {
    // Ne rien faire si l'utilisateur n'est pas connecté
    if (!isAuthenticated) return;

    console.log('SessionManager: Configuration des vérifications automatiques de sessions');

    // Vérifier les sessions immédiatement au démarrage
    checkSessionsStatus();

    // Configurer l'intervalle pour vérifier régulièrement les statuts des sessions
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    checkIntervalRef.current = setInterval(checkSessionsStatus, 20000); // Vérifier toutes les 20 secondes

    // Surveiller les changements d'état de l'application
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // L'application est revenue au premier plan, vérifier les sessions immédiatement
        console.log('App revenue au premier plan, vérification des sessions...');
        checkSessionsStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      subscription.remove();
    };
  }, [sessions, currentUser, isAuthenticated, checkSessionsStatus]);

  // Rendre les enfants normalement
  return <>{children}</>;
};

export default SessionManager;
