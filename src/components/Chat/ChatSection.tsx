import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import colors from '../../theme/colors';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: Date;
}

interface ChatSectionProps {
  sessionId: string;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

const MessageBubble: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
  const bubbleStyle = isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble;
  const textStyle = isCurrentUser ? styles.currentUserText : styles.otherUserText;
  const timeStyle = isCurrentUser ? styles.currentUserTime : styles.otherUserTime;

  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
      {!isCurrentUser && (
        <Image source={{ uri: message.userAvatar }} style={styles.avatar} />
      )}
      <View style={[styles.bubbleContainer, isCurrentUser && styles.currentUserBubbleContainer]}>
        {!isCurrentUser && (
          <Text style={styles.userName}>{message.userName}</Text>
        )}
        <View style={[styles.bubble, bubbleStyle]}>
          <Text style={[styles.messageText, textStyle]}>{message.text}</Text>
        </View>
        <Text style={[styles.timestamp, timeStyle]}>
          {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
        </Text>
      </View>
    </View>
  );
};

export const ChatSection: React.FC<ChatSectionProps> = ({
  sessionId,
  currentUserId,
  messages,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const inputHeight = useRef(new Animated.Value(40)).current;

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.clear();
    }
  };

  const handleInputFocus = () => {
    Animated.timing(inputHeight, {
      toValue: 80,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputHeight, {
      toValue: 40,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat de la session</Text>
        <Text style={styles.subtitle}>{messages.length} messages</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.userId === currentUserId}
          />
        )}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <Animated.View style={[styles.inputWrapper, { height: inputHeight }]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Écrivez votre message..."
            placeholderTextColor={colors.text.light}
            multiline
            maxLength={500}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white,
    borderRadius: 15,
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    gap: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '80%',
  },
  currentUserBubbleContainer: {
    alignItems: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.background.light,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: colors.text.white,
  },
  otherUserText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: colors.text.secondary,
    textAlign: 'right',
  },
  otherUserTime: {
    color: colors.text.secondary,
    textAlign: 'left',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.light,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  sendButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
}); 