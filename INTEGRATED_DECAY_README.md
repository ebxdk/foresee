# 🌙 Integrated Energy Decay System

## 🎯 **What's New in Phase 2:**

The energy decay system now **actually updates your EPC scores** instead of just calculating decay rates. It's fully integrated with the mock sleep system and will automatically apply energy loss over time.

## 🚀 **Key Features:**

### **✅ Dynamic Sleep Detection:**
- **Night Owl Default**: 1:00 AM → 9:00 AM sleep schedule
- **Learns from User Activity**: Detects when you're most active
- **Adaptive Patterns**: Adjusts sleep times based on behavior

### **✅ Real EPC Score Updates:**
- **Energy Decay Applied**: Actually decreases energy scores
- **Hourly Updates**: Checks and applies decay every hour
- **Persistent Storage**: Changes saved to AsyncStorage

### **✅ Smart Decay Logic:**
- **Activity-Based**: Higher activity = faster energy loss
- **Time-Based**: Different decay rates by hour of day
- **Buffer Integration**: Tools can slow down energy loss
- **Sleep Protection**: No decay during sleep hours

## 🧪 **How to Test:**

### **1. Open Your App**
Navigate to the home screen and look for the **"🧪 Energy Decay Tests"** section.

### **2. Test the Integrated System:**
- **"Test Integrated Decay"** button (teal color)
- This will actually apply energy decay to your EPC scores
- Watch your energy bar decrease in real-time!

### **3. Test Individual Components:**
- **"Store Activity"**: Set different activity levels
- **"Calculate Decay"**: See decay calculations
- **"Check Status"**: View current system state
- **"Test Buffers"**: Test buffer effects

### **4. Monitor Real-Time Changes:**
- **EnergyDecayStatus component** shows live decay info
- **EPC score bars** update automatically
- **Console logs** show detailed information

## 📊 **What Happens When You Test:**

### **Scenario 1: Normal Day (Awake)**
```
Time: 2:00 PM (active hours)
Activity: 10,000 steps
Decay Rate: 1.5/hour × 1.5x activity = 2.25/hour
Result: Energy decreases by ~2.25 points
```

### **Scenario 2: Sleep Time**
```
Time: 2:00 AM (sleep hours)
Activity: Any level
Decay Rate: 0/hour (sleep protection)
Result: No energy loss
```

### **Scenario 3: With Buffer Active**
```
Time: 2:00 PM (active hours)
Activity: 10,000 steps
Buffer: 0.5x multiplier (from tool)
Decay Rate: 1.5/hour × 1.5x × 0.5x = 1.125/hour
Result: Energy decreases by ~1.125 points (slower!)
```

## 🌙 **Mock Sleep System Details:**

### **Default Night Owl Pattern:**
- **Bedtime**: 1:00 AM
- **Wake Time**: 9:00 AM
- **Sleep Duration**: 8 hours
- **Quality**: 4/5 (good sleep)

### **Learning System:**
- **Tracks app usage** to detect activity patterns
- **Identifies night owl behavior** automatically
- **Adjusts sleep schedule** based on user behavior
- **Stores sleep history** for pattern analysis

## ⚡ **Energy Decay Rules:**

### **Time-Based Decay Rates:**
- **6 AM - 9 AM**: 0.5/hour (gentle morning)
- **9 AM - 12 PM**: 1.0/hour (moderate morning)
- **12 PM - 4 PM**: 1.5/hour (active afternoon)
- **4 PM - 8 PM**: 2.0/hour (peak activity)
- **8 PM - 11 PM**: 1.0/hour (evening wind-down)
- **11 PM - 6 AM**: 0.0/hour (sleep time)

### **Activity Multipliers:**
- **0-3,000 steps**: 1.0x (normal decay)
- **3,000-8,000 steps**: 1.2x (slightly faster)
- **8,000-15,000 steps**: 1.5x (moderate decay)
- **15,000+ steps**: 2.0x (fastest decay)

## 🔄 **Integration Points:**

### **With Tools:**
- **Energy Buffers**: Slow down decay when active
- **Score Tails**: Gradual fade of P/C scores
- **Global Rules**: Saturation and low-state amplifiers

### **With Health Data:**
- **Activity Tracking**: Steps, active minutes, exercise
- **Sleep Patterns**: Bedtime, wake time, quality
- **Real-time Updates**: Hourly decay checks

## 🎉 **Ready for Testing!**

The integrated system is now fully functional and will:
1. **Detect when you're sleeping** (night owl patterns)
2. **Apply realistic energy decay** based on activity and time
3. **Update your EPC scores** automatically
4. **Learn from your behavior** to improve sleep detection
5. **Integrate with tools** for buffers and effects

**Try the "Test Integrated Decay" button to see it in action!** 🚀

