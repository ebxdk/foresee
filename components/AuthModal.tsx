import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInUp, SlideOutDown } from 'react-native-reanimated';

const { height: screenHeight } = Dimensions.get('window');

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/onboarding');
  };

  const handleGoogleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push('/onboarding');
  };

  const handleAppleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push('/onboarding');
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLogin(!isLogin);
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        <Animated.View 
          style={styles.backdropOverlay} 
          entering={FadeIn.duration(300)}
        />
      </TouchableOpacity>

      {/* Modal Card */}
      <Animated.View
        style={styles.modalContainer}
        entering={SlideInUp.duration(400).springify()}
        exiting={SlideOutDown.duration(300)}
      >
        <View style={styles.card}>
          {/* Handle Bar */}
          <View style={styles.handle} />

          {/* App Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.appIcon}>
              <Text style={styles.iconText}>🌟</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>
            Track your energy, purpose, and connection to build resilience and prevent burnout.
          </Text>

          {/* Auth Buttons */}
          <View style={styles.buttonContainer}>
            {/* Primary Action Button */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'Login' : 'Sign up with Email'}
              </Text>
            </TouchableOpacity>

            {/* Email Input (for signup) */}
            {!isLogin && (
              <Animated.View entering={FadeIn.duration(300)}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#8E8E93"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Animated.View>
            )}

            {/* Toggle between Login/Signup */}
            {isLogin && (
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={toggleMode}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Sign up with Email</Text>
              </TouchableOpacity>
            )}

            {/* Social Auth Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={handleAppleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>🍎</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>G</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to Foresee's{' '}
            <Text style={styles.termsLink}>Terms of Use</Text>.
          </Text>

          {/* Login Toggle */}
          {!isLogin && (
            <TouchableOpacity onPress={toggleMode} style={styles.loginToggle}>
              <Text style={styles.loginToggleText}>Already have an account? Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: screenHeight * 0.6,
    maxHeight: screenHeight * 0.85,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  input: {
    height: 52,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#000000',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  termsLink: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  loginToggle: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginToggleText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 