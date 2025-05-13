import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EXPO_PUBLIC_API_URL } from '../../config';
import { authStorage } from '../../services/authStorage';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  bio: string;
  sports: string[];
  level: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  hostedSessions?: any[];
  participations?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Thunks
export const loadSavedAuth = createAsyncThunk(
  'auth/loadSavedAuth',
  async () => {
    try {
      // Récupérer le token enregistré
      const token = await authStorage.getAuthToken();
      if (!token) return null;

      // Récupérer les données utilisateur enregistrées
      const userData = await authStorage.getUserData();

      // Retourner les données récupérées
      return { token, user: userData };
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'authentification:', error);
      return null;
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, name, password, profilePicture }: { email: string; name: string; password: string; profilePicture?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, profilePicture }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Erreur lors de l\'inscription');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Erreur lors de la connexion');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la connexion');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token) {
        return rejectWithValue('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${EXPO_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Erreur lors de la récupération du profil');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la récupération du profil');
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Supprimer les données d'authentification du stockage
      authStorage.clearAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Persister dans le stockage
        authStorage.storeAuthData(action.payload.token, action.payload.user);
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Persister dans le stockage
        authStorage.storeAuthData(action.payload.token, action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Charger les données d'authentification sauvegardées
      .addCase(loadSavedAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
