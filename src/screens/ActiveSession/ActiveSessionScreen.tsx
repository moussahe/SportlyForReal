import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Session, SessionStatus, Team, User } from '../../types';
import { isSessionActive } from '../../utils/sessionUtils';
import colors from '../../theme/colors';

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
  
  // Récupérer les informations de session depuis le store
  const { sessions } = useSelector((state: RootState) => state.sessions || { sessions: [] });
  const session = sessions?.find((s: Session) => s.id === sessionId);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  // États locaux
  const [countdown, setCountdown] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Déterminer si l'utilisateur est l'hôte de la session
  const isHost = session?.host.id === currentUser?.id;

  // Types explicites pour éviter les erreurs TypeScript
  type TeamWithIndex = {
    team: Team;
    index: number;
  };
  
  type PlayerWithTeam = {
    player: User;
    teamId: string;
  };

  useEffect(() => {
    if (!session) return;
    
    // Bloquer le bouton de retour natif
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        "Session en cours",
        "Vous ne pouvez pas quitter une session en cours. La session se terminera automatiquement à l'heure prévue.",
        [{ text: "OK" }]
      );
      return true; // Empêche le comportement par défaut
    });

    // Interval pour mettre à jour le temps restant
    const interval = setInterval(() => {
      if (!session) return;
      
      const activeInfo = isSessionActive(session);
      
      // Si la session n'est plus active, revenir à l'écran d'accueil
    //   if (!activeInfo.isActive) {
    //     // Afficher une alerte de fin de session
    //     Alert.alert(
    //       "Fin de la session",
    //       "La session est maintenant terminée. Merci d'y avoir participé!",
    //       [{ 
    //         text: "OK",
    //         onPress: () => {
    //           clearInterval(interval);
    //           navigation.reset({
    //             index: 0,
    //             routes: [{ name: 'Home' }],
    //           });
    //         }
    //       }]
    //     );
    //     return;
    //   }
      
      setCountdown(activeInfo.remainingMinutes);
      // S'assurer que la progression est entre 0 et 100
      setProgress(Math.min(100, Math.max(0, activeInfo.progressPercent)));
      
    }, 1000);
    
    return () => {
      backHandler.remove();
      clearInterval(interval);
    };
  }, [session, navigation]);

  // Si la session n'a pas été trouvée
  if (!session) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  // Formatage du temps restant
  const formatRemainingTime = (minutes: number): string => {
    if (minutes <= 0) return "Session terminée";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''} restantes`;
    }
    return `${mins} minute${mins > 1 ? 's' : ''} restante${mins > 1 ? 's' : ''}`;
  };

  // Trouver l'équipe du joueur actuel
  const userTeam = session.teams.find((team: Team) => 
    team.players.some((player: User) => player.id === currentUser?.id)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.sportIconContainer}>
            <Text style={styles.sportEmoji}>{session.sport.icon}</Text>
          </View>
          <View>
            <Text style={styles.title}>La session {session.sport.name} commence</Text>
            <Text style={styles.subtitle}>{session.location.address}</Text>
          </View>
        </View>
        <View style={styles.sessionStatus}>
          <Text style={styles.statusText}>EN COURS</Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>{formatRemainingTime(countdown)}</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Équipes */}
        <View style={styles.teamsContainer}>
          <Text style={styles.sectionTitle}>Équipes</Text>
          {session.teams.map((team: Team, index: number) => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>
                  Équipe {index + 1} {userTeam?.id === team.id && "• Votre équipe"}
                </Text>
                <Text style={styles.teamCount}>
                  {team.players.length}/{session.sport.playersPerTeam}
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
              Cette session se terminera automatiquement dans {formatRemainingTime(countdown)}.
            </Text>
            <Text style={styles.infoText}>
              Bonne partie ! N'oubliez pas de noter les participants à la fin de la session.
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
                        // TODO: Appel à l'API pour terminer la session
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
  sessionStatus: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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
