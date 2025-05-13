/**
 * @file LobbyScreen.tsx
 * @description Écran de lobby pour une session sportive dans l'application Sportly.
 * Ce composant affiche les détails d'une session, incluant :
 * - Informations générales (sport, date, lieu, durée)
 * - Niveau et style de la session avec badges visuels
 * - Description et règles de la session
 * - Profil de l'organisateur
 * - Liste des participants avec leurs niveaux
 * - Barre d'intensité interactive
 * - Tags thématiques
 * - Bouton pour rejoindre la session
 * 
 * @component LobbyScreen
 * @route /lobby/:sessionId
 * @uses LinearGradient - Pour les effets visuels dégradés
 * @uses EXPO_PUBLIC_API_URL  - Pour la récupération des données de session
 * @theme Utilise les couleurs thématiques : #F78800, #FFB65C, #FFE0BA, #FFF2E3
 */

import React, { useEffect, useState } from 'react';

// native
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// theme
import colors from '../../theme/colors';

// expo
import { Ionicons } from '@expo/vector-icons';

// redux
import { useDispatch, useSelector } from 'react-redux';

// utils
import { formatDate } from '../../utils/dateUtils';
import { isTeamLocked } from '../../utils/sessionUtils';

// navigation
import { RootStackParamList } from '../../navigation/MainStack';

// store
import { RootState, AppDispatch } from '../../store/store';
import { fetchSessionById, joinSession, leaveSession, clearCurrentSession } from '../../store/slices/sessionsSlice';

type LobbyScreenRouteProp = RouteProp<RootStackParamList, 'Lobby'>;
type LobbyScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface TeamDisplayProps {
  name: string;
  players: any[];
  maxPlayers: number;
  currentUserId: string;
  onJoinTeam?: () => void;
  onLeaveTeam?: () => void;
  isLoading?: boolean;
  isTeamLeaveDisabled?: boolean;
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ 
  name, 
  players, 
  maxPlayers, 
  currentUserId,
  onJoinTeam,
  onLeaveTeam,
  isLoading,
  isTeamLeaveDisabled = false
}) => {
  const isUserInTeam = players?.some(player => player.id === currentUserId);
  const animatedScale = useState(new Animated.Value(1))[0];
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.teamContainer}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{name}</Text>
        <View style={styles.teamCountBadge}>
          <Text style={styles.teamCount}>{players?.length || 0}/{maxPlayers}</Text>
        </View>
      </View>
      
      <View style={styles.playersList}>
        {players?.map((player) => (
          <View key={player.id} style={styles.playerItem}>
            <Image 
              source={{ uri: player.profilePicture }} 
              style={styles.playerAvatar}
            />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerLevelBadge}>
                <Text style={styles.playerLevel}>
                  {player.level?.[player.sport?.id || 'general'] || 'BEGINNER'}
                </Text>
              </View>
            </View>
          </View>
        ))}
        
        {isUserInTeam ? (
          <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <TouchableOpacity 
              style={[
                styles.teamButton, 
                styles.leaveTeamButton,
                isTeamLeaveDisabled && styles.disabledButton
              ]} 
              onPress={onLeaveTeam}
              disabled={isLoading || isTeamLeaveDisabled}
              onPressIn={!isTeamLeaveDisabled ? handlePressIn : undefined}
              onPressOut={!isTeamLeaveDisabled ? handlePressOut : undefined}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <>
                  <Ionicons name="exit-outline" size={18} color={isTeamLeaveDisabled ? 'rgba(255,255,255,0.5)' : colors.text.white} style={{ marginRight: 6 }} />
                  <Text style={[styles.leaveTeamButtonText, isTeamLeaveDisabled && styles.disabledButtonText]}>
                    {isTeamLeaveDisabled ? "Équipe verrouillée" : "Quitter l'équipe"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          (!players || players.length < maxPlayers) && onJoinTeam && (
            <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
              <TouchableOpacity 
                style={[styles.teamButton, styles.joinTeamButton]} 
                onPress={onJoinTeam}
                disabled={isLoading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.text.white} />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={18} color={colors.text.white} style={{ marginRight: 6 }} />
                    <Text style={styles.joinTeamButtonText}>Rejoindre l'équipe</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )
        )}
      </View>
    </View>
  );
};

