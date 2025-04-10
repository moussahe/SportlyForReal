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
 * @uses API_URL - Pour la récupération des données de session
 * @theme Utilise les couleurs thématiques : #F78800, #FFB65C, #FFE0BA, #FFF2E3
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchSessionById, joinSession, leaveSession, clearCurrentSession } from '../../store/slices/sessionsSlice';
import { RootState, AppDispatch } from '../../store/store';
import { RootStackParamList } from '../../navigation/MainStack';
import { formatDate } from '../../utils/dateUtils';
import colors from '../../theme/colors';
import { ChatSection } from '../../components/Chat/ChatSection';

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
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ 
  name, 
  players, 
  maxPlayers, 
  currentUserId,
  onJoinTeam,
  onLeaveTeam,
  isLoading
}) => {
  const isUserInTeam = players?.some(player => player.id === currentUserId);

  return (
    <View style={styles.teamContainer}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{name}</Text>
        <Text style={styles.teamCount}>{players?.length || 0}/{maxPlayers}</Text>
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
              <Text style={styles.playerLevel}>
                {player.level?.[player.sport?.id || 'general'] || 'BEGINNER'}
              </Text>
            </View>
          </View>
        ))}
        
        {isUserInTeam ? (
          <TouchableOpacity 
            style={[styles.teamButton, styles.leaveTeamButton]} 
            onPress={onLeaveTeam}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <Text style={styles.leaveTeamButtonText}>Quitter l'équipe</Text>
            )}
          </TouchableOpacity>
        ) : (
          (!players || players.length < maxPlayers) && onJoinTeam && (
            <TouchableOpacity 
              style={[styles.teamButton, styles.joinTeamButton]} 
              onPress={onJoinTeam}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <Text style={styles.joinTeamButtonText}>Rejoindre l'équipe</Text>
              )}
            </TouchableOpacity>
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

  useEffect(() => {
    console.log('🔄 Chargement de la session:', route.params.sessionId);
    dispatch(fetchSessionById(route.params.sessionId));

    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch, route.params.sessionId]);

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
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => dispatch(fetchSessionById(route.params.sessionId))}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentSession) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Session non trouvée</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFull = currentSession.participants.length >= currentSession.maxPlayers;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        {(isUserParticipant || isUserHost) && (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { sessionId: currentSession.id })}
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sportInfo}>
        <Text style={styles.sportIcon}>{currentSession.sport.icon}</Text>
        <Text style={styles.sportName}>{currentSession.sport.name}</Text>
        <Text style={styles.level}>{currentSession.level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails</Text>
        <Text style={styles.location}>{currentSession.location.address}</Text>
        <Text style={styles.location}>{currentSession.location.city}</Text>
        <Text style={styles.dateTime}>{formatDate(currentSession.dateTime)}</Text>
        <Text style={styles.duration}>{currentSession.duration} minutes</Text>
        <Text style={styles.description}>{currentSession.description}</Text>
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
        <Text style={styles.sectionTitle}>Équipes</Text>
        <Text style={styles.teamDescription}>
          {currentSession.sport.playersPerTeam} joueurs par équipe
        </Text>
        
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
            isLoading={isJoiningTeam === team.id || isLeavingTeam === team.id}
          />
        ))}
      </View>

      {isFull && (
        <View style={styles.fullSessionMessage}>
          <Text style={styles.fullSessionText}>
            Session complète ({currentSession.participants.length}/{currentSession.maxPlayers} joueurs)
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: 15,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatButtonText: {
    color: colors.text.white,
    fontSize: 16,
  },
  chatSection: {
    marginBottom: 20,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  sportName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  level: {
    fontSize: 16,
    color: colors.text.secondary,
    backgroundColor: colors.background.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  section: {
    backgroundColor: colors.background.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  teamDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 15,
  },
  location: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  hostTextInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 5,
  },
  hostBio: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  teamContainer: {
    backgroundColor: colors.background.light,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  teamCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    padding: 8,
    borderRadius: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  playerLevel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  teamButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  joinTeamButton: {
    backgroundColor: colors.primary,
  },
  joinTeamButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  leaveTeamButton: {
    backgroundColor: colors.status.error,
  },
  leaveTeamButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fullSessionMessage: {
    backgroundColor: colors.background.light,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  fullSessionText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.white,
    fontSize: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LobbyScreen; 