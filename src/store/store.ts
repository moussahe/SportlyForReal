import { configureStore } from '@reduxjs/toolkit';
import sessionsReducer from './slices/sessionsSlice';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';
import sportsReducer from './slices/sportsSlice';

export const store = configureStore({
  reducer: {
    sessions: sessionsReducer,
    chat: chatReducer,
    user: userReducer,
    sports: sportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 