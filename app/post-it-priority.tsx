import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface CardData {
  id: string;
  color: string;
  initialLeft: number;
  initialTop: number;
}

export default function PostItPriorityPage() {
  const router = useRouter();
  const [cardOrder, setCardOrder] = useState<string[]>(['card1', 'card2', 'card3']);

  // Slot positions
  const LEFT_X = 20;
  const MID_X = 102;
  const RIGHT_X = 185;
  const GROUND_Y = 20;
  const LIFT_Y = -24;

  // Animation timing
  const LIFT_MS = 420;
  const MOVE_MS = 480;
  const FILL_MS = 420;
  const DROP_MS = 420;
  const PAUSE_MS = 700;

  // Easing
  const ease = Easing.bezier(0.25, 0.46, 0.45, 0.94);

  // Animation values for each card
  const cardPositions = {
    card1: {
      left: useSharedValue(LEFT_X),
      top: useSharedValue(GROUND_Y),
      zIndex: useSharedValue(1),
      scale: useSharedValue(1),
      rotation: useSharedValue(0), // degrees
    },
    card2: {
      left: useSharedValue(MID_X),
      top: useSharedValue(GROUND_Y),
      zIndex: useSharedValue(1),
      scale: useSharedValue(1),
      rotation: useSharedValue(0),
    },
    card3: {
      left: useSharedValue(RIGHT_X),
      top: useSharedValue(GROUND_Y),
      zIndex: useSharedValue(1),
      scale: useSharedValue(1),
      rotation: useSharedValue(0),
    },
  } as const;

  // Define the card data with initial visual positions and colors
  const cards: CardData[] = [
    { id: 'card1', color: '#45B7D1', initialLeft: LEFT_X, initialTop: GROUND_Y }, // Blue
    { id: 'card2', color: '#4ECDC4', initialLeft: MID_X, initialTop: GROUND_Y }, // Teal
    { id: 'card3', color: '#FF6B6B', initialLeft: RIGHT_X, initialTop: GROUND_Y }, // Coral
  ];

  const getCardStyle = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    return { backgroundColor: card?.color };
  };

  // Animated styles for each card
  const card1AnimatedStyle = useAnimatedStyle(() => ({
    left: cardPositions.card1.left.value,
    top: cardPositions.card1.top.value,
    zIndex: cardPositions.card1.zIndex.value,
    transform: [
      { scale: cardPositions.card1.scale.value },
      { rotateZ: `${cardPositions.card1.rotation.value}deg` },
    ],
  }));

  const card2AnimatedStyle = useAnimatedStyle(() => ({
    left: cardPositions.card2.left.value,
    top: cardPositions.card2.top.value,
    zIndex: cardPositions.card2.zIndex.value,
    transform: [
      { scale: cardPositions.card2.scale.value },
      { rotateZ: `${cardPositions.card2.rotation.value}deg` },
    ],
  }));

  const card3AnimatedStyle = useAnimatedStyle(() => ({
    left: cardPositions.card3.left.value,
    top: cardPositions.card3.top.value,
    zIndex: cardPositions.card3.zIndex.value,
    transform: [
      { scale: cardPositions.card3.scale.value },
      { rotateZ: `${cardPositions.card3.rotation.value}deg` },
    ],
  }));

  // Alternate active slots to ensure only 1-slot moves and no overlap
  const nextActiveSlotRef = useRef<1 | 2>(1);

  useEffect(() => {
    const animateCards = () => {
      const [leftId, midId, rightId] = cardOrder;
      const left = cardPositions[leftId as keyof typeof cardPositions];
      const mid = cardPositions[midId as keyof typeof cardPositions];
      const right = cardPositions[rightId as keyof typeof cardPositions];

      // Reset transforms each cycle
      left.scale.value = 1;
      left.rotation.value = 0;
      mid.scale.value = 1;
      mid.rotation.value = 0;
      right.scale.value = 1;
      right.rotation.value = 0;

      const active = nextActiveSlotRef.current;

      if (active === 1) {
        // Active LEFT: left lifts -> moves above MID -> MID fills LEFT -> left drops to MID
        left.zIndex.value = withTiming(20, { duration: 0 });
        left.top.value = withTiming(LIFT_Y, { duration: LIFT_MS, easing: ease });
        left.scale.value = withTiming(1.05, { duration: LIFT_MS, easing: ease });
        left.rotation.value = withTiming(3, { duration: LIFT_MS, easing: ease });

        setTimeout(() => {
          left.left.value = withTiming(MID_X, { duration: MOVE_MS, easing: ease });
        }, LIFT_MS);

        setTimeout(() => {
          mid.left.value = withTiming(LEFT_X, { duration: FILL_MS, easing: ease });
        }, LIFT_MS + MOVE_MS);

        setTimeout(() => {
          left.top.value = withTiming(GROUND_Y, { duration: DROP_MS, easing: ease });
          left.scale.value = withTiming(1, { duration: DROP_MS, easing: ease });
          left.rotation.value = withTiming(0, { duration: DROP_MS, easing: ease });
          left.zIndex.value = withTiming(1, { duration: 0 });
        }, LIFT_MS + MOVE_MS + FILL_MS);

        // Update order: swap LEFT and MIDDLE
        setTimeout(() => {
          setCardOrder(([l, m, r]) => [m, l, r]);
        }, LIFT_MS + MOVE_MS + FILL_MS + DROP_MS + 50);

        nextActiveSlotRef.current = 2;
      } else {
        // Active MIDDLE: mid lifts -> moves above RIGHT -> RIGHT fills MIDDLE -> mid drops to RIGHT
        mid.zIndex.value = withTiming(20, { duration: 0 });
        mid.top.value = withTiming(LIFT_Y, { duration: LIFT_MS, easing: ease });
        mid.scale.value = withTiming(1.05, { duration: LIFT_MS, easing: ease });
        mid.rotation.value = withTiming(3, { duration: LIFT_MS, easing: ease });

        setTimeout(() => {
          mid.left.value = withTiming(RIGHT_X, { duration: MOVE_MS, easing: ease });
        }, LIFT_MS);

        setTimeout(() => {
          right.left.value = withTiming(MID_X, { duration: FILL_MS, easing: ease });
        }, LIFT_MS + MOVE_MS);

        setTimeout(() => {
          mid.top.value = withTiming(GROUND_Y, { duration: DROP_MS, easing: ease });
          mid.scale.value = withTiming(1, { duration: DROP_MS, easing: ease });
          mid.rotation.value = withTiming(0, { duration: DROP_MS, easing: ease });
          mid.zIndex.value = withTiming(1, { duration: 0 });
        }, LIFT_MS + MOVE_MS + FILL_MS);

        // Update order: swap MIDDLE and RIGHT
        setTimeout(() => {
          setCardOrder(([l, m, r]) => [l, r, m]);
        }, LIFT_MS + MOVE_MS + FILL_MS + DROP_MS + 50);

        nextActiveSlotRef.current = 1;
      }
    };

    // Kick off
    const startDelay = setTimeout(animateCards, 600);
    // Loop
    const interval = setInterval(animateCards, LIFT_MS + MOVE_MS + FILL_MS + DROP_MS + PAUSE_MS);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [cardOrder]);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/post-it-task-entry');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path fill="#000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Cards Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.cardsContainer}>
                  {cards.map((card) => (
                    <Animated.View
                      key={card.id}
                      style={[
                        styles.card,
                        getCardStyle(card.id),
                        card.id === 'card1' && card1AnimatedStyle,
                        card.id === 'card2' && card2AnimatedStyle,
                        card.id === 'card3' && card3AnimatedStyle,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Overwhelmed by your endless to-do list?</Text>
                <Text style={styles.subtitle}>Decision fatigue makes everything harder.</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Get Started Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
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
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  cardsContainer: {
    width: 280,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: 75,
    height: 60,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 32,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 