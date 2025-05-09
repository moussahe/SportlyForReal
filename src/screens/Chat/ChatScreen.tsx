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
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Keyboard,
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const messages = useSelector((state: RootState) => 
    selectSessionMessages(state, route.params.sessionId)
  ) || [];

  const currentSession = useSelector((state: RootState) => 
    state.sessions.currentSession
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Gérer les événements du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (messageText.trim()) {
      setIsSending(true);
      
      try {
        await dispatch(sendMessage({
          sessionId: route.params.sessionId,
          userId: 'admin', // TODO: Utiliser l'ID de l'utilisateur connecté
          userName: 'Admin', // TODO: Utiliser le nom de l'utilisateur connecté
          text: messageText.trim(),
        }));
      } finally {
        setMessageText('');
        setIsSending(false);
      }
    }
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isOwnMessage = item.userId === 'admin'; // TODO: Comparer avec l'ID de l'utilisateur connecté
    const messageTime = format(new Date(item.timestamp), 'HH:mm');
    const isFirstMessageOfGroup = index === 0 || 
      messages[index - 1].userId !== item.userId;
    const isLastMessageOfGroup = index === messages.length - 1 || 
      messages[index + 1].userId !== item.userId;

    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] }
        ]}
      >
        {!isOwnMessage && isLastMessageOfGroup && (
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.userAvatar || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </View>
        )}
        
        {!isOwnMessage && !isLastMessageOfGroup && (
          <View style={styles.avatarPlaceholder} />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          isFirstMessageOfGroup && (isOwnMessage ? styles.firstOwnMessage : styles.firstOtherMessage),
          isLastMessageOfGroup && (isOwnMessage ? styles.lastOwnMessage : styles.lastOtherMessage),
        ]}>
          {!isOwnMessage && isFirstMessageOfGroup && (
            <Text style={styles.userName}>{item.userName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          {isLastMessageOfGroup && (
            <Text style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
            ]}>
              {messageTime}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerBgColor = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            backgroundColor: headerBgColor,
            shadowOpacity: headerOpacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Chat de la session</Text>
          <Text style={styles.subtitle}>
            {currentSession?.sport.name} - {format(new Date(currentSession?.dateTime || new Date()), 'HH:mm')}
          </Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Messages List et Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Messages List */}
        <Animated.FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            isKeyboardVisible && { paddingBottom: 10 } // Ajuster le padding lorsque le clavier est visible
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color={colors.text.light} />
              <Text style={styles.emptyText}>Démarrez la conversation !</Text>
              <Text style={styles.emptySubtext}>Soyez le premier à envoyer un message</Text>
            </View>
          )}
        />

        {/* Input Section */}
        <View style={styles.typingArea}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Écrivez votre message..."
              placeholderTextColor={colors.text.light}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                !messageText.trim() && styles.sendButtonDisabled,
                isSending && styles.sendingButton
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={messageText.trim() ? colors.text.white : colors.text.light}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    paddingVertical: 12,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 15,
    paddingTop: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.light,
    marginTop: 8,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    maxWidth: '90%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
    marginBottom: 2,
  },
  firstOwnMessage: {
    borderTopRightRadius: 18,
  },
  lastOwnMessage: {
    borderBottomRightRadius: 4,
    marginBottom: 8,
  },
  firstOtherMessage: {
    borderTopLeftRadius: 18,
  },
  lastOtherMessage: {
    borderBottomLeftRadius: 4,
    marginBottom: 8,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  otherMessageBubble: {
    backgroundColor: colors.background.white,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 15,
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
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: colors.text.secondary,
  },
  typingArea: {
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5, // Réduit pour réduire l'espace
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.light,
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 120,
    color: colors.text.primary,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.light,
    shadowOpacity: 0,
  },
  sendingButton: {
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
});

export default ChatScreen;