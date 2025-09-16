import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AimReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AimReviewModal({ visible, onClose }: AimReviewModalProps) {
  const [completed, setCompleted] = useState(false);
  const [log, setLog] = useState('');

  const handleSave = () => {
    if (log.trim()) {
      setCompleted(true);
    }
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
          <Text style={styles.title}>Aim Review</Text>
          <Text style={styles.subtitle}>Check in on a short- or long-term goal. Are your current actions aligned?</Text>
          {!completed && (
            <>
              <TextInput
                style={styles.input}
                placeholder="What's your goal? Are you aligned?"
                value={log}
                onChangeText={setLog}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Review Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
          {completed && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>Purpose ring strengthened!</Text>
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
    minHeight: 400,
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
  input: {
    width: 240,
    height: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    color: '#222',
    backgroundColor: '#F3F4F6',
    textAlignVertical: 'top',
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