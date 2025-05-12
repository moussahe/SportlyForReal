import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Sport } from '../../types';
import { EXPO_PUBLIC_API_URL  } from '../../config';

interface SportsState {
  sports: Sport[] | null;
  loading: boolean;
  error: string | null;
}

export const fetchSports = createAsyncThunk(
  'sports/fetchSports',
  async () => {
    try {
      console.log(`Fetching sports from: ${EXPO_PUBLIC_API_URL }/sports`);
      const response = await fetch(`${EXPO_PUBLIC_API_URL }/sports`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors du chargement des sports'}`);
      }
      
      const data = await response.json();
      console.log('Sports loaded successfully:', data.length || 0, 'sports');
      return data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  }
);

const initialState: SportsState = {
  sports: null,
  loading: false,
  error: null,
};

const sportsSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
      })
      .addCase(fetchSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export default sportsSlice.reducer;
