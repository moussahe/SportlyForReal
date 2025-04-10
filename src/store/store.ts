import { configureStore } from '@reduxjs/toolkit';
import sessionsReducer from './slices/sessionsSlice';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    sessions: sessionsReducer,
    chat: chatReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 