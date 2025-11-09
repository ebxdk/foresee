import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
    cancelAllNotifications,
    getScheduledNotificationCount,
    requestNotificationPermissions,
    scheduleDailyNotifications,
    sendImmediateNotification
} from '../utils/notificationService';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      const count = await getScheduledNotificationCount();
      setScheduledCount(count);
      setNotificationsEnabled(count > 0);
    } catch (error) {
      console.error('Failed to load notification status:', error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (value) {
        // Enable notifications
        const hasPermission = await requestNotificationPermissions();
        
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive wellness reminders.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }

        await scheduleDailyNotifications();
        await loadNotificationStatus();
        
        Alert.alert(
          'Notifications Enabled! 🎉',
          'You\'ll receive gentle reminders and motivational quotes throughout the day.',
          [{ text: 'Great!' }]
        );
      } else {
        // Disable notifications
        await cancelAllNotifications();
        await loadNotificationStatus();
        
        Alert.alert(
          'Notifications Disabled',
          'You won\'t receive any reminders until you turn them back on.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendImmediateNotification(
        '✨ Test Notification',
        'This is what your wellness reminders will look like!',
        2
      );
      Alert.alert(
        'Test Sent!',
        'You should receive a test notification in a few seconds.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Make sure notifications are enabled.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: scale(44) }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Wellness Reminders</Text>
              <Text style={styles.settingDescription}>
                Receive gentle reminders and motivational quotes throughout the day
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              disabled={loading}
              trackColor={{ false: '#E5E5EA', true: '#000000' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        {/* Status */}
        {notificationsEnabled && (
          <View style={styles.statusSection}>
            <View style={styles.statusCard}>
              <Text style={styles.statusEmoji}>🔔</Text>
              <Text style={styles.statusTitle}>Active</Text>
              <Text style={styles.statusDescription}>
                {scheduledCount} notification{scheduledCount !== 1 ? 's' : ''} scheduled
              </Text>
            </View>
          </View>
        )}

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⏰</Text>
            <Text style={styles.infoTitle}>Every 3-4 Hours</Text>
            <Text style={styles.infoDescription}>
              You'll receive notifications at 9 AM, 12:30 PM, 4 PM, and 7:30 PM
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🎯</Text>
            <Text style={styles.infoTitle}>Smart Reminders</Text>
            <Text style={styles.infoDescription}>
              If you haven't used your tools today, you'll get a gentle reminder to check them out
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💭</Text>
            <Text style={styles.infoTitle}>Motivational Quotes</Text>
            <Text style={styles.infoDescription}>
              If you've already used your tools, you'll receive an inspiring quote instead
            </Text>
          </View>
        </View>

        {/* Test Button */}
        {notificationsEnabled && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: verticalScale(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: RFValue(20),
    color: '#000000',
    fontWeight: '600',
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#000000',
    marginBottom: verticalScale(16),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    backgroundColor: '#F2F2F7',
    borderRadius: moderateScale(16),
  },
  settingInfo: {
    flex: 1,
    marginRight: scale(16),
  },
  settingTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: verticalScale(4),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  settingDescription: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    lineHeight: RFValue(20),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  statusSection: {
    marginBottom: verticalScale(32),
  },
  statusCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: moderateScale(16),
    padding: scale(24),
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: RFValue(40),
    marginBottom: verticalScale(12),
  },
  statusTitle: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#000000',
    marginBottom: verticalScale(8),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  statusDescription: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: '#F2F2F7',
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  infoEmoji: {
    fontSize: RFValue(28),
    marginBottom: verticalScale(8),
  },
  infoTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: verticalScale(4),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  infoDescription: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    lineHeight: RFValue(20),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  testButton: {
    backgroundColor: '#000000',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

