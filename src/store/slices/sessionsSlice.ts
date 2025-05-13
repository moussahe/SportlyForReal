import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User } from '../../types';
import { EXPO_PUBLIC_API_URL  } from '../../config';
import { RootState } from '../store';
import { handleAuthError } from '../../utils/authUtils';

interface SessionsState {
  sessions: Session[] | null;
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
}

interface JoinSessionPayload {
  sessionId: string;
  userId: string;
  teamId: string;
}

interface CreateSessionPayload {
  sport: any;
  dateTime: string;
  location: {
    address: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  maxPlayers: number;
  level: string;
  description: string;
  duration: number;
}

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (_, { getState }) => {
    try {
      
      // Récupérer le token depuis le state Redux
      const { auth } = getState() as { auth: { token: string | null } };
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter le token d'authentification s'il existe
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      };
      
      const response = await fetch(`${EXPO_PUBLIC_API_URL }/sessions`, {
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors du chargement des sessions'}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchSessionById',
  async (sessionId: string, { getState }) => {
    // Récupérer le token depuis le state Redux
    const { auth } = getState() as { auth: { token: string | null } };
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification s'il existe
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL }/sessions/${sessionId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Session non trouvée');
    }
    return response.json();
  }
);

export const joinSession = createAsyncThunk(
  'sessions/joinSession',
  async ({ sessionId, userId, teamId }: JoinSessionPayload, { getState }) => {
    // Récupérer le token depuis le state Redux
    const { auth } = getState() as { auth: { token: string | null } };
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification s'il existe
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL }/sessions/${sessionId}/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, teamId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la participation à la session');
    }

    return response.json();
  }
);

export const leaveSession = createAsyncThunk(
  'sessions/leaveSession',
  async ({ sessionId, userId, teamId }: JoinSessionPayload, { getState }) => {
    // Récupérer le token depuis le state Redux
    const { auth } = getState() as { auth: { token: string | null } };
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification s'il existe
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL }/sessions/${sessionId}/leave`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ userId, teamId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du départ de la session');
    }

    return response.json();
  }
);

export const createSession = createAsyncThunk(
  'sessions/createSession',
  async (sessionData: CreateSessionPayload, { getState }) => {
    // Obtention de l'ID de l'utilisateur connecté
    const state = getState() as RootState;
    const hostId = state.user.currentUser?.id || '7c7d0616-f0b1-4c1d-ae6a-bf7bd5113d91'; // ID par défaut en dev

    // Préparation des données selon le format attendu par l'API
    const payload = {
      sportId: sessionData.sport.id,
      hostId: hostId,
      location: sessionData.location,
      dateTime: sessionData.dateTime,
      duration: sessionData.duration,
      maxPlayers: sessionData.maxPlayers,
      level: sessionData.level,
      description: sessionData.description,
    };

    const response = await fetch(`${EXPO_PUBLIC_API_URL }/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Pour inclure les cookies d'authentification
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la session');
    }

    return response.json();
  }
);

const initialState: SessionsState = {
  sessions: null,
  currentSession: null,
  loading: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Fetch Session by ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Join Session
      .addCase(joinSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        
        // Mettre à jour la session dans la liste des sessions
        if (state.sessions) {
          const index = state.sessions.findIndex(s => s.id === action.payload.id);
          if (index !== -1) {
            state.sessions[index] = action.payload;
          }
        }
      })
      .addCase(joinSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Leave session
      .addCase(leaveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        
        // Mettre à jour la session dans la liste des sessions
        if (state.sessions) {
          const index = state.sessions.findIndex(s => s.id === action.payload.id);
          if (index !== -1) {
            state.sessions[index] = action.payload;
          }
        }
      })
      .addCase(leaveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Create session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        // Ajouter la session nouvellement créée à la liste des sessions
        if (state.sessions) {
          state.sessions = [...state.sessions, action.payload];
        } else {
          state.sessions = [action.payload];
        }
        // Définir la session créée comme session courante
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création de la session';
      });
  },
});

export const { clearCurrentSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;