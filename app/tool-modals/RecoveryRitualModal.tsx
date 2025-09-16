import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecoveryRitualModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RecoveryRitualModal({ visible, onClose }: RecoveryRitualModalProps) {
  const [completed, setCompleted] = useState(false);

  const handleSetReminder = () => {
    // Logic to set a notification
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
          <Text style={styles.title}>Recovery Ritual</Text>
          <Text style={styles.subtitle}>Choose a 5-minute routine: breathing, journaling, stretching.</Text>
          {!completed && (
            <>
              <TouchableOpacity style={styles.button} onPress={handleSetReminder}>
                <Text style={styles.buttonText}>Set Reminder</Text>
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
              <Text style={styles.completionText}>Resilience ring increased!</Text>
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
    backgroundColor: '#16A34A',
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
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: 12,
    width: 220,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#15803D',
    fontWeight: '600',
    fontSize: 16,
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  completionText: {
    fontSize: 18,
    color: '#15803D',
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