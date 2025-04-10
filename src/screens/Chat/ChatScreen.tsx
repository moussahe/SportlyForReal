import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/MainStack';
import { RootState } from '../../store/store';
import {
  sendMessage,
  selectSessionMessages,
  selectTypingUsers,
  setUserTyping,
  markMessagesAsRead,
  Message,
} from '../../store/slices/chatSlice';
import { ChatV2 } from '../../components/Chat/ChatV2';
import colors from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const dispatch = useDispatch();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messages = useSelector((state: RootState) => 
    selectSessionMessages(state, route.params.sessionId)
  );

  const typingUsers = useSelector((state: RootState) =>
    selectTypingUsers(state, route.params.sessionId)
  );

  const currentSession = useSelector((state: RootState) => 
    state.sessions.currentSession
  );

  const currentUser = currentSession?.host;

  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const lastMessage = messages[messages.length - 1];
      dispatch(markMessagesAsRead({
        sessionId: route.params.sessionId,
        userId: currentUser.id,
        messageId: lastMessage.id,
      }));
    }
  }, [messages, currentUser]);

  const handleSendMessage = (text: string, replyTo?: Message) => {
    if (!currentUser) return;

    dispatch(sendMessage({
      sessionId: route.params.sessionId,
      userId: currentUser.id,
      userName: currentUser.name,
      text: text.trim(),
      replyTo,
    }));
  };

  const handleLoadMore = () => {
    // TODO: Implémenter le chargement des messages plus anciens
    console.log('Chargement des messages plus anciens...');
  };

  if (!currentUser || !currentSession) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Session non trouvée</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {currentSession.sport.name}
          </Text>
          {typingUsers.length > 0 && (
            <Text style={styles.typingText}>
              {typingUsers.map(user => user.userName).join(', ')} écrit...
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ChatV2
        sessionId={route.params.sessionId}
        userId={currentUser.id}
        userName={currentUser.name}
        messages={messages}
        onSendMessage={handleSendMessage}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  typingText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '500',
  },
}); 