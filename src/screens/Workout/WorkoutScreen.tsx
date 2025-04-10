import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { WorkoutCard } from '../../components/WorkoutCard';
import { setSelectedWorkout, setWorkouts } from '../../store/slices/workoutSlice';
import { Workout } from '../../types';

// Données de test (à remplacer par l'API)
const mockWorkouts: Workout[] = [
  {
    id: 1,
    title: 'HIIT Cardio',
    description: 'Entraînement intense par intervalles pour brûler un maximum de calories',
    duration: 30,
    difficulty: 'intermédiaire',
    type: 'cardio',
    exercises: [],
  },
  {
    id: 2,
    title: 'Full Body',
    description: 'Séance complète pour travailler tout le corps',
    duration: 45,
    difficulty: 'débutant',
    type: 'musculation',
    exercises: [],
  },
  {
    id: 3,
    title: 'Yoga Flow',
    description: 'Séance de yoga dynamique pour la souplesse et le bien-être',
    duration: 60,
    difficulty: 'débutant',
    type: 'yoga',
    exercises: [],
  },
];

export const WorkoutScreen = () => {
  const dispatch = useDispatch();
  const { workouts, isLoading } = useSelector((state: RootState) => state.workout);

  useEffect(() => {
    // Simuler un chargement des données
    dispatch(setWorkouts(mockWorkouts));
  }, [dispatch]);

  const handleWorkoutPress = (workout: Workout) => {
    dispatch(setSelectedWorkout(workout));
    // Navigation vers le détail à implémenter
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} onPress={handleWorkoutPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 