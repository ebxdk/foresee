# ⚡ Energy Decay System

## Overview

The Energy Decay System is a realistic energy management feature that simulates how human energy naturally decreases throughout the day based on activity levels, time of day, and sleep quality.

## 🎯 Key Features

### 1. **Activity-Based Decay Multipliers**
- **Sedentary** (0-2k steps): Normal decay (1.0x)
- **Light Activity** (2k-8k steps): 20% faster decay (1.2x)
- **Moderate Activity** (8k-15k steps): 50% faster decay (1.5x)
- **High Activity** (15k+ steps): Double decay (2.0x)

### 2. **Time-Based Decay Rates**
- **Morning** (6-10 AM): Slow decay (0.5/hour)
- **Midday** (10 AM-2 PM): Normal decay (1.0/hour)
- **Afternoon** (2-6 PM): Faster decay (1.5/hour)
- **Evening** (6-10 PM): Fastest decay (2.0/hour)
- **Night** (10 PM-6 AM): No decay (sleeping)

### 3. **Sleep Quality Integration**
- **Excellent sleep** (8+ hours, quality 4-5): +15 Energy
- **Good sleep** (7+ hours, quality 3-4): +10 Energy
- **Fair sleep** (6+ hours, quality 2-3): +5 Energy
- **Poor sleep** (quality 1-2): -10 Energy
- **Sleep deprivation** (<6 hours): -15 Energy

### 4. **Buffer System Integration**
- Energy buffers from tools slow down decay
- Buffer multipliers (0.2x to 0.7x) reduce decay rate
- Seamlessly integrates with existing tool system

## 🛠️ How It Works

### **Hourly Decay Checks**
- System checks for decay every hour
- Calculates energy loss based on time, activity, and buffers
- Updates EPC scores automatically

### **Activity Data Integration**
- Uses existing mock health data (steps, active minutes, exercise)
- Automatically stores daily activity when health data is fetched
- Easy to integrate with real HealthKit later

### **Realistic Energy Management**
- Energy naturally decreases throughout the day
- Higher activity = faster energy loss
- Tools provide energy boosts to counteract decay
- Buffers provide temporary protection

## 📱 Usage

### **1. Automatic Integration**
The system automatically integrates with your existing health data:
- When `getHealthData()` is called, daily activity is stored
- Sleep quality adjustments are applied automatically
- Energy decay runs in the background

### **2. Manual Energy Decay**
```typescript
import { applyEnergyDecay, getEnergyDecayStatus } from './utils/storage';

// Apply energy decay manually
const decayResult = await applyEnergyDecay();
console.log(`Energy lost: ${decayResult.energyLost}`);

// Check decay status
const status = await getEnergyDecayStatus();
console.log(`Next decay in: ${status.hoursUntilDecay}h`);
```

### **3. Activity Management**
```typescript
import { storeDailyActivity, getDailyActivity } from './utils/storage';

// Store today's activity
await storeDailyActivity({
  steps: 8500,
  activeMinutes: 45,
  exerciseMinutes: 20
});

// Get today's activity
const activity = await getDailyActivity();
console.log(`Steps today: ${activity?.steps}`);
```

### **4. Sleep Adjustments**
```typescript
import { applySleepQualityAdjustment } from './utils/storage';

// Apply sleep quality adjustment
const result = await applySleepQualityAdjustment(4, 7.5);
console.log(`Sleep bonus: +${result.sleepBonus} Energy`);
```

## 🧪 Testing

### **Run Test Suite**
```typescript
import { runAllEnergyDecayTests } from './utils/energyDecayTest';

// Run all tests
await runAllEnergyDecayTests();
```

### **Test Individual Components**
```typescript
import { 
  testEnergyDecaySystem,
  testBufferIntegration 
} from './utils/energyDecayTest';

// Test specific components
await testEnergyDecaySystem();
await testBufferIntegration();
```

## 🎨 UI Components

### **EnergyDecayStatus Component**
A ready-to-use React Native component that displays:
- Current decay rate and status
- Next decay time
- Activity level and multipliers
- Buffer status
- Real-time updates

