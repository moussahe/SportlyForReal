import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ChatBox } from './ChatBox';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose, sessionId }) => {
  const currentUser = useSelector((state: RootState) => state.sessions.currentSession?.host);

  if (!currentUser) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <ChatBox
          sessionId={sessionId}
          userId={currentUser.id}
          userName={currentUser.name}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
}); 