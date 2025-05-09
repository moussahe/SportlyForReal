/**
 * @file CreateSessionScreen.tsx
 * @description Écran de création d'une nouvelle session sportive dans l'application Sportly.
 * Ce composant permet aux utilisateurs de créer une nouvelle session en définissant :
 * - Sport choisi avec sélection visuelle
 * - Date et heure
 * - Lieu (avec accès à la carte)
 * - Nombre maximum de joueurs
 * - Niveau requis
 * - Description de la session
 * 
 * @component CreateSessionScreen
 * @route /create-session
 * @uses Ionicons - Pour les icônes de l'interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainStack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Level } from '../../types';
import colors from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { mockSports } from '../../data/mockSports';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createSession } from '../../store/slices/sessionsSlice';

type CreateSessionScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateSessionScreen = () => {
  const navigation = useNavigation<CreateSessionScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [level, setLevel] = useState(Level.BEGINNER);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Animation on component mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSportSelect = (sportId: string) => {
    setSelectedSport(sportId);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Only keep open on iOS
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Only keep open on iOS
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const validateForm = () => {
    if (!selectedSport || !location.trim() || 
        isNaN(parseInt(maxPlayers)) || parseInt(maxPlayers) < 2 ||
        !description.trim() ||
        isNaN(parseInt(duration)) || parseInt(duration) < 15) {
      return false;
    }
    return true;
  };

  const getFormErrors = (): string | null => {
    if (!selectedSport) {
      return 'Veuillez sélectionner un sport';
    }
    if (!location.trim()) {
      return 'Veuillez entrer un lieu';
    }
    if (isNaN(parseInt(maxPlayers)) || parseInt(maxPlayers) < 2) {
      return 'Le nombre maximum de joueurs doit être au moins 2';
    }
    if (!description.trim()) {
      return 'Veuillez ajouter une description';
    }
    if (isNaN(parseInt(duration)) || parseInt(duration) < 15) {
      return 'La durée doit être d\'au moins 15 minutes';
    }
    return null;
  };

  const handleSubmit = async () => {
    const errorMessage = getFormErrors();
    if (errorMessage) {
      Alert.alert('Erreur', errorMessage);
      return;
    }
    
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une session');
      return;
    }

    setIsLoading(true);

    const selectedSportObj = mockSports.find(s => s.id === selectedSport);
    if (!selectedSportObj) {
      Alert.alert('Erreur', 'Sport non valide');
      setIsLoading(false);
      return;
    }
    
    try {
      const sessionData = {
        sport: selectedSportObj,
        dateTime: date.toISOString(),
        location: {
          address: location,
          city: 'À déterminer', // Dans une version future, ajouter un sélecteur de ville
          coordinates: {
            latitude: 0, // Dans une version future, ajouter une sélection sur la carte
            longitude: 0
          }
        },
        maxPlayers: parseInt(maxPlayers),
        level: level,
        description: description,
        duration: parseInt(duration),
      };

      await dispatch(createSession(sessionData)).unwrap();
      Alert.alert(
        'Succès',
        'Votre session a été créée avec succès!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
        console.log(error)
      Alert.alert('Erreur', 'La création de la session a échoué. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer une session</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            {/* Sport selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sport</Text>
              <Text style={styles.sectionSubtitle}>Choisissez le sport pour votre session</Text>
              
              <View style={styles.sportGrid}>
                {mockSports.map(sport => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportCard,
                      selectedSport === sport.id && styles.sportCardSelected
                    ]}
                    onPress={() => handleSportSelect(sport.id)}
                  >
                    <View style={[
                      styles.sportIconContainer,
                      selectedSport === sport.id && styles.sportIconContainerSelected
                    ]}>
                      <Text style={styles.sportIcon}>{sport.icon}</Text>
                    </View>
                    <Text style={[
                      styles.sportName,
                      selectedSport === sport.id && styles.sportNameSelected
                    ]}>
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Date and Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date et heure</Text>
              <Text style={styles.sectionSubtitle}>Quand aura lieu votre session ?</Text>
              
              <View style={styles.dateTimeContainer}>
                {/* Date Picker */}
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={22} color={colors.primary} style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                
                {/* Time Picker */}
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={22} color={colors.primary} style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={styles.picker}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  style={styles.picker}
                />
              )}
            </View>
            
            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lieu</Text>
              <Text style={styles.sectionSubtitle}>Où se déroulera votre session ?</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={22} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Adresse du lieu"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              
              {/* Dans une version future, ajouter une carte pour sélectionner le lieu */}
            </View>
            
            {/* Session Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Paramètres</Text>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Nombre max. de joueurs</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={() => {
                      const value = parseInt(maxPlayers) - 1;
                      if (value >= 2) setMaxPlayers(value.toString());
                    }}
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.numberInputText}
                    value={maxPlayers}
                    onChangeText={(text) => {
                      const value = parseInt(text);
                      if (!isNaN(value) && value >= 0) {
                        setMaxPlayers(value.toString());
                      }
                    }}
                    keyboardType="number-pad"
                  />
                  
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={() => {
                      const value = parseInt(maxPlayers) + 1;
                      setMaxPlayers(value.toString());
                    }}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Durée (minutes)</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={() => {
                      const value = parseInt(duration) - 15;
                      if (value >= 15) setDuration(value.toString());
                    }}
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.numberInputText}
                    value={duration}
                    onChangeText={(text) => {
                      const value = parseInt(text);
                      if (!isNaN(value) && value >= 0) {
                        setDuration(value.toString());
                      }
                    }}
                    keyboardType="number-pad"
                  />
                  
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={() => {
                      const value = parseInt(duration) + 15;
                      setDuration(value.toString());
                    }}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Niveau requis</Text>
                <View style={styles.levelSelector}>
                  {Object.values(Level).map((levelValue) => (
                    <TouchableOpacity
                      key={levelValue}
                      style={[
                        styles.levelButton,
                        level === levelValue && styles.levelButtonSelected
                      ]}
                      onPress={() => setLevel(levelValue as Level)}
                    >
                      <Text style={[
                        styles.levelButtonText,
                        level === levelValue && styles.levelButtonTextSelected
                      ]}>
                        {levelValue}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionSubtitle}>Décrivez votre session (règles, équipement nécessaire...)</Text>
              
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Description de la session..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, (!validateForm() || isLoading) && styles.createButtonDisabled]}
              onPress={handleSubmit}
              disabled={!validateForm() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.text.white} style={{ marginRight: 8 }} />
                  <Text style={styles.createButtonText}>Créer la session</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.background.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  sportCard: {
    width: '30%',
    backgroundColor: colors.background.light,
    borderRadius: 12,
    padding: 10, // Réduit légèrement le padding pour compenser la bordure
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    height: 120, // Hauteur fixe pour toutes les cartes
  },
  sportCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  sportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportIconContainerSelected: {
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  sportIcon: {
    fontSize: 30,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  sportNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dateTimeContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  picker: {
    marginTop: -10,
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
    marginHorizontal: Platform.OS === 'ios' ? -10 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: 16,
    borderRadius: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  formLabel: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: 12,
    overflow: 'hidden',
  },
  numberButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberInputText: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  levelSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.light,
    marginLeft: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  levelButtonSelected: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  levelButtonTextSelected: {
    color: colors.text.white,
    fontWeight: '600',
  },
  textAreaContainer: {
    backgroundColor: colors.background.light,
    borderRadius: 12,
    padding: 8,
  },
  textArea: {
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 100,
    padding: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flexDirection: 'row',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: colors.button.disabled,
    shadowOpacity: 0.1,
  },
  createButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateSessionScreen;