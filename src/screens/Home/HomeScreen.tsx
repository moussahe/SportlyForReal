import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchSessions } from '../../store/slices/sessionsSlice';
import { RootState, AppDispatch } from '../../store/store';
import { formatDate } from '../../utils/dateUtils';
import { calculateDistance, getCurrentPosition, formatDistance, Coordinates } from '../../utils/locationUtils';
import { StackNavigationProp } from '@react-navigation/stack';
import { Session, SessionsState } from '../../types';
import colors from '../../theme/colors';

export type RootStackParamList = {
  Home: undefined;
  Lobby: { sessionId: string };
  Profile: undefined;
  CreateSession: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface SessionWithDistance extends Session {
  distance: number | undefined;
}

interface SessionCardProps {
  session: SessionWithDistance;
  onPress: () => void;
}

const SearchBar: React.FC<{ onSearch: (text: string) => void }> = ({ onSearch }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Rechercher par lieu..."
      onChangeText={onSearch}
      placeholderTextColor={colors.text.light}
    />
  </View>
);

const FilterButtons: React.FC<{ onFilter: (filter: string) => void, activeFilter: string }> = ({ onFilter, activeFilter }) => (
  <View style={styles.filterContainer}>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'nearby' && styles.filterButtonActive]}
      onPress={() => onFilter('nearby')}
    >
      <Text style={[styles.filterButtonText, activeFilter === 'nearby' && styles.filterButtonTextActive]}>À proximité</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'today' && styles.filterButtonActive]}
      onPress={() => onFilter('today')}
    >
      <Text style={[styles.filterButtonText, activeFilter === 'today' && styles.filterButtonTextActive]}>Aujourd'hui</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'popular' && styles.filterButtonActive]}
      onPress={() => onFilter('popular')}
    >
      <Text style={[styles.filterButtonText, activeFilter === 'popular' && styles.filterButtonTextActive]}>Populaire</Text>
    </TouchableOpacity>
  </View>
);

const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <View style={styles.sportInfo}>
        <Text style={styles.sportIcon}>{session.sport.icon}</Text>
        <Text style={styles.sportName}>{session.sport.name}</Text>
      </View>
      <Text style={styles.level}>{session.level}</Text>
    </View>
    
    <View style={styles.hostInfo}>
      <Text style={styles.hostName}>Organisé par {session.host.name}</Text>
    </View>

    <View style={styles.details}>
      <View style={styles.locationContainer}>
        <Text style={styles.location}>{session.location.address}</Text>
        {session.distance !== undefined && (
          <Text style={styles.distance}>{formatDistance(session.distance)}</Text>
        )}
      </View>
      <Text style={styles.dateTime}>{formatDate(session.dateTime)}</Text>
      <Text style={styles.duration}>{session.duration} minutes</Text>
    </View>

    <View style={styles.footer}>
      <Text style={styles.participants}>
        {session.participants.length}/{session.maxPlayers} participants
      </Text>
      <Text style={[styles.status, styles[session.status.toLowerCase() as keyof typeof styles]]}>
        {session.status}
      </Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { sessions, loading, error } = useSelector((state: RootState) => {
    console.log('État Redux actuel:', state);
    return state.sessions as SessionsState;
  });
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 HomeScreen monté, chargement initial...');
    loadSessions();
    initializeLocation();
  }, [dispatch]);

  const initializeLocation = async () => {
    try {
      console.log('📍 Initialisation de la géolocalisation...');
      const position = await getCurrentPosition();
      console.log('✅ Position obtenue:', position);
      setUserLocation(position);
      setLocationError(null);
    } catch (error) {
      console.error('❌ Erreur de géolocalisation:', error);
      setLocationError("Impossible d'obtenir votre position. Vérifiez vos paramètres de localisation.");
    }
  };

  const loadSessions = async () => {
    try {
      console.log('🔄 Chargement des sessions...');
      const result = await dispatch(fetchSessions()).unwrap();
      console.log('✅ Sessions chargées:', result);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des sessions:', err);
    }
  };

  const handleSessionPress = (sessionId: string) => {
    console.log('👆 Session sélectionnée:', sessionId);
    navigation.navigate('Lobby', { sessionId });
  };

  const getSessionsWithDistance = (sessions: Session[] | null): SessionWithDistance[] => {
    if (!sessions) return [];
    
    let sessionsWithDistance = sessions.map(session => ({
      ...session,
      distance: userLocation && session.location.coordinates
        ? calculateDistance(userLocation, session.location.coordinates)
        : undefined
    }));

    // Trier par distance si la localisation est disponible
    if (userLocation) {
      sessionsWithDistance.sort((a, b) => {
        const distanceA = a.distance ?? Infinity;
        const distanceB = b.distance ?? Infinity;
        return distanceA - distanceB;
      });
    }

    return sessionsWithDistance;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {Platform.OS === 'web' 
            ? "Erreur de connexion au serveur. Assurez-vous que le serveur backend est démarré sur le port 3000."
            : error}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadSessions}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sessionsWithDistance = getSessionsWithDistance(sessions);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Sessions à proximité</Text>
          <View style={styles.topBarButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text>👤</Text>
            </TouchableOpacity>
          </View>
        </View>
        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
            <TouchableOpacity 
              style={styles.retryLocationButton}
              onPress={initializeLocation}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {(!sessionsWithDistance || sessionsWithDistance.length === 0) ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Aucune session disponible</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadSessions}
          >
            <Text style={styles.retryButtonText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessionsWithDistance}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => handleSessionPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSession')}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  headerContainer: {
    backgroundColor: colors.background.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  topBarButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background.light,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: colors.background.light,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: colors.text.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.button.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: colors.text.white,
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sportName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  level: {
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: colors.background.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostInfo: {
    marginBottom: 10,
  },
  hostName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  details: {
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    marginRight: 10,
  },
  distance: {
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: colors.background.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dateTime: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  participants: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  status: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcoming: {
    backgroundColor: colors.session.upcoming,
    color: colors.text.white,
  },
  in_progress: {
    backgroundColor: colors.session.inProgress,
    color: colors.text.white,
  },
  completed: {
    backgroundColor: colors.session.completed,
    color: colors.text.white,
  },
  cancelled: {
    backgroundColor: colors.session.cancelled,
    color: colors.text.white,
  },
  createButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: colors.text.white,
    fontSize: 32,
    marginTop: -2,
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationErrorText: {
    color: colors.status.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  retryLocationButton: {
    backgroundColor: colors.status.error,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'center',
  },
} as const);

export default HomeScreen; 