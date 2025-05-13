import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  AppState,
  AppStateStatus
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Session, SessionStatus, Team, User } from '../../types';
import { getSessionTimeInfo } from '../../utils/sessionUtils';
import colors from '../../theme/colors';
import { updateSessionStatus, checkAndUpdateSessionStatus } from '../../store/slices/sessionsSlice';

// Type pour les paramètres de route
export type RootStackParamList = {
  Home: undefined;
  Lobby: { sessionId: string };
  ActiveSession: { sessionId: string };
  Profile: undefined;
  CreateSession: undefined;
};

type ActiveSessionRouteProp = RouteProp<RootStackParamList, 'ActiveSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const ActiveSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ActiveSessionRouteProp>();
  const { sessionId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const appState = useRef(AppState.currentState);
  
  // Récupérer les informations de session depuis le store
  const { sessions, currentSession } = useSelector((state: RootState) => state.sessions);
  const session = sessions && sessions.length > 0 
    ? sessions.find((s: Session) => s.id === sessionId) 
    : null;
  
  const activeSession = session || currentSession;
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  const [timeInfo, setTimeInfo] = useState({
    remainingMinutes: 0,
    progress: 0,
    formattedTime: '',
    isSessionEnding: false
  });

  const isHost = activeSession?.host.id === currentUser?.id;

  // Formatage du temps restant
  const formatRemainingTime = useCallback((minutes: number, seconds?: number): string => {
    if (minutes <= 0 && (!seconds || seconds <= 0)) return "Session terminée";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Si on a moins d'une minute restante et qu'on a des secondes, les afficher
    if (mins === 0 && seconds !== undefined && seconds > 0) {
      return `${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''} restantes`;
    }
    return `${mins} minute${mins > 1 ? 's' : ''} restante${mins > 1 ? 's' : ''}`;
  }, []);

  // Vérification du statut de la session
  const checkSessionStatus = useCallback(() => {
    if (!activeSession) return;
    
    const info = getSessionTimeInfo(activeSession);
    
    // Calculer les minutes et secondes à partir des secondes totales
    const remainingMinutes = Math.floor(info.timeUntilEndExact / 60);
    const remainingSeconds = info.timeUntilEndExact % 60;
    
    setTimeInfo({
      remainingMinutes: remainingMinutes,
      progress: info.progress,
      // Si moins d'une minute, afficher en secondes pour plus de précision
      formattedTime: remainingMinutes === 0 
        ? formatRemainingTime(0, remainingSeconds)
        : formatRemainingTime(remainingMinutes),
      isSessionEnding: info.shouldEndNow
    });

    // Vérification automatique du statut
    dispatch(checkAndUpdateSessionStatus(activeSession.id));
    
    if (info.shouldEndNow && activeSession.status === SessionStatus.IN_PROGRESS) {
      Alert.alert(
        "Session terminée",
        "La session est maintenant terminée. Merci d'avoir participé !",
        [
          {
            text: "OK",
            onPress: () => {
              dispatch(updateSessionStatus({ sessionId: activeSession.id, status: SessionStatus.TERMINATED }));
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]
      );
    }
  }, [activeSession, navigation, dispatch, formatRemainingTime]);

  // Gestion des changements d'état de l'application (premier plan, arrière-plan)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkSessionStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkSessionStatus]);

  // Effet pour vérifier régulièrement le statut de la session
  useEffect(() => {
    if (!activeSession) return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        "Session en cours",
        "Vous ne pouvez pas quitter une session en cours. La session se terminera automatiquement à l'heure prévue.",
        [{ text: "OK" }]
      );
      return true;
    });

    // Vérification initiale
    checkSessionStatus();

    // Intervalle pour les vérifications de statut côté serveur (moins fréquent)
    const statusInterval = setInterval(() => {
      checkSessionStatus();
    }, 10000);

    // Intervalle pour les mises à jour de l'UI (plus fréquent pour un compteur précis)
    const uiUpdateInterval = setInterval(() => {
      if (!activeSession) return;
      
      const info = getSessionTimeInfo(activeSession);
      setTimeInfo(prev => ({
        ...prev,
        remainingMinutes: info.timeUntilEnd,
        progress: info.progress,
        formattedTime: formatRemainingTime(info.timeUntilEnd)
      }));
    }, 1000);

    return () => {
      backHandler.remove();
      clearInterval(statusInterval);
      clearInterval(uiUpdateInterval);
    };
  }, [activeSession, navigation, dispatch, checkSessionStatus, formatRemainingTime]);

  useFocusEffect(
    useCallback(() => {
      checkSessionStatus();
      return () => {};
    }, [checkSessionStatus])
  );

  if (!activeSession) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  const userTeam = activeSession.teams.find((team: Team) => 
    team.players.some((player: User) => player.id === currentUser?.id)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.sportIconContainer}>
            <Text style={styles.sportEmoji}>{activeSession.sport.icon}</Text>
          </View>
          <View>
            <Text style={styles.title}>Session {activeSession.sport.name} en cours</Text>
            <Text style={styles.subtitle}>{activeSession.location.address}</Text>
          </View>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${timeInfo.progress}%` }]} />
        <Text style={styles.progressText}>{timeInfo.formattedTime}</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Équipes */}
        <View style={styles.teamsContainer}>
          <Text style={styles.sectionTitle}>Équipes</Text>
          {activeSession.teams.map((team: Team, index: number) => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>
                  Équipe {index + 1} {userTeam?.id === team.id && "• Votre équipe"}
                </Text>
                <Text style={styles.teamCount}>
                  {team.players.length}/{activeSession.sport.playersPerTeam}
                </Text>
              </View>
              <View style={styles.playersContainer}>
                {team.players.map((player: User) => (
                  <View 
                    key={player.id} 
                    style={[
                      styles.playerBadge, 
                      player.id === currentUser?.id && styles.currentPlayerBadge
                    ]}
                  >
                    <Text style={[
                      styles.playerName,
                      player.id === currentUser?.id && styles.currentPlayerName
                    ]}>
                      {player.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Cette session se terminera automatiquement dans {timeInfo.formattedTime}.
            </Text>
            <Text style={styles.infoText}>
              Bonne partie !
            </Text>
          </View>
        </View>

        {/* Pour l'hôte uniquement - Option d'arrêt prématuré */}
        {isHost && (
          <View style={styles.hostControls}>
            <Text style={styles.sectionTitle}>Contrôles d'hôte</Text>
            <TouchableOpacity 
              style={styles.endButton}
              onPress={() => {
                Alert.alert(
                  "Terminer la session",
                  "Êtes-vous sûr de vouloir terminer cette session maintenant ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { 
                      text: "Terminer", 
                      style: "destructive",
                      onPress: () => {
                        dispatch(updateSessionStatus({ sessionId: activeSession.id, status: SessionStatus.TERMINATED }));
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Home' }],
                        });
                      } 
                    }
                  ]
                );
              }}
            >
              <Ionicons name="stop-circle" size={20} color="white" />
              <Text style={styles.endButtonText}>Terminer la session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressContainer: {
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text.primary,
  },
  teamsContainer: {
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  teamCount: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currentPlayerBadge: {
    backgroundColor: colors.primary,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  currentPlayerName: {
    color: 'white',
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  hostControls: {
    marginTop: 'auto',
  },
  endButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  endButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ActiveSessionScreen;
