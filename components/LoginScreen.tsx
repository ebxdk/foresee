import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Keyboard, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface LoginScreenProps {
  onContinue: (email: string, password: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onContinue, onBack, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const groupRef = useRef<View>(null);
  const KEYBOARD_MARGIN = 4;
  const BUTTERY_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);
  const emailContainerRef = useRef<View>(null);
  const passwordContainerRef = useRef<View>(null);

  // Validate inputs
  const isEmailValid = email.length > 0 && email.includes('@');
  const isPasswordValid = password.length > 0;
  const canContinue = isEmailValid && isPasswordValid;

  const handleLogin = () => {
    if (!canContinue) {
      if (!isEmailValid) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (!isPasswordValid) {
        Alert.alert('Password Required', 'Please enter your password.');
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue(email, password);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Smooth, slight lift of inputs when keyboard appears
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const adjustAboveKeyboard = (endCoordinates: any, durationMs: number) => {
      // Place bottom of the bottom field just above the keyboard
      const margin = KEYBOARD_MARGIN;
      requestAnimationFrame(() => {
        passwordContainerRef.current?.measureInWindow((x, y, width, height) => {
          const keyboardTop = endCoordinates?.screenY ?? 0;
          const fieldBottom = y + height;
          const desiredBottom = keyboardTop - margin;
          const overlap = fieldBottom - desiredBottom;
          const toValue = overlap > 0 ? -overlap : 0;
          Animated.timing(translateY, {
            toValue,
            duration: Math.max(220, Math.min(420, durationMs)),
            easing: BUTTERY_EASING,
            useNativeDriver: true,
          }).start();
        });
      });
    };

    const onShow = (e: any) => {
      setIsKeyboardVisible(true);
      const animDuration = Platform.OS === 'ios' ? (e?.duration ?? 260) : 240;
      adjustAboveKeyboard(e?.endCoordinates, animDuration);
    };

    const onHide = (e: any) => {
      setIsKeyboardVisible(false);
      const animDuration = Platform.OS === 'ios' ? (e?.duration ?? 240) : 220;
      Animated.timing(translateY, {
        toValue: 0,
        duration: Math.max(180, Math.min(360, animDuration)),
        easing: BUTTERY_EASING,
        useNativeDriver: true,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [translateY, focusedField]);

  // Update lift when focus changes while keyboard visible
  useEffect(() => {
    if (!isKeyboardVisible) return;
    // Re-measure and re-adjust when focus changes while keyboard visible
    // Use a short duration for responsiveness
    const sub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow',
      (e: any) => {
        const duration = Platform.OS === 'ios' ? e?.duration ?? 180 : 160;
        // @ts-ignore accessing ref from closure
        const endCoordinates = e?.endCoordinates;
        requestAnimationFrame(() => {
          passwordContainerRef.current?.measureInWindow((x, y, width, height) => {
            const margin = KEYBOARD_MARGIN;
            const keyboardTop = endCoordinates?.screenY ?? 0;
            const fieldBottom = y + height;
            const desiredBottom = keyboardTop - margin;
            const overlap = fieldBottom - desiredBottom;
            const toValue = overlap > 0 ? -overlap : 0;
            Animated.timing(translateY, {
              toValue,
              duration: Math.max(200, Math.min(340, duration)),
              easing: BUTTERY_EASING,
              useNativeDriver: true,
            }).start();
          });
        });
      }
    );
    return () => {
      sub.remove();
    };
  }, [isKeyboardVisible, focusedField, translateY]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
              {/* Group: header + inputs animate together */}
              <Animated.View ref={groupRef} style={[styles.messageSection, { transform: [{ translateY }] }]}>
                {/* Icon and text container in the same row */}
                <View style={styles.iconAndTextContainer}>
                  {/* Login Icon */}
                  <View style={styles.iconContainer}>
                    <Svg width={80} height={80} viewBox="0 0 80 80">
                      {/* Circle background */}
                      <Path
                        fill="#F2F2F7"
                        d="M40,8c-17.7,0-32,14.3-32,32s14.3,32,32,32s32-14.3,32-32S57.7,8,40,8z"
                      />
                      <Path
                        fill="#FFFFFF"
                        d="M40,12c-15.4,0-28,12.6-28,28s12.6,28,28,28s28-12.6,28-28S55.4,12,40,12z"
                      />
                      {/* User icon */}
                      <Path
                        fill="none"
                        stroke="#8E8E93"
                        strokeWidth="2"
                        d="M40,32c3.3,0,6-2.7,6-6s-2.7-6-6-6s-6,2.7-6,6S36.7,32,40,32z M40,36c-4.4,0-8,3.6-8,8v8h16v-8C48,39.6,44.4,36,40,36z"
                      />
                    </Svg>
                  </View>
                  
                  {/* Title */}
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome back</Text>
                  </View>
                </View>

                {/* Input section */}
                <View style={styles.inputSection}>
                  {/* Email Field */}
                  <View ref={emailContainerRef} style={styles.inputContainer}>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#8E8E93"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>

                  {/* Password Field */}
                  <View ref={passwordContainerRef} style={styles.inputContainer}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#8E8E93"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={togglePasswordVisibility}>
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#8E8E93" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>

              {/* Bottom Section with Login Button */}
              <View style={styles.bottomSection}>
                <TouchableOpacity
                  style={[styles.loginButton, !canContinue && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={!canContinue || isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

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
  inputSection: {
    width: '100%',
    marginTop: 20,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 16,
    paddingRight: 48, // Make room for eye icon on password field
    fontSize: 17,
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

export default LoginScreen;