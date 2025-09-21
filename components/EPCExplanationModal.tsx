import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

const { height: screenHeight } = Dimensions.get('window');

interface EPCExplanationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EPCExplanationModal({ visible, onClose }: EPCExplanationModalProps) {
  const translateY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);

  const springConfig = {
    damping: 80,
    stiffness: 400,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, springConfig);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(screenHeight, springConfig);
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(screenHeight, springConfig, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
        backdropOpacity.value = withTiming(0, { duration: 300 });
      } else {
        translateY.value = withSpring(0, springConfig);
      }
    });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <View style={styles.modal}>
            <View style={styles.handle} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>EPC Explained</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    fill="#8E8E93"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Energy Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: '#FF6B6B' }]} />
                  <Text style={styles.sectionTitle}>Energy</Text>
                </View>
                <Text style={styles.sectionText}>
                  Your physical and mental capacity to take on tasks. Energy naturally decreases throughout the day based on your activity level and automatically replenishes during sleep.
                </Text>
                <View style={styles.bulletPoints}>
                  <Text style={styles.bulletPoint}>• Decreases with physical and mental activity</Text>
                  <Text style={styles.bulletPoint}>• Restores during quality sleep</Text>
                  <Text style={styles.bulletPoint}>• Can be protected with energy buffers from wellness tools</Text>
                </View>
              </View>

              {/* Purpose Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: '#4ECDC4' }]} />
                  <Text style={styles.sectionTitle}>Purpose</Text>
                </View>
                <Text style={styles.sectionText}>
                  Your sense of meaning and direction in life. Purpose reflects how aligned your actions are with your values and long-term goals.
                </Text>
                <View style={styles.bulletPoints}>
                  <Text style={styles.bulletPoint}>• Built through meaningful activities</Text>
                  <Text style={styles.bulletPoint}>• Strengthened by value-aligned decisions</Text>
                  <Text style={styles.bulletPoint}>• Enhanced by completing wellness tools</Text>
                </View>
              </View>

              {/* Connection Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: '#45B7D1' }]} />
                  <Text style={styles.sectionTitle}>Connection</Text>
                </View>
                <Text style={styles.sectionText}>
                  Your sense of belonging and social support. Connection measures the quality of your relationships and community involvement.
                </Text>
                <View style={styles.bulletPoints}>
                  <Text style={styles.bulletPoint}>• Grows through meaningful social interactions</Text>
                  <Text style={styles.bulletPoint}>• Strengthened by helping others</Text>
                  <Text style={styles.bulletPoint}>• Boosted by community engagement</Text>
                </View>
              </View>

              {/* How Scores Work */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How Your Scores Work</Text>
                <Text style={styles.sectionText}>
                  Your EPC scores are calculated based on your onboarding assessment, daily activities, and wellness tool completions. They update in real-time to reflect your current wellbeing state.
                </Text>
                <View style={styles.bulletPoints}>
                  <Text style={styles.bulletPoint}>• Scores range from 0-100</Text>
                  <Text style={styles.bulletPoint}>• Updated through wellness tool completion</Text>
                  <Text style={styles.bulletPoint}>• Energy decreases naturally, Purpose and Connection are maintained through action</Text>
                  <Text style={styles.bulletPoint}>• Effects from tools can create temporary buffers and lasting improvements</Text>
                </View>
              </View>

              {/* Effects Explanation */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Effects</Text>
                <Text style={styles.sectionText}>
                  When you see icons next to your scores, you have active effects improving your wellbeing:
                </Text>
                <View style={styles.effectExplanation}>
                  <View style={styles.effectItem}>
                    <Text style={styles.effectIcon}>🛡️</Text>
                    <View style={styles.effectDetails}>
                      <Text style={styles.effectName}>Energy Buffer</Text>
                      <Text style={styles.effectDescription}>Slows down natural energy decay for a limited time</Text>
                    </View>
                  </View>
                  <View style={styles.effectItem}>
                    <Text style={styles.effectIcon}>🌊</Text>
                    <View style={styles.effectDetails}>
                      <Text style={styles.effectName}>Score Tails</Text>
                      <Text style={styles.effectDescription}>Provides temporary boosts to Purpose and Connection</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.85,
    padding: 8,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxHeight: screenHeight * 0.6,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3A3A3C',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bulletPoints: {
    gap: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  effectExplanation: {
    gap: 16,
    marginTop: 12,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  effectIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  effectDetails: {
    flex: 1,
  },
  effectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  effectDescription: {
    fontSize: 15,
    lineHeight: 20,
    color: '#3A3A3C',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});