export const LobbyScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LobbyScreenNavigationProp>();
  const route = useRoute<LobbyScreenRouteProp>();
  const { currentSession, loading, error } = useSelector((state: RootState) => state.sessions);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isJoiningTeam, setIsJoiningTeam] = useState<string | null>(null);
  const [isLeavingTeam, setIsLeavingTeam] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isTeamLeaveDisabled, setIsTeamLeaveDisabled] = useState<boolean>(false);
  
  // Vérifier si les équipes sont verrouillées (1 heure avant le début de la session)
  useEffect(() => {
    if (currentSession) {
      const teamLockStatus = isTeamLocked(currentSession);
      setIsTeamLeaveDisabled(teamLockStatus.isTeamLocked);
      
      // Si les équipes sont verrouillées, afficher une alerte une seule fois
      if (teamLockStatus.isTeamLocked) {
        if (teamLockStatus.minutesRemaining > 0) {
          Alert.alert(
            "Équipes verrouillées",
            `Les équipes sont maintenant verrouillées car la session commence dans moins d'une heure. Vous ne pouvez plus quitter votre équipe.`,
            [{ text: "Compris" }]
          );
        }
      }
    }
  }, [currentSession]);

  useEffect(() => {
    dispatch(fetchSessionById(route.params.sessionId));

    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch, route.params.sessionId]);

  useEffect(() => {
    if (currentSession && !loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSession, loading]);

  const isUserParticipant = currentSession?.participants.some(p => p.id === currentUser?.id);
  const isUserHost = currentSession?.host.id === currentUser?.id;

  const handleJoinTeam = async (teamId: string) => {
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour rejoindre une équipe.');
      return;
    }

    if (currentSession) {
      setIsJoiningTeam(teamId);
      try {
        await dispatch(joinSession({ 
          sessionId: currentSession.id, 
          userId: currentUser.id,
          teamId 
        })).unwrap();
      } catch (error) {
        Alert.alert(
          'Erreur',
          'Impossible de rejoindre l\'équipe. Veuillez réessayer.'
        );
      } finally {
        setIsJoiningTeam(null);
      }
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!currentUser || !currentSession) {
      return;
    }
    
    // Vérifier si les équipes sont verrouillées
    const teamLockStatus = isTeamLocked(currentSession);
    if (teamLockStatus.isTeamLocked) {
      Alert.alert(
        "Équipes verrouillées", 
        `Vous ne pouvez pas quitter votre équipe car la session commence dans moins d'une heure.`
      );
      return;
    }

    try {
      setIsLeavingTeam(teamId);
      await dispatch(leaveSession({ 
        sessionId: currentSession.id, 
        userId: currentUser.id,
        teamId 
      })).unwrap();
      
      dispatch(fetchSessionById(currentSession.id));
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de quitter l\'équipe. Veuillez réessayer.'
      );
    } finally {
      setIsLeavingTeam(null);
    }
  };

  const handleSendMessage = (text: string) => {
    // TODO: Implémenter l'envoi de message
    console.log('Message à envoyer:', text);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
        <Ionicons name="alert-circle-outline" size={50} color={colors.status.error} style={{ marginBottom: 15 }} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!currentSession) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
        <Ionicons name="search-outline" size={50} color={colors.text.light} style={{ marginBottom: 15 }} />
        <Text style={styles.errorText}>Session non trouvée</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isFull = currentSession.participants.length >= currentSession.maxPlayers;
  
  // Déterminer la couleur en fonction du niveau
  const getLevelColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'beginner': return colors.level.beginner;
      case 'intermediate': return colors.level.intermediate;
      case 'advanced': return colors.level.advanced;
      default: return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
            {(isUserParticipant || isUserHost) && (
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => navigation.navigate('Chat', { sessionId: currentSession.id })}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" size={18} color={colors.text.white} style={{ marginRight: 5 }} />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sportBanner}>
            <View style={styles.sportIconContainer}>
              <Text style={styles.sportIcon}>{currentSession.sport.icon}</Text>
            </View>
            <View style={styles.sportInfoContainer}>
              <Text style={styles.sportName}>{currentSession.sport.name}</Text>
              <View style={[
                styles.levelBadge,
                { backgroundColor: getLevelColor(currentSession.level) }
              ]}>
                <Text style={styles.levelText}>{currentSession.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="location-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Lieu</Text>
                  <Text style={styles.detailValue}>{currentSession.location.address}</Text>
                  <Text style={styles.detailValueSecondary}>{currentSession.location.city}</Text>
                </View>
              </View>
              
              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Date et heure</Text>
                  <Text style={styles.detailValue}>{formatDate(currentSession.dateTime)}</Text>
                </View>
              </View>
              
              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Durée</Text>
                  <Text style={styles.detailValue}>{currentSession.duration} minutes</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{currentSession.description}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organisateur</Text>
            <View style={styles.hostInfo}>
              <Image 
                source={{ uri: currentSession.host.profilePicture }} 
                style={styles.hostAvatar}
              />
              <View style={styles.hostTextInfo}>
                <Text style={styles.hostName}>{currentSession.host.name}</Text>
                <Text style={styles.hostBio}>{currentSession.host.bio}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Équipes</Text>
              <View style={styles.playersPerTeamBadge}>
                <Ionicons name="people-outline" size={14} color={colors.text.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.playersPerTeamText}>
                  {currentSession.sport.playersPerTeam} joueurs par équipe
                </Text>
              </View>
            </View>
            
            {currentSession.teams.map((team) => (
              <TeamDisplay
                key={team.id}
                name={team.name}
                players={team.players}
                maxPlayers={currentSession.sport.playersPerTeam}
                currentUserId={currentUser?.id || ''}
                onJoinTeam={
                  !isFull && team.players.length < currentSession.sport.playersPerTeam
                    ? () => handleJoinTeam(team.id)
                    : undefined
                }
                onLeaveTeam={() => handleLeaveTeam(team.id)}
                isTeamLeaveDisabled={isTeamLeaveDisabled}
                isLoading={isJoiningTeam === team.id || isLeavingTeam === team.id}
              />
            ))}
          </View>

          {isFull && (
            <View style={styles.fullSessionMessage}>
              <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.fullSessionText}>
                Session complète ({currentSession.participants.length}/{currentSession.maxPlayers} joueurs)
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  chatButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  chatButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sportIconContainer: {
    backgroundColor: colors.primary + '15', // 15% opacity
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sportIcon: {
    fontSize: 30,
  },
  sportInfoContainer: {
    flex: 1,
  },
  sportName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  levelText: {
    color: colors.text.white,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playersPerTeamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
  },
  playersPerTeamText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    borderRadius: 24,
    marginRight: 16,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  detailValueSecondary: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  descriptionContainer: {
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.background.white,
  },
  hostTextInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  hostBio: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  teamContainer: {
    backgroundColor: colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  teamCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },
  teamCount: {
    fontSize: 13,
    color: colors.text.white,
    fontWeight: '600',
  },
  playersList: {
    gap: 10,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    padding: 12,
    borderRadius: 10,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  playerLevelBadge: {
    backgroundColor: colors.background.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
  },
  playerLevel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  teamButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  joinTeamButton: {
    backgroundColor: colors.button.primary,
  },
  joinTeamButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: '600',
  },
  leaveTeamButton: {
    backgroundColor: colors.status.error,
  },
  leaveTeamButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: 'rgba(150,150,150,0.5)',
    opacity: 0.7,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
  fullSessionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fullSessionText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LobbyScreen;