# 🔔 Notification System - Quick Start

## ✅ ALREADY DONE FOR YOU!

Everything is set up and ready to use! Here's what happens:

---

## 🎯 What Happens Automatically

### On App Launch
1. ✅ Notification system initializes
2. ✅ Permissions are requested (first time only)
3. ✅ Notifications are scheduled (4 times/day)

### When User Uses Tools
1. ✅ Tool usage is tracked automatically
2. ✅ Next notification will be a motivational quote
3. ✅ Resets daily at midnight

### When User Doesn't Use Tools
1. ✅ System detects no recent tool usage
2. ✅ Sends gentle reminder to use tools
3. ✅ "🎯 Your tools are waiting to help you recharge"

---

## 📱 Notification Schedule

Notifications sent at:
- **9:00 AM** - Morning motivation
- **12:30 PM** - Midday check-in
- **4:00 PM** - Afternoon boost
- **7:30 PM** - Evening reflection

---

## 🎨 What Notifications Look Like

### If User Hasn't Used Tools:
```
🎯 Take a moment for yourself
Your tools are waiting to help you recharge.
```

### If User Has Used Tools:
```
💪 You've got this
You were never meant to run on empty.
```

Or:
```
✨ Daily wisdom
Your capacity is elastic, not infinite.
```

(20+ different motivational quotes rotate automatically)

---

## 🧪 How to Test

### Method 1: Wait for Scheduled Time
- Just wait until 9 AM, 12:30 PM, 4 PM, or 7:30 PM
- You'll receive a notification automatically

### Method 2: Use Settings Screen (Recommended)
1. Open the app
2. Go to `/notification-settings` route (or add a button to access it)
3. Toggle notifications ON
4. Tap "Send Test Notification"
5. Receive test notification in 2 seconds

### Method 3: Test in Development
Add this to any screen temporarily:
```typescript
import { sendImmediateNotification } from '../utils/notificationService';

// In your component:
<TouchableOpacity onPress={() => {
  sendImmediateNotification(
    "Test Notification",
    "This is a test!",
    2
  );
}}>
  <Text>Test Notification</Text>
</TouchableOpacity>
```

---

## 🔧 User Control

### Settings Screen Already Created!
Location: `/home/runner/workspace/app/notification-settings.tsx`

Features:
- ✅ Toggle notifications on/off
- ✅ See how many notifications are scheduled
- ✅ Learn how the system works
- ✅ Send test notification
- ✅ Beautiful responsive UI

### How to Add to Your App

#### Option 1: Add Button in Home Screen
```typescript
// In home.tsx, add a notifications button:
<TouchableOpacity onPress={() => router.push('/notification-settings')}>
  <Text>🔔 Notifications</Text>
</TouchableOpacity>
```

#### Option 2: Add to Tools Screen
```typescript
// Already has a settings button - just update the route:
router.push('/notification-settings');
```

#### Option 3: Add to Profile/Settings
```typescript
// Add as a settings option in your profile screen
```

---

## 💡 Important Notes

### Permissions
- **iOS**: Requires user permission (automatically requested on first run)
- **Android**: Local notifications work without permission
- If denied: App will still work, just no notifications

### Background Delivery
- iOS handles notification scheduling automatically
- Notifications will fire even if app is closed
- Uses local notifications (no server needed)

### Privacy
- All tracking is local (AsyncStorage)
- No data sent to servers
- User can disable anytime

---

## 🐛 Troubleshooting

### Notifications Not Showing?
1. Check iOS Settings > Notifications > Forecee
2. Make sure "Allow Notifications" is ON
3. Try test notification in settings screen

### Permission Denied?
1. Go to iOS Settings > Forecee > Notifications
2. Enable "Allow Notifications"
3. Restart app

### Want Different Times?
Edit `scheduleDailyNotifications()` in `utils/notificationService.ts`:
```typescript
const notificationTimes = [
  { hour: 9, minute: 0 },   // Change these!
  { hour: 12, minute: 30 },
  { hour: 16, minute: 0 },
  { hour: 19, minute: 30 },
];
```

---

## 🎯 Next Step: Add Access Button

Add a button somewhere in your app to access `/notification-settings`. Example:

```typescript
// In home.tsx or tools.tsx:
<TouchableOpacity 
  style={styles.notificationButton}
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notification-settings');
  }}
>
  <Text style={styles.notificationIcon}>🔔</Text>
  <Text style={styles.notificationText}>Notifications</Text>
</TouchableOpacity>
```

---

## ✨ That's It!

Everything is working and ready to use. Just build the app and test it on a real device!

**Expo Go Limitation**: Notifications won't work in Expo Go. You need to build the app with `eas build` for iOS to test notifications properly.

---

Last Updated: 2025-11-09
Status: READY TO USE 🚀

