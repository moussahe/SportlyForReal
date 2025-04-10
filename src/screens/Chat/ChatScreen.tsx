import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/MainStack';
import { selectSessionMessages, sendMessage } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import colors from '../../theme/colors';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  userAvatar?: string;
}

export const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const dispatch = useDispatch();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputHeight = useRef(new Animated.Value(50)).current;
  const flatListRef = useRef<FlatList>(null);
  
  const messages = useSelector((state: RootState) => 
    selectSessionMessages(state, route.params.sessionId)
  ) || [];

  const currentSession = useSelector((state: RootState) => 
    state.sessions.currentSession
  );

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      dispatch(sendMessage({
        sessionId: route.params.sessionId,
        userId: 'admin', // TODO: Utiliser l'ID de l'utilisateur connecté
        userName: 'Admin', // TODO: Utiliser le nom de l'utilisateur connecté
        text: messageText.trim(),
      }));
      setMessageText('');
      setIsTyping(false);
    }
  };

  const handleInputFocus = () => {
    setIsTyping(true);
    Animated.timing(inputHeight, {
      toValue: 80,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    Animated.timing(inputHeight, {
      toValue: 50,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.userId === 'admin'; // TODO: Comparer avec l'ID de l'utilisateur connecté
    const messageTime = format(new Date(item.timestamp), 'HH:mm');

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.userAvatar || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.userName}>{item.userName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Chat de la session</Text>
          <Text style={styles.subtitle}>
            {currentSession?.sport.name} - {format(new Date(currentSession?.dateTime || ''), 'HH:mm')}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[styles.inputContainer, { height: inputHeight }]}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Écrivez votre message..."
            placeholderTextColor={colors.text.light}
            multiline
            maxLength={500}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={messageText.trim() ? colors.text.white : colors.text.light}
            />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 5,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.background.white,
    borderBottomLeftRadius: 4,
  },
  userName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.text.white,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: colors.text.white,
    opacity: 0.7,
    textAlign: 'right',
  },
  otherTimestamp: {
    color: colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.light,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: colors.text.primary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.light,
  },
});

export default ChatScreen; 