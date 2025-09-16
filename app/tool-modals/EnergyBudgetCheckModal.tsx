import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EnergyBudgetCheckModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EnergyBudgetCheckModal({ visible, onClose }: EnergyBudgetCheckModalProps) {
  const [completed, setCompleted] = useState(false);
  const [drainer1, setDrainer1] = useState('');
  const [drainer2, setDrainer2] = useState('');
  const [drainer3, setDrainer3] = useState('');

  const handleSave = () => {
    if (drainer1.trim() || drainer2.trim() || drainer3.trim()) {
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
          <Text style={styles.title}>Energy Budget Check</Text>
          <Text style={styles.subtitle}>List your top 3 energy-drainers today.</Text>
          {!completed && (
            <>
              <TextInput style={styles.input} placeholder="Energy-drainer 1" value={drainer1} onChangeText={setDrainer1} />
              <TextInput style={styles.input} placeholder="Energy-drainer 2" value={drainer2} onChangeText={setDrainer2} />
              <TextInput style={styles.input} placeholder="Energy-drainer 3" value={drainer3} onChangeText={setDrainer3} />
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Review Energy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
          {completed && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>Clarity achieved!</Text>
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
    minHeight: 450,
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
    marginBottom: 12,
    color: '#222',
    backgroundColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#6B7280',
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
    color: '#4B5563',
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