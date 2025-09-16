import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProgressScreen() {
  const router = useRouter();

  const handleRecapPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/capacity-recap-stories');
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header with title and profile icon */}
          <View style={styles.header}>
            <Text style={styles.title}>Progress</Text>
          </View>
          
          {/* Absolutely positioned profile icon - same as radar tab */}
          <TouchableOpacity 
            style={styles.profileIconAbsolute}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Navigation functionality to be implemented later
            }}
          >
            <LinearGradient
              colors={['#D1D1D6', '#8E8E93']}
              style={styles.profileGradient}
            >
              <Text style={styles.profileText}>EK</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* My Capacity Recaps Section */}
          <View style={styles.recapsSection}>
            <Text style={styles.sectionTitle}>My Capacity Recaps</Text>
            
            {/* 2025 Recap Card */}
            <TouchableOpacity 
              style={styles.recapCard}
              onPress={handleRecapPress}
              activeOpacity={0.8}
            >
              {/* Background Image */}
              <Image 
                source={require('../../assets/images/yearRecap.png')} 
                style={styles.recapBackgroundImage}
                resizeMode="cover"
              />
              
              {/* Black Gradient Overlay at Bottom */}
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.95)']}
                style={styles.blackGradientOverlay}
              >
                <View style={styles.textContainer}>
                  <Text style={styles.recapYearLarge}>2025</Text>
                  <Text style={styles.recapYearMedium}>Year</Text>
                  <Text style={styles.recapYearSmall}>Recap</Text>
                  <Image 
                    source={require('../../assets/images/Capcity_Creator_Logo_copy-removebg-preview.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  profileIconAbsolute: {
    position: 'absolute',
    top: 52,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  mainScrollView: {
    flex: 1,
  },
  recapsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  recapCard: {
    flex: 1,
    minHeight: screenHeight * 0.65, // Takes up 65% of screen height (shorter)
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    position: 'relative',
  },
  recapBackgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  blackGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240, // Longer gradient
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20, // Moved down a bit
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recapYearLarge: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -2,
  },
  recapYearMedium: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: -8,
    letterSpacing: 2,
  },
  recapYearSmall: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
    letterSpacing: 4,
    opacity: 0.9,
  },
  logoImage: {
    width: 60,
    height: 30,
    marginTop: 8,
    opacity: 0.9,
  },
  bottomSpacing: {
    height: 40,
  },
}); 