import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function ScheduleScrubCompletePage() {
  const router = useRouter();
  const { dreadedTask, actionTaken } = useLocalSearchParams<{ dreadedTask: string; actionTaken: 'Decline' | 'Delegate' | 'Diminish' }>();

  const renderActionIcon = () => {
    switch (actionTaken) {
      case 'Decline':
        return (
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" stroke="#EF4444" strokeWidth="4" fill="#FEF2F2" />
            <Line x1="30" y1="30" x2="70" y2="70" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <Line x1="70" y1="30" x2="30" y2="70" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          </Svg>
        );
      case 'Delegate':
        return (
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" stroke="#3B82F6" strokeWidth="4" fill="#EFF6FF" />
            <Path d="M35 50 L50 65 L65 50" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <Path d="M50 35 L50 65" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <Circle cx="50" cy="25" r="8" fill="#3B82F6"/>
            <Circle cx="70" cy="75" r="8" fill="#3B82F6"/>
            <Circle cx="30" cy="75" r="8" fill="#3B82F6"/>
          </Svg>
        );
      case 'Diminish':
        return (
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" stroke="#F59E0B" strokeWidth="4" fill="#FFFBEB" />
            <Line x1="30" y1="50" x2="70" y2="50" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
            <Rect x="40" y="35" width="20" height="30" rx="5" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        );
      default:
        return null;
    }
  };

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Schedule Scrub
      const cooldownStatus = await getToolCooldownStatus('scheduleScrub');
      
      // Store the tool usage with effective points
      await storeToolUsage('scheduleScrub', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('scheduleScrub', cooldownStatus.effectivePoints);
      
      console.log('Schedule Scrub completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Schedule Scrub:', error);
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
            {/* Action Icon */}
            <View style={styles.iconContainer}>{renderActionIcon()}</View>
            
            {/* Celebration Message */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Task Scrubbed! ✨</Text>
              <Text style={styles.subtitle}>You've protected your energy and taken control of your schedule!</Text>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Your scrubbed task:</Text>
            <View style={styles.taskSummaryContainer}>
              <Text style={styles.taskSummaryText}>
                {dreadedTask || "No task identified."}
              </Text>
            </View>
            <Text style={styles.actionSummaryTitle}>Action taken:</Text>
            <View style={styles.actionSummaryContainer}>
              <Text style={styles.actionSummaryText}>
                {actionTaken || "No action taken."}
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
    paddingBottom: 50,
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
  summarySection: {
    marginBottom: 40,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  taskSummaryContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
    marginBottom: 20,
  },
  taskSummaryText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  actionSummaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  actionSummaryContainer: {
    backgroundColor: '#E0F2F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0284C7',
    padding: 20,
    alignItems: 'center',
    minHeight: 60,
  },
  actionSummaryText: {
    fontSize: 16,
    color: '#0C4A6E',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
