import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  }[];
  replyTo?: {
    id: string;
    text: string;
    userName: string;
  };
}

export interface ChatState {
  messagesBySession: {
    [sessionId: string]: Message[];
  };
  typingUsers: {
    [sessionId: string]: {
      userId: string;
      userName: string;
      timestamp: number;
    }[];
  };
  lastReadMessage: {
    [sessionId: string]: {
      [userId: string]: string; // messageId
    };
  };
}

const initialState: ChatState = {
  messagesBySession: {},
  typingUsers: {},
  lastReadMessage: {},
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
        replyTo?: Message;
      }>
    ) => {
      const { sessionId } = action.payload;
      const newMessage: Message = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      if (!state.messagesBySession[sessionId]) {
        state.messagesBySession[sessionId] = [];
      }
      state.messagesBySession[sessionId].push(newMessage);
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        sessionId: string;
        messageId: string;
        status: Message['status'];
      }>
    ) => {
      const { sessionId, messageId, status } = action.payload;
      const message = state.messagesBySession[sessionId]?.find(
        (m) => m.id === messageId
      );
      if (message) {
        message.status = status;
      }
    },

    setUserTyping: (
      state,
      action: PayloadAction<{
        sessionId: string;
        userId: string;
        userName: string;
        isTyping: boolean;
      }>
    ) => {
      const { sessionId, userId, userName, isTyping } = action.payload;
      
      if (!state.typingUsers[sessionId]) {
        state.typingUsers[sessionId] = [];
      }

      if (isTyping) {
        const existingIndex = state.typingUsers[sessionId].findIndex(
          (user) => user.userId === userId
        );

        if (existingIndex === -1) {
          state.typingUsers[sessionId].push({
            userId,
            userName,
            timestamp: Date.now(),
          });
        } else {
          state.typingUsers[sessionId][existingIndex].timestamp = Date.now();
        }
      } else {
        state.typingUsers[sessionId] = state.typingUsers[sessionId].filter(
          (user) => user.userId !== userId
        );
      }
    },

    markMessagesAsRead: (
      state,
      action: PayloadAction<{
        sessionId: string;
        userId: string;
        messageId: string;
      }>
    ) => {
      const { sessionId, userId, messageId } = action.payload;
      
      if (!state.lastReadMessage[sessionId]) {
        state.lastReadMessage[sessionId] = {};
      }
      
      state.lastReadMessage[sessionId][userId] = messageId;

      // Mettre à jour le statut des messages
      const messages = state.messagesBySession[sessionId];
      if (messages) {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex !== -1) {
          for (let i = 0; i <= messageIndex; i++) {
            if (messages[i].userId !== userId) {
              messages[i].status = 'read';
            }
          }
        }
      }
    },

    clearSessionMessages: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      delete state.messagesBySession[sessionId];
      delete state.typingUsers[sessionId];
      delete state.lastReadMessage[sessionId];
    },
  },
});

export const {
  sendMessage,
  updateMessageStatus,
  setUserTyping,
  markMessagesAsRead,
  clearSessionMessages,
} = chatSlice.actions;

// Sélecteurs
export const selectSessionMessages = (state: RootState, sessionId: string) =>
  state.chat.messagesBySession[sessionId] || [];

export const selectTypingUsers = (state: RootState, sessionId: string) =>
  state.chat.typingUsers[sessionId] || [];

export const selectLastReadMessage = (
  state: RootState,
  sessionId: string,
  userId: string
) => state.chat.lastReadMessage[sessionId]?.[userId];

export default chatSlice.reducer; 