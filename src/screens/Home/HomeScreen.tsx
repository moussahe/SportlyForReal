import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchSessions } from '../../store/slices/sessionsSlice';
import { RootState, AppDispatch } from '../../store/store';
import { formatDate } from '../../utils/dateUtils';
import { calculateDistance, getCurrentPosition, formatDistance, Coordinates } from '../../utils/locationUtils';
import { StackNavigationProp } from '@react-navigation/stack';
import { Session, SessionsState } from '../../types';
import colors from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={styles.searchInputWrapper}>
      <Ionicons name="search-outline" size={20} color={colors.text.light} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par lieu..."
        onChangeText={onSearch}
        placeholderTextColor={colors.text.light}
      />
    </View>
  </View>
);

const FilterButtons: React.FC<{ onFilter: (filter: string) => void, activeFilter: string }> = ({ onFilter, activeFilter }) => (
  <View style={styles.filterContainer}>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'nearby' && styles.filterButtonActive]}
      onPress={() => onFilter('nearby')}
    >
      <Ionicons 
        name="location-outline" 
        size={18} 
        color={activeFilter === 'nearby' ? 'white' : colors.text.secondary} 
        style={styles.filterIcon} 
      />
      <Text style={[styles.filterButtonText, activeFilter === 'nearby' && styles.filterButtonTextActive]}>À proximité</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'today' && styles.filterButtonActive]}
      onPress={() => onFilter('today')}
    >
      <Ionicons 
        name="calendar-outline" 
        size={18} 
        color={activeFilter === 'today' ? 'white' : colors.text.secondary} 
        style={styles.filterIcon} 
      />
      <Text style={[styles.filterButtonText, activeFilter === 'today' && styles.filterButtonTextActive]}>Aujourd'hui</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === 'popular' && styles.filterButtonActive]}
      onPress={() => onFilter('popular')}
    >
      <Ionicons 
        name="star-outline" 
        size={18} 
        color={activeFilter === 'popular' ? 'white' : colors.text.secondary} 
        style={styles.filterIcon} 
      />
      <Text style={[styles.filterButtonText, activeFilter === 'popular' && styles.filterButtonTextActive]}>Populaire</Text>
    </TouchableOpacity>
  </View>
);

const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  const animatedScale = new Animated.Value(1);
  
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
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <View style={styles.sportBadge}>
          <Text style={styles.sportIcon}>{session.sport.icon}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.sportInfo}>
              <Text style={styles.sportName}>{session.sport.name}</Text>
              <View style={[
                styles.levelContainer, 
                { backgroundColor: getLevelColor(session.level) }
              ]}>
                <Text style={styles.level}>{session.level}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>
              Organisé par <Text style={styles.hostNameBold}>{session.host.name}</Text>
            </Text>
          </View>
  
          <View style={styles.divider} />
  
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.text.secondary} style={styles.detailIconSvg} />
              <Text style={styles.location}>{session.location.address}</Text>
              {session.distance !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate-outline" size={12} color={colors.text.secondary} style={{ marginRight: 2 }} />
                  <Text style={styles.distance}>{formatDistance(session.distance)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} style={styles.detailIconSvg} />
              <Text style={styles.dateTime}>{formatDate(session.dateTime)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} style={styles.detailIconSvg} />
              <Text style={styles.duration}>{session.duration} minutes</Text>
            </View>
          </View>
  
          <View style={styles.footer}>
            <View style={styles.participantsContainer}>
              <View style={styles.participantsBadge}>
                <Text style={styles.participantsText}>
                  {session.participants.length}/{session.maxPlayers}
                </Text>
              </View>
              <Text style={styles.participantsLabel}>participants</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(session.status) }
            ]}>
              <Text style={styles.statusText}>
                {session.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Fonctions utilitaires pour les couleurs dynamiques
const getLevelColor = (level: string) => {
  switch(level.toLowerCase()) {
    case 'beginner': return colors.level.beginner;
    case 'intermediate': return colors.level.intermediate;
    case 'advanced': return colors.level.advanced;
    default: return '#F0F2F5';
  }
};

const getStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'upcoming': return colors.session.upcoming;
    case 'in_progress': return colors.session.inProgress;
    case 'completed': return colors.session.completed;
    case 'cancelled': return colors.session.cancelled;
    default: return colors.button.disabled;
  }
};

export const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { sessions, loading, error } = useSelector((state: RootState) => state.sessions as SessionsState);
  
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('nearby');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cardAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (sessions && !loading) {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 100,
      }).start();
    }
  }, [sessions, loading]);

  useEffect(() => {
    loadSessions();
    initializeLocation();
  }, [dispatch]);
  
  // Rafraîchir les données quand on revient sur cette page
  useFocusEffect(
    useCallback(() => {
      initializeLocation();
      return () => {};
    }, [])
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchSessions()).unwrap();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

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

  const filteredSessions = (sessionsWithDistance: SessionWithDistance[]): SessionWithDistance[] => {
    if (!sessionsWithDistance) return [];
    
    // Filtre par recherche
    let filtered = sessionsWithDistance;
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(session => 
        session.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtre par catégorie
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (activeFilter) {
      case 'nearby':
        // Déjà trié par distance dans getSessionsWithDistance()
        break;
      case 'today':
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.dateTime);
          return sessionDate >= today && sessionDate < tomorrow;
        });
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => {
          const popularityA = a.participants.length / a.maxPlayers;
          const popularityB = b.participants.length / b.maxPlayers;
          return popularityB - popularityA;
        });
        break;
    }
    
    return filtered;
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Animated.View
          style={{
            alignItems: 'center',
            opacity: new Animated.Value(0.8)
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des sessions...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
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
      </SafeAreaView>
    );
  }

  const sessionsWithDistance = getSessionsWithDistance(sessions);
  const filteredSessionsList = filteredSessions(sessionsWithDistance);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Sessions à proximité</Text>
          <View style={styles.topBarButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        {locationError && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={20} color="#E53935" style={{ marginRight: 5 }} />
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

      <SearchBar onSearch={handleSearchChange} />
      <FilterButtons onFilter={handleFilterChange} activeFilter={activeFilter} />

      {(!filteredSessionsList || filteredSessionsList.length === 0) ? (
        <View style={styles.centerContent}>
          <Ionicons name="calendar-outline" size={50} color={colors.text.light} style={{ marginBottom: 15 }} />
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
          data={filteredSessionsList}
          renderItem={({ item, index }) => {
            const animatedStyle = {
              opacity: cardAnimation,
              transform: [{ 
                translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 * (index % 10), 0]
                })
              }]
            };
            
            return (
              <Animated.View style={animatedStyle}>
                <SessionCard
                  session={item}
                  onPress={() => handleSessionPress(item.id)}
                />
              </Animated.View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary, colors.secondary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSession')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
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
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    height: 50,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  filterButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  filterIcon: {
    marginRight: 5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    color: '#E53935',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 0, // Supprime complètement le padding du bas
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sportBadge: {
    backgroundColor: "white",
    borderRadius: 15,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sportIcon: {
    fontSize: 24,
    color: 'white',
  },
  sportName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  levelContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  level: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
  hostInfo: {
    marginBottom: 10,
  },
  hostName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  hostNameBold: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 10,
  },
  details: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIconSvg: {
    marginRight: 8,
  },
  location: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  dateTime: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  duration: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  participantsText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
  participantsLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  createButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  locationErrorText: {
    color: '#E53935',
    fontSize: 14,
    flex: 1,
  },
  retryLocationButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
} as const);

export default HomeScreen;