import React, { useState } from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PleasurePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PleasurePlaylistModal({ visible, onClose }: PleasurePlaylistModalProps) {
  const [completed, setCompleted] = useState(false);

  const handleOpenMusicApp = () => {
    // This will open the user's default music app, but you might want to specify one
    Linking.openURL('spotify:').catch(() => Linking.openURL('music:'));
  };

  const handleMarkComplete = () => {
    setCompleted(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Pleasure Playlist</Text>
          <Text style={styles.subtitle}>Listen to 2 songs that spark happiness.</Text>
          {!completed && (
            <>
              <TouchableOpacity style={styles.button} onPress={handleOpenMusicApp}>
                <Text style={styles.buttonText}>Open Music App</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleMarkComplete}>
                <Text style={styles.secondaryButtonText}>Mark Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
          {completed && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>Mood lifted!</Text>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    minHeight: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: 12,
    width: 220,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0284C7',
    fontWeight: '600',
    fontSize: 16,
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  completionText: {
    fontSize: 18,
    color: '#1D4ED8',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
  },
  closeButtonText: {
    color: '#888',
    fontSize: 16,
  },
}); 