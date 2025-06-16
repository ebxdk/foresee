import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

// Create Animated SVG components
const AnimatedCircle = Reanimated.createAnimatedComponent(Circle);

// Animated Ring Component with Apple Fitness-inspired animations
const AnimatedRing = ({ score, size, strokeWidth, color, label, isActive }: {
  score: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  isActive: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Reanimated values for Apple-like effects
  const breathingScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Start breathing animation
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Start rotation
      rotationValue.value = withRepeat(
        withTiming(360, { duration: 120000, easing: Easing.linear }),
        -1,
        false
      );

      // Animate progress smoothly
      progressValue.value = withTiming(score / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Immediately reset when not active
      breathingScale.value = 1;
      rotationValue.value = 0;
      progressValue.value = 0;
    }
  }, [isActive, score]);

  // Animated props for SVG circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value * circumference);
    return {
      strokeDashoffset: strokeDashoffset,
    };
  });

  // Animated style for container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breathingScale.value },
        { rotate: `${rotationValue.value}deg` },
      ],
    };
  });

  return (
    <View style={styles.ringContainer}>
      <Reanimated.View style={[styles.ringWrapper, animatedStyle]}>
        <Svg width={size} height={size} style={styles.ring}>
          <Defs>
            <RadialGradient id={`ringGradient-${label}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          
          {/* Background ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F2F2F7"
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />
          
          {/* Progress ring with animated stroke */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#ringGradient-${label})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={animatedProps}
          />
        </Svg>
      </Reanimated.View>
      
      <View style={[styles.ringContent, { width: size, height: size }]}>
        <Text style={styles.ringScore}>{score}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  const [currentRingIndex, setCurrentRingIndex] = useState(0);
  const scrollRef = useRef<FlatList<any>>(null);
  const scrollStartX = useRef(0);
  
  const ringItemWidth = screenWidth;
  const ringSize = 220;

  // Animated values for smooth dot transitions
  const dotAnimations = useRef(
    [0, 1, 2].map((_, index) => new Animated.Value(index === 0 ? 1 : 0))
  ).current;

  const capacityData = [
    { score: 78, label: 'Energy', color: '#34C759', emoji: '⚡' },
    { score: 65, label: 'Purpose', color: '#007AFF', emoji: '🎯' },
    { score: 82, label: 'Connection', color: '#FF9500', emoji: '🤝' },
  ];

  const animateDots = (activeIndex: number) => {
    dotAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activeIndex ? 1 : 0,
        useNativeDriver: false,
        tension: 200,
        friction: 25,
      }).start();
    });
  };

  const goToRing = (index: number) => {
    if (index >= 0 && index < capacityData.length && index !== currentRingIndex) {
      setCurrentRingIndex(index);
      
      // Smooth animated scroll to target ring
      scrollRef.current?.scrollToIndex({ 
        index, 
        animated: true,
        viewPosition: 0.5 
      });
      
      // Animate dots with smoother spring physics
      animateDots(index);
      
      // Haptic feedback with light impact for smoother feel
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleScrollBeginDrag = (event: any) => {
    scrollStartX.current = event.nativeEvent.contentOffset.x;
  };

  const handleScrollEndDrag = (event: any) => {
    const scrollEndX = event.nativeEvent.contentOffset.x;
    const swipeThreshold = 50; // Increased threshold for less sensitive swiping
    const swipeDistance = scrollEndX - scrollStartX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && currentRingIndex < capacityData.length - 1) {
        // Swiped left, go to next ring
        goToRing(currentRingIndex + 1);
      } else if (swipeDistance < 0 && currentRingIndex > 0) {
        // Swiped right, go to previous ring
        goToRing(currentRingIndex - 1);
      } else {
        // Snap back to current ring with smooth animation
        goToRing(currentRingIndex);
      }
    } else {
      // Small swipe, snap back to current ring
      goToRing(currentRingIndex);
    }
  };

  // Handle smooth momentum scroll end
  const handleMomentumScrollEnd = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / ringItemWidth);
    
    if (newIndex !== currentRingIndex && newIndex >= 0 && newIndex < capacityData.length) {
      setCurrentRingIndex(newIndex);
      animateDots(newIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderRing = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.ringItem} key={`ring-${index}-${item.label}`}>
      <AnimatedRing
        score={item.score}
        size={220}
        strokeWidth={32}
        color={item.color}
        label={item.label}
        isActive={index === currentRingIndex}
      />
    </View>
  );

  const currentData = capacityData[currentRingIndex];

  return (
    <SafeAreaView style={styles.container}> 
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.subtitle}>You're feeling <Text style={styles.state}>Energized</Text> today</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Capacity</Text>
          
          {/* Horizontal Scrollable Rings */}
          <View style={styles.ringSection}>
            <FlatList
              ref={scrollRef}
              data={capacityData}
              renderItem={renderRing}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              bounces={true}
              bouncesZoom={false}
              alwaysBounceHorizontal={true}
              scrollEventThrottle={16}
              decelerationRate={0.985} // Slower deceleration for smoother feel
              contentContainerStyle={styles.ringsContainer}
              getItemLayout={(data, index) => ({
                length: ringItemWidth,
                offset: ringItemWidth * index,
                index,
              })}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              snapToInterval={ringItemWidth}
              snapToAlignment="center"
              pagingEnabled={false}
            />
            
            {/* Current Ring Info */}
            <View style={styles.currentRingInfo}>
              <Text style={styles.ringEmoji}>{currentData.emoji}</Text>
              <Text style={styles.ringDescription}>
                Your {currentData.label.toLowerCase()} level is {currentData.score > 75 ? 'excellent' : currentData.score > 50 ? 'good' : 'needs attention'}
              </Text>
            </View>
            
            {/* iOS-Style Animated Indicators */}
            <View style={styles.indicators}>
              {capacityData.map((_, index) => {
                const dotWidth = dotAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 32],
                  extrapolate: 'clamp',
                });
                
                const dotOpacity = dotAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        width: dotWidth,
                        opacity: dotOpacity,
                        backgroundColor: '#007AFF',
                      }
                    ]}
                  />
                );
              })}
            </View>
          </View>
          
          {/* All Rings Summary - Enhanced Apple-level Design */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Today's Snapshot</Text>
              <Text style={styles.summarySubtitle}>Your capacity at a glance</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              {capacityData.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <View style={styles.summaryItemContent}>
                    <View style={styles.summaryLeft}>
                      <View style={[styles.summaryIconContainer, { backgroundColor: `${item.color}15` }]}>
                        <Text style={[styles.summaryEmoji, { color: item.color }]}>{item.emoji}</Text>
                      </View>
                      <View style={styles.summaryTextContainer}>
                        <Text style={styles.summaryLabel}>{item.label}</Text>
                        <View style={styles.summaryProgressContainer}>
                          <View style={styles.summaryProgress}>
                            <View 
                              style={[
                                styles.summaryProgressFill, 
                                { 
                                  width: `${item.score}%`,
                                  backgroundColor: item.color 
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.summaryProgressLabel}>{item.score}%</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.summaryRight}>
                      <View style={styles.summaryScoreContainer}>
                        <Text style={[styles.summaryScore, { color: item.color }]}>{item.score}</Text>
                        <Text style={styles.summaryUnit}>%</Text>
                      </View>
                      <View style={[styles.summaryStatusIndicator, { backgroundColor: item.color }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Quick insights at the bottom */}
            <View style={styles.summaryInsights}>
              <View style={styles.insightChip}>
                <Text style={styles.insightChipText}>🎯 Peak Focus: 2:00 PM</Text>
              </View>
              <View style={styles.insightChip}>
                <Text style={styles.insightChipText}>⚡ High Energy</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Text style={styles.insightEmoji}>⚡</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Peak Energy Window</Text>
              <Text style={styles.insightSubtitle}>9:00 AM - 11:00 AM today</Text>
            </View>
            <Text style={styles.insightAction}>›</Text>
          </View>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Text style={styles.insightEmoji}>🎯</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Focus Recommendation</Text>
              <Text style={styles.insightSubtitle}>Deep work sessions</Text>
            </View>
            <Text style={styles.insightAction}>›</Text>
          </View>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Text style={styles.insightEmoji}>🤝</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Social Energy</Text>
              <Text style={styles.insightSubtitle}>High connection level</Text>
            </View>
            <Text style={styles.insightAction}>›</Text>
          </View>
        </View>
        
        {/* Weekly Trends */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.trendsList}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Average Energy</Text>
              <View style={styles.trendRight}>
                <Text style={styles.trendValue}>76</Text>
                <Text style={styles.trendChange}>+4</Text>
              </View>
            </View>
            
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Peak Days</Text>
              <View style={styles.trendRight}>
                <Text style={styles.trendValue}>5</Text>
                <Text style={styles.trendChange}>+2</Text>
              </View>
            </View>
            
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Consistency</Text>
              <View style={styles.trendRight}>
                <Text style={styles.trendValue}>89%</Text>
                <Text style={styles.trendChange}>+12%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    marginHorizontal: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    marginHorizontal: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  state: {
    color: '#34C759',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginHorizontal: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
    position: 'relative',
  },
  ringWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  ringScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -1.5,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  ringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: 'System',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  ringItem: {
    width: screenWidth,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    alignItems: 'center',
    height: 240,
  },
  currentRingInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
    maxWidth: 300,
  },
  ringEmoji: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 48,
  },
  ringDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
    letterSpacing: -0.1,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
    letterSpacing: -0.4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  summarySubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6E6E73',
    lineHeight: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  summaryTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    marginBottom: 4,
  },
  summaryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryProgress: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryProgressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  summaryScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  summaryScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  summaryUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 2,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  summaryStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  summaryInsights: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  insightChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  insightsSection: {
    padding: 24,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  insightSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  insightAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  insightEmoji: {
    fontSize: 24,
  },
  trendsSection: {
    padding: 24,
  },
  trendsList: {
    gap: 16,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  trendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  trendChange: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34C759',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
