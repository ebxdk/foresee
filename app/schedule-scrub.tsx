import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function ScheduleScrubPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/schedule-scrub-identify');
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
            <Path
              fill="#000"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
            />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Calendar with Scrub Brush Icon */}
              <View style={styles.iconContainer}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                  {/* Calendar shape */}
                  <Rect x="25" y="35" width="90" height="80" rx="15" fill="#F3F4F6" stroke="#000" strokeWidth="2"/>
                  <Rect x="25" y="25" width="90" height="15" rx="5" fill="#000" />
                  <Circle cx="45" cy="32" r="3" fill="#FFF"/>
                  <Circle cx="95" cy="32" r="3" fill="#FFF"/>

                  {/* Brush handle */}
                  <Path d="M105,65 L125,45 Q130,40 135,45 L135,55 Q130,60 125,65 Z" fill="#4ECDC4" stroke="#000" strokeWidth="1.5" />
                  {/* Brush bristles */}
                  <Rect x="120" y="48" width="10" height="30" rx="3" fill="#666666"/>
                  <Rect x="123" y="50" width="8" height="26" fill="#888888"/>
                  
                  {/* Calendar details */}
                  <Text x="50" y="70" fill="#000" fontSize="18" fontWeight="bold">24</Text>
                  <Text x="60" y="88" fill="#000" fontSize="12">Tasks</Text>
                </Svg>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Schedule Scrub</Text>
                <Text style={styles.subtitle}>Take control of your time and energy by tackling dreaded tasks.</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Get Started Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 