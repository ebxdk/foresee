import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PDFViewer from './PDFViewer';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import AppleLogo from '../logos/AppleLogo';
import GoogleLogo from '../logos/GoogleLogo';

const { height: screenHeight } = Dimensions.get('window');

interface AuthCardProps {
  visible: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}


export default function AuthCard({ visible, onClose, onSignupClick }: AuthCardProps) {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
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

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      translateY.value = withSpring(0, springConfig);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else if (isModalVisible) {
      translateY.value = withSpring(screenHeight, springConfig, (finished) => {
        if (finished) {
          runOnJS(setIsModalVisible)(false);
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, isModalVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial position - we'll use translateY.value directly
    })
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

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleSignup = () => {
    // Call the callback to show name input screen
      onSignupClick();
  };

  const handleAppleLogin = () => {
    onClose();
    router.push('/onboarding');
  };

  const handleGoogleLogin = () => {
    onClose();
    router.push('/onboarding');
  };

  const handleTermsPress = () => {
    setShowPDFViewer(true);
  };
  
  if (!isModalVisible) {
    return null;
  }

  return (
    <Modal
      visible={isModalVisible}
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
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <View style={styles.card}>
            <View style={styles.handle} />
            
            <View style={styles.header}>
              <Text style={styles.title}>Get Started</Text>
              <Text style={styles.subtitle}>
                Log in or sign up to continue to Foresee.
              </Text>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
                <Text style={styles.secondaryButtonText}>Sign up with Email</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
                <AppleLogo width={24} height={24} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                <GoogleLogo width={24} height={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.termsText}>
              By continuing, you agree to Foresee's{' '}
              <Text style={styles.linkText} onPress={handleTermsPress}>Terms of Use</Text>.
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* PDF Viewer Modal */}
      <PDFViewer
        visible={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        pdfPath={require('../assets/Terms of Service (Beta) - Final.pdf')}
        title="Terms of Service"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'left',
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  secondaryButton: {
    height: 52,
    backgroundColor: '#F2F2F7',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  linkText: {
    color: '#007AFF',
  },
}); 