import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PostItPriorityPageProps {
  visible: boolean;
  onClose: () => void;
}

export default function PostItPriorityPage({ visible, onClose }: PostItPriorityPageProps) {
  const [priority, setPriority] = useState('');
  const [completed, setCompleted] = useState(false);

  if (!visible) return null;

  const handleAddPriority = () => {
    if (priority.trim()) {
      setCompleted(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FA" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post-it Priority</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Post-it Priority</Text>
        <Text style={styles.subtitle}>Choose one priority. Focus only on that.</Text>
        
        {!completed && (
          <View style={styles.actionContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your priority..."
              value={priority}
              onChangeText={setPriority}
              placeholderTextColor="#aaa"
              multiline
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddPriority}>
              <Text style={styles.primaryButtonText}>Add Priority</Text>
            </TouchableOpacity>
          </View>
        )}

        {completed && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>🎯 You've created clarity!</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#222',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  completionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completionText: {
    fontSize: 20,
    color: '#16A34A',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 