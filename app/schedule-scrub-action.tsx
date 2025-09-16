import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export default function ScheduleScrubActionPage() {
  const router = useRouter();
  const { dreadedTask } = useLocalSearchParams<{ dreadedTask: string }>();
  const [selectedAction, setSelectedAction] = useState<'Decline' | 'Delegate' | 'Diminish' | null>(null);

  const handleActionSelect = (action: 'Decline' | 'Delegate' | 'Diminish') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAction(action);
  };

  const handleComplete = () => {
    if (selectedAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/schedule-scrub-complete',
        params: { dreadedTask: dreadedTask, actionTaken: selectedAction }
      });
    }
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
          {/* Creative Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Choose Your Weapon</Text>
            <Text style={styles.subtitle}>How will you tackle this dreaded task?</Text>
          </View>

          {/* Task Display with Creative Styling */}
          <View style={styles.taskSection}>
            <View style={styles.taskHeader}>
              <View style={styles.taskIcon}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                  <Path d="M8,12 L16,12 M12,8 L12,16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>Your dreaded task:</Text>
            </View>
            <View style={styles.taskContainer}>
              <Text style={styles.taskText}>
                {dreadedTask || "No task identified. Please go back and try again."}
              </Text>
            </View>
          </View>

          {/* Action Options in Creative Grid Layout */}
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Select your action:</Text>
            
            <View style={styles.actionGrid}>
              {/* Decline Option - Top Left */}
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  styles.declineCard,
                  selectedAction === 'Decline' && styles.selectedActionCard
                ]}
                onPress={() => handleActionSelect('Decline')}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.actionIcon}>
                    <Svg width={32} height={32} viewBox="0 0 32 32">
                      <Circle cx="16" cy="16" r="14" stroke="#EF4444" strokeWidth="2" fill="none"/>
                      <Line x1="10" y1="10" x2="22" y2="22" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                      <Line x1="22" y1="10" x2="10" y2="22" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                    </Svg>
                  </View>
                  <Text style={styles.cardTitle}>Decline</Text>
                </View>
                <Text style={styles.cardDescription}>Say no to the task entirely</Text>
                <View style={styles.cardDecoration}>
                  <Circle cx="0" cy="0" r="2" fill="#EF4444" opacity="0.3"/>
                  <Circle cx="0" cy="0" r="2" fill="#EF4444" opacity="0.3"/>
                </View>
              </TouchableOpacity>

              {/* Delegate Option - Top Right */}
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  styles.delegateCard,
                  selectedAction === 'Delegate' && styles.selectedActionCard
                ]}
                onPress={() => handleActionSelect('Delegate')}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.actionIcon}>
                    <Svg width={32} height={32} viewBox="0 0 32 32">
                      <Circle cx="16" cy="16" r="14" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                      <Path d="M10,16 L16,22 L22,16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      <Path d="M16,10 L16,22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </Svg>
                  </View>
                  <Text style={styles.cardTitle}>Delegate</Text>
                </View>
                <Text style={styles.cardDescription}>Assign to someone else</Text>
                <View style={styles.cardDecoration}>
                  <Circle cx="0" cy="0" r="2" fill="#3B82F6" opacity="0.3"/>
                  <Circle cx="0" cy="0" r="2" fill="#3B82F6" opacity="0.3"/>
                </View>
              </TouchableOpacity>

              {/* Diminish Option - Bottom Center */}
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  styles.diminishCard,
                  selectedAction === 'Diminish' && styles.selectedActionCard
                ]}
                onPress={() => handleActionSelect('Diminish')}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.actionIcon}>
                    <Svg width={32} height={32} viewBox="0 0 32 32">
                      <Circle cx="16" cy="16" r="14" stroke="#F59E0B" strokeWidth="2" fill="none"/>
                      <Line x1="8" y1="16" x2="24" y2="16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                      <Path d="M12,12 L18,18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </Svg>
                  </View>
                  <Text style={styles.cardTitle}>Diminish</Text>
                </View>
                <Text style={styles.cardDescription}>Shorten or simplify</Text>
                <View style={styles.cardDecoration}>
                  <Circle cx="0" cy="0" r="2" fill="#F59E0B" opacity="0.3"/>
                  <Circle cx="0" cy="0" r="2" fill="#F59E0B" opacity="0.3"/>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Complete Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                !selectedAction && styles.completeButtonDisabled
              ]}
              onPress={handleComplete}
              disabled={!selectedAction}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.completeButtonText}>Execute Action</Text>
                <View style={styles.buttonIcon}>
                  <Svg width={20} height={20} viewBox="0 0 20 20">
                    <Path d="M5,10 L15,10 M10,5 L10,15" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                </View>
              </View>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  taskSection: {
    marginBottom: 30,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  taskContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  actionsSection: {
    flex: 1,
    marginBottom: 40,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  actionGrid: {
    flex: 1,
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 24,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  declineCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#EF4444',
  },
  delegateCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6',
  },
  diminishCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#F59E0B',
  },
  selectedActionCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    transform: [{ scale: 1.02 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  cardDecoration: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  completeButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  buttonIcon: {
    alignItems: 'center',
  },
});
