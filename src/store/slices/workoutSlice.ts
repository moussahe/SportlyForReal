import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workout, WorkoutProgress } from '../../types';
import { mockWorkouts, mockProgress } from '../mockData';

interface WorkoutState {
  workouts: Workout[];
  userProgress: WorkoutProgress[];
  selectedWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: mockWorkouts,
  userProgress: mockProgress,
  selectedWorkout: null,
  isLoading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload;
      state.error = null;
    },
    setSelectedWorkout: (state, action: PayloadAction<Workout>) => {
      state.selectedWorkout = action.payload;
    },
    setUserProgress: (state, action: PayloadAction<WorkoutProgress[]>) => {
      state.userProgress = action.payload;
    },
    addProgress: (state, action: PayloadAction<WorkoutProgress>) => {
      state.userProgress.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setWorkouts,
  setSelectedWorkout,
  setUserProgress,
  addProgress,
  setLoading,
  setError,
} = workoutSlice.actions;

export default workoutSlice.reducer; 