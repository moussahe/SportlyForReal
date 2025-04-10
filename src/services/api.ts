import axios from 'axios';
import { CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: CONFIG.DEFAULT_TIMEOUT,
});

export const sportlyAPI = {
  // Sessions
  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  getSessionById: async (id: string) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (sessionId: string, userId: string) => {
    const response = await api.post(`/sessions/${sessionId}/join`, { userId });
    return response.data;
  },

  // Sports
  getSports: async () => {
    const response = await api.get('/sports');
    return response.data;
  },

  // Workouts
  getWorkouts: async () => {
    const response = await api.get('/workouts');
    return response.data;
  },

  getWorkoutById: async (id: string) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  // Users
  getUserProfile: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUserProfile: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export default sportlyAPI; 