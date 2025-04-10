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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const recordingTimer = useRef<NodeJS.Timeout>();
  const inputHeight = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim(), replyingTo || undefined);
      setMessageText('');
      setReplyingTo(null);
      inputRef.current?.clear();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.userId === userId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${item.userName}&background=random` }}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
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
              {attachment.type === 'audio' && (
                <View style={styles.audioContainer}>
                  <Ionicons name="musical-note" size={24} color={colors.text.secondary} />
                  <View style={styles.audioProgressBar} />
                  <Text style={styles.audioTime}>0:30</Text>
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
        {messageText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Ionicons name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => setIsRecording(!isRecording)}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : "mic"}
              size={24}
              color={isRecording ? colors.status.error : colors.primary}
            />
            {isRecording && (
              <Text style={styles.recordingTime}>
                {formatRecordingTime(recordingTime)}
              </Text>
            )}
          </TouchableOpacity>
        )}
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
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
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
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  audioProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
  },
  audioTime: {
    fontSize: 12,
    color: colors.text.secondary,
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
  micButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordingTime: {
    fontSize: 12,
    color: colors.status.error,
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