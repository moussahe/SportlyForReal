import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User } from '../../types';
import { API_URL } from '../../config';

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

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async () => {
    const response = await fetch(`${API_URL}/sessions`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des sessions');
    }
    return response.json();
  }
);

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchSessionById',
  async (sessionId: string) => {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Session non trouvée');
    }
    return response.json();
  }
);

export const joinSession = createAsyncThunk(
  'sessions/joinSession',
  async ({ sessionId, userId, teamId }: JoinSessionPayload) => {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async ({ sessionId, userId, teamId }: JoinSessionPayload) => {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, teamId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du départ de la session');
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
        if (state.sessions) {
          const index = state.sessions.findIndex(s => s.id === action.payload.id);
          if (index !== -1) {
            state.sessions[index] = action.payload;
          }
        }
        state.currentSession = null;
      })
      .addCase(leaveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { clearCurrentSession } = sessionsSlice.actions;
export default sessionsSlice.reducer; 