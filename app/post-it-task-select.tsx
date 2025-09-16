import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function PostItTaskSelectScreen() {
  const router = useRouter();
  const { t1 = '', t2 = '', t3 = '' } = useLocalSearchParams<{
    t1?: string;
    t2?: string;
    t3?: string;
  }>();

  const tasks = [String(t1), String(t2), String(t3)].filter(Boolean);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelect = (taskText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/post-it-timer', params: { task: taskText } });
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              fill="#000000"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Choose your focus</Text>
          <Text style={styles.subtitle}>
            Pick one task to tackle right now. We’ll set a short focus timer and cheer you on!
          </Text>

          <View style={styles.tasksContainer}>
            {tasks.map((text, index) => (
              <TouchableOpacity key={`${index}-${text}`} style={styles.taskButton} onPress={() => handleSelect(text)}>
                <Text style={styles.taskButtonText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 32,
    marginBottom: 34,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  tasksContainer: {
    width: '100%',
    gap: 16,
  },
  taskButton: {
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  taskButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 