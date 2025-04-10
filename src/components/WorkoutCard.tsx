import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Workout } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface WorkoutCardProps {
  workout: Workout;
  onPress: (workout: Workout) => void;
}

export const WorkoutCard = ({ workout, onPress }: WorkoutCardProps) => {
  const getTypeIcon = () => {
    switch (workout.type) {
      case 'cardio':
        return 'heart';
      case 'musculation':
        return 'barbell';
      case 'yoga':
        return 'flower';
      default:
        return 'fitness';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(workout)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{workout.title}</Text>
        <Ionicons name={getTypeIcon()} size={24} color="#2196F3" />
      </View>
      <Text style={styles.description}>{workout.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.detail}>
          <Ionicons name="time-outline" size={16} /> {workout.duration} min
        </Text>
        <Text style={styles.detail}>
          <Ionicons name="star-outline" size={16} /> {workout.difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    alignItems: 'center',
  },
}); 