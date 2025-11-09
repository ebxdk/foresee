import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Storage keys
const LAST_TOOL_USE_KEY = '@last_tool_use';
const NOTIFICATION_PERMISSION_KEY = '@notification_permission_requested';

/**
 * Request notification permissions (iOS requires this)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS !== 'ios') {
      // Android doesn't need explicit permission request for local notifications
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return false;
    }

    console.log('✅ Notification permission granted');
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if user has used tools today
 */
async function hasUsedToolsToday(): Promise<boolean> {
  try {
    const lastUse = await AsyncStorage.getItem(LAST_TOOL_USE_KEY);
    if (!lastUse) return false;

    const lastUseDate = new Date(lastUse);
    const today = new Date();
    
    // Check if last use was today
    return (
      lastUseDate.getDate() === today.getDate() &&
      lastUseDate.getMonth() === today.getMonth() &&
      lastUseDate.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking tool usage:', error);
    return false;
  }
}

/**
 * Mark that user used tools (call this when they interact with tools)
 */
export async function markToolUsed(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_TOOL_USE_KEY, new Date().toISOString());
    console.log('✅ Tool usage marked');
  } catch (error) {
    console.error('Error marking tool usage:', error);
  }
}

/**
 * Get a random motivational quote
 */
function getRandomQuote(): { title: string; body: string } {
  const quotes = [
    { title: "💪 You've got this", body: "You were never meant to run on empty." },
    { title: "🌟 Remember", body: "Every yes costs something." },
    { title: "✨ Daily wisdom", body: "Your capacity is elastic, not infinite." },
    { title: "🧘 Take a moment", body: "You need permission to pause." },
    { title: "🔥 Stay aware", body: "Burnout starts with a flicker." },
    { title: "💙 Self-care", body: "Rest is not a luxury, it's a necessity." },
    { title: "🌈 Your worth", body: "Your worth is not measured by your productivity." },
    { title: "💝 Boundaries", body: "Boundaries are love in action." },
    { title: "☕️ Fill your cup", body: "You can't pour from an empty cup." },
    { title: "🛡️ Protect yourself", body: "Self-care is not selfish, it's survival." },
    { title: "🧠 Mental health", body: "Your mental health is not negotiable." },
    { title: "🎯 Progress", body: "Progress over perfection, always." },
    { title: "💎 You're enough", body: "You are enough, exactly as you are." },
    { title: "🌱 Recovery", body: "Recovery is not a sign of weakness." },
    { title: "⚡️ Energy", body: "Your energy is sacred, protect it." },
    { title: "🚫 Say no", body: "No is a complete sentence." },
    { title: "😴 Rest matters", body: "You deserve rest, not just sleep." },
    { title: "🌊 Healing", body: "Healing is not linear, and that's okay." },
    { title: "☮️ Peace first", body: "Your peace is worth more than their approval." },
    { title: "🌸 Growth", body: "Growth happens in the quiet moments." },
  ];

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

/**
 * Schedule all daily notifications (every 3-4 hours)
 */
export async function scheduleDailyNotifications(): Promise<void> {
  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🔔 Cancelled existing notifications');

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('❌ Cannot schedule notifications without permission');
      return;
    }

    // Schedule notifications at different times throughout the day
    const notificationTimes = [
      { hour: 9, minute: 0 },   // 9 AM
      { hour: 12, minute: 30 }, // 12:30 PM
      { hour: 16, minute: 0 },  // 4 PM
      { hour: 19, minute: 30 }, // 7:30 PM
    ];

    for (const time of notificationTimes) {
      // Check if user has used tools
      const usedTools = await hasUsedToolsToday();
      
      let notification;
      if (!usedTools) {
        // Tool reminder
        notification = {
          title: "🎯 Take a moment for yourself",
          body: "Your tools are waiting to help you recharge.",
        };
      } else {
        // Random motivational quote
        notification = getRandomQuote();
      }

      // Schedule notification to repeat daily at this time
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: usedTools ? 'quote' : 'tool_reminder' },
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });

      console.log(`✅ Scheduled notification for ${time.hour}:${String(time.minute).padStart(2, '0')}`);
    }

    console.log('✅ All notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

/**
 * Send an immediate notification (for testing or special occasions)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  delaySeconds: number = 1
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: delaySeconds,
      },
    });
    console.log('✅ Immediate notification scheduled');
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get count of scheduled notifications
 */
export async function getScheduledNotificationCount(): Promise<number> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.length;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
}

/**
 * Initialize notification system (call this on app launch)
 */
export async function initializeNotifications(): Promise<void> {
  try {
    console.log('🔔 Initializing notification system...');
    
    // Check if we already have permission
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status === 'granted') {
      // Already have permission, schedule notifications
      await scheduleDailyNotifications();
      console.log('✅ Notifications initialized successfully');
    } else {
      // Don't schedule yet - will be done after user grants permission
      console.log('⏳ Waiting for notification permission');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

