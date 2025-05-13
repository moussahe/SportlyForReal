import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User, SessionStatus } from '../../types';
import { EXPO_PUBLIC_API_URL  } from '../../config';
import { RootState } from '../store';
import { handleAuthError } from '../../utils/authUtils';
import { determineSessionStatus } from '../../utils/timeUtils';

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

interface UpdateSessionStatusPayload {
  sessionId: string;
  status: SessionStatus;
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
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/sessions/${sessionId}`, {
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
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/sessions/${sessionId}/join`, {
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
    
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/sessions/${sessionId}/leave`, {
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
  async (sessionData: CreateSessionPayload, { getState, dispatch }) => {
    // Obtention de l'ID de l'utilisateur connecté
    const state = getState() as RootState;
    const hostId = state.user.currentUser?.id || '7c7d0616-f0b1-4c1d-ae6a-bf7bd5113d91'; // ID par défaut en dev

    // Récupérer le token depuis le state Redux
    const { auth } = getState() as { auth: { token: string | null } };
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification s'il existe
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }

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
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la session');
    }

    const newSession = await response.json();
    
    // Ajouter automatiquement l'hôte à l'équipe par défaut (généralement la première équipe)
    try {
      // Considérer la première équipe comme l'équipe par défaut
      // Note: nous supposons que la session retournée contient un tableau d'équipes
      if (newSession && newSession.teams && newSession.teams.length > 0) {
        const defaultTeamId = newSession.teams[0].id;
        
        // Utiliser l'action joinSession pour ajouter l'hôte à l'équipe
        const updatedSession = await dispatch(joinSession({
          sessionId: newSession.id,
          userId: hostId,
          teamId: defaultTeamId
        })).unwrap();
        
        // Retourner la session mise à jour avec l'hôte déjà dans l'équipe
        return updatedSession;
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout automatique de l'hôte à l'équipe:", error);
      // On ne propage pas cette erreur pour ne pas bloquer la création de session
    }

    return newSession;
  }
);

export const updateSessionStatus = createAsyncThunk(
  'sessions/updateSessionStatus',
  async ({ sessionId, status }: UpdateSessionStatusPayload, { getState, rejectWithValue }) => {
    try {
      // Récupérer le state pour vérifier le statut actuel et éviter les requêtes inutiles
      const state = getState() as RootState;
      const currentSession = state.sessions.sessions?.find(s => s.id === sessionId) || state.sessions.currentSession;
      
      // Éviter de faire une requête si la session est déjà au bon statut (optimisation)
      if (currentSession && currentSession.status === status) {
        return currentSession;
      }
      
      // Récupérer le token depuis le state Redux
      const { auth } = getState() as { auth: { token: string | null } };
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }
      
      // Requête API pour mettre à jour le statut
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Erreur lors de la mise à jour du statut de la session');
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la session:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
);

/**
 * Vérifie et met à jour automatiquement le statut d'une session en fonction de l'heure actuelle
 */
export const checkAndUpdateSessionStatus = createAsyncThunk(
  'sessions/checkAndUpdateSessionStatus',
  async (sessionId: string, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const session = state.sessions.sessions?.find(s => s.id === sessionId) || state.sessions.currentSession;
      
      if (!session) {
        // Essayer de charger la session si elle n'est pas dans le state
        await dispatch(fetchSessionById(sessionId)).unwrap();
        const updatedState = getState() as RootState;
        const fetchedSession = updatedState.sessions.currentSession;
        if (!fetchedSession) return null;
        
        return handleSessionStatusUpdate(fetchedSession, dispatch);
      }
      
      return handleSessionStatusUpdate(session, dispatch);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de la session:', error);
      throw error;
    }
  }
);

/**
 * Fonction helper pour la mise à jour du statut d'une session
 */
const handleSessionStatusUpdate = async (session: Session, dispatch: any): Promise<Session | null> => {
  const statusInfo = determineSessionStatus(session);
  
  // Vérifier si la session devrait passer à IN_PROGRESS
  if (statusInfo.shouldStart) {
    console.log(`Session ${session.id} devrait passer en IN_PROGRESS`);
    return dispatch(updateSessionStatus({ sessionId: session.id, status: SessionStatus.IN_PROGRESS })).unwrap();
  }
  
  // Vérifier si la session devrait passer à TERMINATED
  if (statusInfo.shouldEnd) {
    console.log(`Session ${session.id} devrait passer en TERMINATED`);
    return dispatch(updateSessionStatus({ sessionId: session.id, status: SessionStatus.TERMINATED })).unwrap();
  }
  
  return session;
};

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
      })
      // Update session status
      .addCase(updateSessionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSessionStatus.fulfilled, (state, action) => {
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
      .addCase(updateSessionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la mise à jour du statut de la session';
      });
  },
});

export const { clearCurrentSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;