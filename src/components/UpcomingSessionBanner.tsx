import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { Session } from '../types';
import { isSessionUpcoming, isTeamLocked } from '../utils/sessionUtils';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Lobby: { sessionId: string };
  ActiveSession: { sessionId: string };
  Profile: undefined;
  CreateSession: undefined;
};

interface UpcomingSessionBannerProps {
  session: Session;
  onClose?: () => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const UpcomingSessionBanner: React.FC<UpcomingSessionBannerProps> = ({ session, onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();

  // Init state immédiatement
  const initial = isSessionUpcoming(session);
  const [timeRemaining, setTimeRemaining] = useState<number>(initial.minutesRemaining);
  const [progress, setProgress] = useState<number>(initial.progress);

  const [progressAnim] = useState(new Animated.Value(initial.progress));
  const [slideAnim] = useState(new Animated.Value(-200));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animation d'entrée
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Petit saut d'attention après 1,5s
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -5, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }, 1500);

    // Mise à jour immédiate (au cas où)
    {
      const { minutesRemaining, progress: prog } = isSessionUpcoming(session);
      setTimeRemaining(minutesRemaining);
      setProgress(prog);
      progressAnim.setValue(prog);
    }

    // Interval pour mettre à jour chaque seconde
    const interval = setInterval(() => {
      const { minutesRemaining, progress: prog, isUpcoming } = isSessionUpcoming(session);

      setTimeRemaining(minutesRemaining);
      setProgress(prog);

      // Animer la barre de progression
      Animated.timing(progressAnim, {
        toValue: prog,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      // Vibration + pulse *uniquement* dans les 2 dernières minutes
      if (minutesRemaining <= 2 && minutesRemaining > 0) {
        // Variable pour stocker l'indicateur de seconde pour la vibration
        const currentSecond = new Date().getSeconds();
        
        // Réduire la fréquence de vibration en fonction du temps restant:
        // - Entre 2 et 1 min: vibrer toutes les 15 secondes (0, 15, 30, 45)
        // - Moins d'une minute: vibrer toutes les 10 secondes (0, 10, 20, 30, 40, 50)
        const shouldVibrate = 
          (minutesRemaining > 1 && currentSecond % 15 === 0) || 
          (minutesRemaining <= 1 && currentSecond % 10 === 0);
        
        if (shouldVibrate) {
          Vibration.vibrate([0, 300, 150, 300]);
          
          Animated.sequence([
            Animated.timing(slideAnim, { toValue: -3, duration: 100, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]).start();
        }

        // Arrêter toute animation de pulse en cours
        pulseAnim.stopAnimation();
        // Réinitialiser la valeur
        pulseAnim.setValue(1);
        
        // Animation de pulse plus subtile et agréable
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.03,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800, 
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]), 
          { iterations: -1 }
        ).start();
      }

      // Quand la session commence ou n'est plus imminente
      if (minutesRemaining === 0) {
        Vibration.vibrate(500);
        // Rediriger vers l'écran de session active plutôt que le lobby
        navigation.navigate('ActiveSession', { sessionId: session.id });
        onClose?.();
        clearInterval(interval);
      }
      if (!isUpcoming) {
        onClose?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return "Maintenant";
    if (minutes === 1) return "Dans 1 minute";
    return `Dans ${minutes} minutes`;
  };

  const handlePress = () => {
    // Si la session a commencé (minutesRemaining === 0), diriger vers ActiveSession
    // sinon, diriger vers Lobby
    if (timeRemaining === 0) {
      navigation.navigate('ActiveSession', { sessionId: session.id });
    } else {
      navigation.navigate('Lobby', { sessionId: session.id });
    }
    // onClose() ici si tu veux masquer via le bouton X seulement
  };

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressBarColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [
      'rgba(255, 255, 255, 0.7)',
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 255, 255, 0.9)',
      'rgba(255, 255, 255, 1)',
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }, { scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity style={styles.content} activeOpacity={0.85} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <View style={styles.sportIcon}>
            <Text style={styles.sportEmoji}>{session.sport.icon}</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {session.sport.name} commence bientôt
            </Text>
            {onClose && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>
            {formatTimeRemaining(timeRemaining)} • {session.location.address}
          </Text>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressBarWidth, backgroundColor: progressBarColor },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    zIndex: 999,
    margin: 16,
    borderRadius: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 22,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  closeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
});

export default UpcomingSessionBanner;
