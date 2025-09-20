import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface VerificationCodeScreenProps {
  onContinue: (code: string) => void;
  onBack: () => void;
  onResendCode?: () => void;
  isLoading?: boolean;
}

const VerificationCodeScreen: React.FC<VerificationCodeScreenProps> = ({ onContinue, onBack, onResendCode, isLoading: externalLoading = false }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loading = externalLoading || isLoading;
  const [showCheckmark, setShowCheckmark] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('VerificationCodeScreen mounted');
    return () => {
      console.log('VerificationCodeScreen unmounted');
    };
  }, []);

  // Auto-dismiss keyboard when code is complete
  useEffect(() => {
    if (code.length === 6) {
      Keyboard.dismiss();
    }
  }, [code]);

  // Animate rotation when loading
  useEffect(() => {
    if (isLoading && !showCheckmark) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2000, // Slower, more subtle rotation
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.setValue(0);
    }
  }, [isLoading, showCheckmark]);

  const handleNext = async () => {
    console.log('Next clicked with code:', code);
    if (code.length === 6 && !isLoading) {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Keyboard.dismiss();
      
      // Show loading for 1.5 seconds
      setTimeout(() => {
        setShowCheckmark(true);
        // Show checkmark for 0.5 seconds then navigate
        setTimeout(() => {
          onContinue(code);
        }, 500);
      }, 1500);
    }
  };

  const handleBack = () => {
    console.log('Back clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  // Dismiss keyboard when tapping outside of the input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderCodeDigits = () => {
    const digits = code.split('');
    const emptySlots = 6 - digits.length;
    
    return (
      <>
        {digits.map((digit, index) => (
          <View key={index} style={styles.codeDigit}>
            <Text style={styles.codeDigitText}>{digit}</Text>
          </View>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <View key={`empty-${index}`} style={styles.codeDigit}>
            <Text style={styles.codeDigitPlaceholder}>-</Text>
          </View>
        ))}
      </>
    );
  };

  const renderButtonContent = () => {
    if (isLoading && !showCheckmark) {
      return (
        <Animated.View style={{
          transform: [{
            rotate: rotationAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })
          }]
        }}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12,2C17.5,2,22,6.5,22,12S17.5,22,12,22S2,17.5,2,12S6.5,2,12,2M12,4C7.6,4,4,7.6,4,12S7.6,20,12,20S20,16.4,20,12S16.4,4,12,4"
            />
            <Path
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12,8L16,12L12,16"
            />
            <Path
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8,12H16"
            />
          </Svg>
        </Animated.View>
      );
    } else if (showCheckmark) {
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            fill="#FFFFFF"
            d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
          />
        </Svg>
      );
    } else {
      return <Text style={styles.nextButtonText}>Next</Text>;
    }
  };

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
            {/* Code and Message Section */}
            <View style={styles.messageSection}>
              {/* Icon and text container in the same row */}
              <View style={styles.iconAndTextContainer}>
                {/* Code Icon */}
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
                    {/* Code icon */}
                    <Path
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="2"
                      d="M28,32h24c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H28c-1.1,0-2-0.9-2-2V34C26,32.9,26.9,32,28,32z"
                    />
                    <Path
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="2"
                      d="M32,36h16M32,40h16M32,44h8"
                    />
                  </Svg>
                </View>
                
                {/* Title */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Enter your verification code! 🔐</Text>
                </View>
              </View>

              {/* Code input */}
              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  style={styles.codeContainer} 
                  onPress={() => inputRef.current?.focus()}
                  activeOpacity={0.8}
                >
                  {renderCodeDigits()}
                </TouchableOpacity>
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  autoFocus
                  keyboardType="numeric"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>

            {/* Bottom Section with Next Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[styles.nextButton, code.length !== 6 && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={code.length !== 6 || isLoading}
              >
                {renderButtonContent()}
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
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    height: 80,
    alignItems: 'center',
  },
  codeDigit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  codeDigitText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  codeDigitPlaceholder: {
    fontSize: 24,
    fontWeight: '400',
    color: '#9CA3AF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

export default VerificationCodeScreen; 