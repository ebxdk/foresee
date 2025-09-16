import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OxygenMaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OxygenMaskModal({ visible, onClose }: OxygenMaskModalProps) {
  const [timerStarted, setTimerStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [seconds, setSeconds] = useState(600); // 10 minutes

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerStarted && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setCompleted(true);
      setTimerStarted(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStarted, seconds]);

  const handleStartTimer = () => {
    setTimerStarted(true);
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    setTimerStarted(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
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
          <Text style={styles.title}>The Oxygen Mask</Text>
          <Text style={styles.subtitle}>Take 10 minutes to rest, close your eyes, or lie down.</Text>
          {!completed && !timerStarted && (
            <TouchableOpacity style={styles.button} onPress={handleStartTimer}>
              <Text style={styles.buttonText}>Start 10-Minute Timer</Text>
            </TouchableOpacity>
          )}
          {timerStarted && !completed && (
            <>
              <Text style={styles.timer}>{formatTime(seconds)}</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleMarkComplete}>
                <Text style={styles.secondaryButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </>
          )}
          {completed && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionText}>You took a real break! Your Energy ring is recovering.</Text>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
          {!completed && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  timer: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 24,
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
    marginTop: 16,
    padding: 8,
  },
  closeButtonText: {
    color: '#888',
    fontSize: 16,
  },
}); 