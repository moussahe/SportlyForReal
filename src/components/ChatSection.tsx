import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import colors from '../theme/colors';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

interface ChatSectionProps {
  sessionId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  sessionId,
  messages,
  onSendMessage,
}) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {format(new Date(item.timestamp), 'HH:mm', { locale: fr })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat de session</Text>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        inverted
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Votre message..."
          placeholderTextColor={colors.text.secondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 15,
  },
  messagesList: {
    maxHeight: 300,
  },
  messageContainer: {
    backgroundColor: colors.background.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.light,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.light,
  },
  sendButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '500',
  },
}); 