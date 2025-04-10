import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface ChatState {
  messagesBySession: {
    [sessionId: string]: Message[];
  };
}

const initialState: ChatState = {
  messagesBySession: {},
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    sendMessage: (
      state,
      action: PayloadAction<{
        sessionId: string;
        userId: string;
        userName: string;
        text: string;
      }>
    ) => {
      const { sessionId } = action.payload;
      const newMessage: Message = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };

      if (!state.messagesBySession[sessionId]) {
        state.messagesBySession[sessionId] = [];
      }
      state.messagesBySession[sessionId].push(newMessage);
    },
    clearSessionMessages: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      delete state.messagesBySession[sessionId];
    },
  },
});

export const { sendMessage, clearSessionMessages } = chatSlice.actions;

export const selectSessionMessages = (state: RootState, sessionId: string): Message[] =>
  state.chat.messagesBySession[sessionId] || [];

export default chatSlice.reducer; 