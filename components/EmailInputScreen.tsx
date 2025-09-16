import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface EmailInputScreenProps {
  onContinue: (email: string) => void;
  onBack: () => void;
}

const EmailInputScreen: React.FC<EmailInputScreenProps> = ({ onContinue, onBack }) => {
  const [email, setEmail] = React.useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    console.log('EmailInputScreen mounted');
    return () => {
      console.log('EmailInputScreen unmounted');
    };
  }, []);

  const handleNext = () => {
    console.log('Next clicked with email:', email);
    if (email.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onContinue(email);
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
            {/* Email and Message Section */}
            <View style={styles.messageSection}>
              {/* Icon and text container in the same row */}
              <View style={styles.iconAndTextContainer}>
                {/* Email Icon */}
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
                    {/* Hollow mail icon */}
                    <Path
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="2"
                      d="M24,32h32c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H24c-1.1,0-2-0.9-2-2V34C22,32.9,22.9,32,24,32z"
                    />
                    <Path
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="2"
                      d="M40,36L28,44h24L40,36z"
                    />
                  </Svg>
                </View>
                
                {/* Title */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>What's your email address?</Text>
                </View>
              </View>

              {/* Email input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoFocus
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>

            {/* Bottom Section with Next Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[styles.nextButton, !email.trim() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!email.trim()}
              >
                <Text style={styles.nextButtonText}>Next</Text>
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
    paddingTop: 80, // Reduced from 120 to move content higher
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Moved higher from 60
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from center to start to move higher
    alignItems: 'flex-start',
    paddingTop: 80, // Increased from 40 to move text down on screen
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30, // Increased from 20 to give more space
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0, // Increased from 8 to move text down
  },
  title: {
    fontSize: 36, // Increased from 28 to match get started screen heroMessage size
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44, // Added line height like get started screen
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2, // Added black border
    borderColor: '#000000', // Black border color
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#000000',
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

export default EmailInputScreen; 