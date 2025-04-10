import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import colors from '../../theme/colors';

export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  userAvatar?: string;
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

interface ChatV2Props {
  sessionId: string;
  userId: string;
  userName: string;
  messages: Message[];
  onSendMessage: (text: string, replyTo?: Message) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const ChatV2: React.FC<ChatV2Props> = ({
  sessionId,
  userId,
  userName,
  messages,
  onSendMessage,
  onLoadMore,
  isLoadingMore,
}) => {
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const inputHeight = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim(), replyingTo || undefined);
      setMessageText('');
      setReplyingTo(null);
      inputRef.current?.clear();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const renderMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={16} color={colors.text.secondary} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={16} color={colors.text.secondary} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={16} color={colors.primary} />;
      default:
        return null;
    }
  };

  const renderReplyPreview = (replyTo: Message['replyTo']) => {
    if (!replyTo) return null;
    return (
      <View style={styles.replyPreview}>
        <Text style={styles.replyPreviewName}>{replyTo.userName}</Text>
        <Text style={styles.replyPreviewText} numberOfLines={1}>
          {replyTo.text}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.userId === userId;
    const showAvatar = !isOwnMessage && 
      (index === 0 || messages[index - 1]?.userId !== item.userId);

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Image
                source={{ 
                  uri: item.userAvatar || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName)}&background=random&size=128` 
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          !showAvatar && !isOwnMessage && styles.messageWithoutAvatar
        ]}>
          {(!isOwnMessage && showAvatar) && (
            <Text style={styles.userName}>{item.userName}</Text>
          )}
          {item.replyTo && renderReplyPreview(item.replyTo)}
          {item.attachments?.map((attachment, index) => (
            <View key={index} style={styles.attachmentContainer}>
              {attachment.type === 'image' && (
                <Image
                  source={{ uri: attachment.url }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              )}
              {attachment.type === 'video' && (
                <View style={styles.videoContainer}>
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                  <Ionicons name="play-circle" size={40} color="white" style={styles.playIcon} />
                </View>
              )}
            </View>
          ))}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {formatMessageTime(item.timestamp)}
            </Text>
            {isOwnMessage && renderMessageStatus(item.status)}
          </View>
        </View>
      </View>
    );
  };

  const renderLoadingMore = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderLoadingMore}
        inverted={false}
      />
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <View style={styles.replyingToContent}>
            <Text style={styles.replyingToName}>
              Répondre à {replyingTo.userName}
            </Text>
            <Text style={styles.replyingToText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReplyingTo(null)}
            style={styles.closeReplyButton}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Message"
          placeholderTextColor={colors.text.light}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={messageText.trim() ? colors.primary : colors.text.light} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  messagesList: {
    padding: 10,
  },
  loadingMore: {
    padding: 10,
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 10,
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  replyPreview: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
    marginBottom: 8,
    opacity: 0.8,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  replyPreviewText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  attachmentContainer: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoContainer: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -20 },
      { translateY: -20 }
    ],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.light,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
    color: colors.text.primary,
  },
  sendButton: {
    padding: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  replyingToContent: {
    flex: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
  },
  replyingToName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  replyingToText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  closeReplyButton: {
    padding: 8,
  },
}); 