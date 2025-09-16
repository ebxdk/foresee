import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function BoundaryBuilderCompletePage() {
  const router = useRouter();
  const { situation, finalScript } = useLocalSearchParams<{ situation: string; finalScript: string }>();

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Boundary Builder
      const cooldownStatus = await getToolCooldownStatus('boundaryBuilder');
      
      // Store the tool usage with effective points
      await storeToolUsage('boundaryBuilder', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('boundaryBuilder', cooldownStatus.effectivePoints);
      
      console.log('Boundary Builder completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Boundary Builder:', error);
    }
    
    router.push('/tools');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Celebration Section */}
          <View style={styles.celebrationSection}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Svg width={140} height={140} viewBox="0 0 140 140">
                <Defs>
                  <LinearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
                    <Stop offset="100%" stopColor="#059669" stopOpacity="0.7"/>
                  </LinearGradient>
                  <LinearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.8"/>
                    <Stop offset="100%" stopColor="#BBF7D0" stopOpacity="0.6"/>
                  </LinearGradient>
                </Defs>
                
                {/* Main shield shape with gradient */}
                <Path
                  fill="url(#shieldGradient)"
                  stroke="#10B981"
                  strokeWidth="3"
                  d="M70,20 L120,40 L120,80 Q120,100 100,110 L70,120 L40,110 Q20,100 20,80 L20,40 Z"
                />
                
                {/* Shield highlight with gradient */}
                <Path
                  fill="url(#highlightGradient)"
                  d="M70,20 L110,35 L110,75 Q110,90 95,98 L70,105 L45,98 Q30,90 30,75 L30,35 Z"
                />
                
                {/* Shield center design */}
                <Circle cx="70" cy="70" r="25" fill="#FFFFFF" opacity="0.9"/>
                <Circle cx="70" cy="70" r="20" fill="#10B981" opacity="0.8"/>
                
                {/* Success checkmark */}
                <Path
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M55,70 L65,80 L85,60"
                />
                
                {/* Decorative boundary lines */}
                <Path
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  d="M25,60 Q40,50 55,60 M85,60 Q100,50 115,60"
                />
                
                {/* Small protective elements */}
                <Circle cx="50" cy="50" r="3" fill="#10B981"/>
                <Circle cx="90" cy="50" r="3" fill="#10B981"/>
                <Circle cx="50" cy="90" r="3" fill="#10B981"/>
                <Circle cx="90" cy="90" r="3" fill="#10B981"/>
                
                {/* Additional decorative elements */}
                <Path
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  d="M35,40 Q50,35 65,40 M35,100 Q50,105 65,100"
                />
              </Svg>
            </View>
            
            {/* Celebration Message */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Boundary Built! 🛡️✨</Text>
              <Text style={styles.subtitle}>You're building your assertiveness and learning to protect your energy.</Text>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you've accomplished:</Text>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Svg width={20} height={20} viewBox="0 0 20 20">
                  <Circle cx="10" cy="10" r="8" fill="#10B981"/>
                  <Path
                    fill="white"
                    d="M8,13 L5,10 L6.4,8.6 L8,10.2 L13.6,4.6 L15,6 L8,13 Z"
                  />
                </Svg>
              </View>
              <Text style={styles.benefitText}>Reflected on boundary-pushing situations</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Svg width={20} height={20} viewBox="0 0 20 20">
                  <Circle cx="10" cy="10" r="8" fill="#10B981"/>
                  <Path
                    fill="white"
                    d="M8,13 L5,10 L6.4,8.6 L8,10.2 L13.6,4.6 L15,6 L8,13 Z"
                  />
                </Svg>
              </View>
              <Text style={styles.benefitText}>Practiced assertive communication</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Svg width={20} height={20} viewBox="0 0 20 20">
                  <Circle cx="10" cy="10" r="8" fill="#10B981"/>
                  <Path
                    fill="white"
                    d="M8,13 L5,10 L6.4,8.6 L8,10.2 L13.6,4.6 L15,6 L8,13 Z"
                  />
                </Svg>
              </View>
              <Text style={styles.benefitText}>Built confidence in saying no</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Svg width={20} height={20} viewBox="0 0 20 20">
                  <Circle cx="10" cy="10" r="8" fill="#10B981"/>
                  <Path
                    fill="white"
                    d="M8,13 L5,10 L6.4,8.6 L8,10.2 L13.6,4.6 L15,6 L8,13 Z"
                  />
                </Svg>
              </View>
              <Text style={styles.benefitText}>Developed a personal boundary script</Text>
            </View>
          </View>

          {/* Your Script Summary */}
          <View style={styles.scriptSummarySection}>
            <Text style={styles.scriptSummaryTitle}>Your boundary script:</Text>
            <View style={styles.scriptSummaryContainer}>
              <Text style={styles.scriptSummaryText}>
                {finalScript || "No script available."}
              </Text>
            </View>
          </View>

          {/* Done Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
            >
              <Text style={styles.doneButtonText}>Done</Text>
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
    paddingTop: 60,
    paddingBottom: 60,
  },
  celebrationSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  benefitsSection: {
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  benefitIcon: {
    marginRight: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scriptSummarySection: {
    marginBottom: 40,
  },
  scriptSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scriptSummaryContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
  },
  scriptSummaryText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  doneButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