```tsx
import EnergyDecayStatus from './components/EnergyDecayStatus';

// Use in your app
<EnergyDecayStatus onRefresh={handleRefresh} />
```

## 📊 Example Scenarios

### **Scenario 1: Sedentary Day**
- **Steps**: 1,500
- **Activity Level**: Sedentary
- **Decay Multiplier**: 1.0x
- **Daily Energy Loss**: ~20 points
- **Result**: Gradual energy decline

### **Scenario 2: Active Day**
- **Steps**: 12,000
- **Activity Level**: Moderate
- **Decay Multiplier**: 1.5x
- **Daily Energy Loss**: ~30 points
- **Result**: Faster energy decline

### **Scenario 3: With Energy Buffer**
- **Base Decay**: 1.5/hour
- **Buffer Multiplier**: 0.5x
- **Effective Decay**: 0.75/hour
- **Result**: 50% slower energy loss

## 🔧 Configuration

### **Activity Multipliers**
```typescript
const ACTIVITY_DECAY_MULTIPLIERS = {
  SEDENTARY: { minSteps: 0, maxSteps: 2000, multiplier: 1.0 },
  LIGHT: { minSteps: 2001, maxSteps: 8000, multiplier: 1.2 },
  MODERATE: { minSteps: 8001, maxSteps: 15000, multiplier: 1.5 },
  HIGH: { minSteps: 15001, maxSteps: Infinity, multiplier: 2.0 }
};
```

### **Time-Based Rates**
```typescript
const TIME_BASED_DECAY_RATES = {
  MORNING: { startHour: 6, endHour: 10, rate: 0.5 },
  MIDDAY: { startHour: 10, endHour: 14, rate: 1.0 },
  AFTERNOON: { startHour: 14, endHour: 18, rate: 1.5 },
  EVENING: { startHour: 18, endHour: 22, rate: 2.0 },
  NIGHT: { startHour: 22, endHour: 6, rate: 0.0 }
};
```

## 🚀 Integration Points

### **Existing Systems**
- ✅ **EPC Scores**: Automatic updates
- ✅ **Tool System**: Buffer integration
- ✅ **Health Data**: Activity tracking
- ✅ **Sleep Tracking**: Quality adjustments

### **Future Enhancements**
- 🔄 **Real HealthKit**: Replace mock data
- 🔄 **Push Notifications**: Decay reminders
- 🔄 **Analytics**: Energy trend analysis
- 🔄 **Customization**: User-defined rates

## 📝 Logging

The system provides comprehensive logging:
- Energy decay calculations
- Activity multiplier applications
- Buffer effects
- Sleep adjustments
- Score updates

Check console logs for detailed information about system behavior.

## 🎯 Benefits

1. **Realistic Energy Management**: Mimics real human energy patterns
2. **Activity Integration**: Connects physical activity to energy levels
3. **Sleep Quality Impact**: Rewards good sleep habits
4. **Buffer Synergy**: Tools provide both immediate boosts and long-term protection
5. **Automatic Operation**: Runs in background without user intervention
6. **Easy Integration**: Works with existing systems seamlessly

## 🔍 Troubleshooting

### **Common Issues**
1. **No decay happening**: Check if `LAST_ENERGY_DECAY` timestamp exists
2. **Wrong decay rates**: Verify activity data is being stored
3. **Buffer not working**: Check if energy buffer is active
4. **Sleep adjustments not applied**: Verify sleep quality data format

### **Debug Commands**
```typescript
// Check all system status
const status = await getEnergyDecayStatus();
console.log('Decay Status:', status);

// Check active effects
const effects = await getActiveEffectsStatus();
console.log('Active Effects:', effects);

// Clear all data (for testing)
await clearAllData();
```

---

**The Energy Decay System is now fully integrated and ready to use!** 🎉

It will automatically manage energy levels based on user activity, time of day, and sleep quality, creating a more realistic and engaging wellness experience.
