import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

interface NameInputScreenProps {
  onContinue: (name: string) => void;
  onBack: () => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ onContinue, onBack }) => {
  const [name, setName] = React.useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    console.log('NameInputScreen mounted');
    return () => {
      console.log('NameInputScreen unmounted');
    };
  }, []);

  const handleNext = () => {
    console.log('Next clicked with name:', name);
    if (name.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onContinue(name);
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
            {/* Profile and Message Section */}
            <View style={styles.messageSection}>
              {/* Icon and text container in the same row */}
              <View style={styles.iconAndTextContainer}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Svg width={80} height={80} viewBox="0 0 80 80">
                    <Circle cx={40} cy={40} r={38} fill="#F2F2F7" />
                    <Circle cx={40} cy={40} r={36} fill="#FFFFFF" />
                    <Path
                      fill="#8E8E93"
                      d="M40,22c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10S45.5,22,40,22z"
                    />
                    <Path
                      fill="#8E8E93"
                      d="M40,45c-8.3,0-25,4.2-25,12.5V60h50v-2.5C65,49.2,48.3,45,40,45z"
                    />
                  </Svg>
                </View>
                
                {/* Title and subtitle */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Nice to meet you! What's your name?</Text>
                </View>
              </View>

              {/* Name input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Your awesome name here..."
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>

            {/* Bottom Section with Next Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[styles.nextButton, !name.trim() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!name.trim()}
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

export default NameInputScreen; 