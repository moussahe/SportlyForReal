import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSlice';
import sessionsReducer from './slices/sessionsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    workout: workoutReducer,
    sessions: sessionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 