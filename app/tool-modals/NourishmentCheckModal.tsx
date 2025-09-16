import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NourishmentCheckModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NourishmentCheckModal({ visible, onClose }: NourishmentCheckModalProps) {
  const [completed, setCompleted] = useState(false);
  const [food, setFood] = useState('');

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
          <Text style={styles.title}>Nourishment Check</Text>
          <Text style={styles.subtitle}>Eat a nutrient-dense snack or light meal. Avoid multitasking.</Text>
          {!completed && (
            <>
              <TextInput
                style={styles.input}
                placeholder="What did you eat? (optional)"
                value={food}
                onChangeText={setFood}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.button} onPress={handleMarkComplete}>
                <Text style={styles.buttonText}>Mark Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
          {completed && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>Energy ring recovering!</Text>
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
  input: {
    width: 240,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    color: '#222',
    backgroundColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#4ADE80',
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
    color: '#16A34A',
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