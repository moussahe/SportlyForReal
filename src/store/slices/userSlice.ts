import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { login, signup, loadSavedAuth, logout as authLogout } from './authSlice';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // When user logs in successfully
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.error = null;
      })
      // When user signs up successfully
      .addCase(signup.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.error = null;
      })
      // When saved authentication is loaded
      .addCase(loadSavedAuth.fulfilled, (state, action) => {
        if (action.payload && action.payload.user) {
          state.currentUser = action.payload.user;
        }
        state.error = null;
      })
      // When user logs out
      .addCase(authLogout, (state) => {
        state.currentUser = null;
        state.error = null;
      });
  },
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer; 