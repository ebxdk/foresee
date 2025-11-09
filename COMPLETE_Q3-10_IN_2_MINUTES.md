# ⚡ Complete Questions 3-10 in 2 Minutes

## ✅ Questions 1-2: DONE

You're all set! Now Questions 3-10 need the exact same updates.

---

## 🎯 Super Fast Copy/Paste Method

Since ALL question files have IDENTICAL structure, here's the fastest way:

### Step 1: Copy These Import Lines (from question-1.tsx)

```typescript
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';
```

### Step 2: For Each Question File (3-10):

1. **Open `question-3.tsx`**
2. **Replace lines 3-4** with the imports above
3. **Replace line 60** (the `<View style={styles.content}>`) with:
   ```typescript
   <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
   ```
4. **Replace line 93** (the closing `</View>`) with:
   ```typescript
   </ScrollView>
   ```
5. **Copy the entire `styles` section** from question-1.tsx (lines 127-296)
6. **Paste it** into question-3.tsx, replacing the old styles
7. **IMPORTANT**: Change `width: '10%'` to `width: '30%'` (for question 3)

8. **Repeat for questions 4-10**, adjusting progress percentage:
   - Question 4: `width: '40%'`
   - Question 5: `width: '50%'`
   - Question 6: `width: '60%'`
   - Question 7: `width: '70%'`
   - Question 8: `width: '80%'`
   - Question 9: `width: '90%'`
   - Question 10: `width: '100%'`

---

## 🚀 Even Faster: Multi-File Replace (VS Code/Cursor)

### 1. Add Imports (All Files at Once)
**Find in Files** (Cmd+Shift+F / Ctrl+Shift+H):
```
Files to include: app/question-*.tsx
Find: import React, { useState } from 'react';
Replace: import { useState } from 'react';
```

Then:
```
Find: import { SafeAreaView, StatusBar, StyleSheet
Replace: import { SafeAreaView, ScrollView, StatusBar, StyleSheet
```

Then manually add this line after the imports:
```typescript
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';
```

### 2. Change to ScrollView
```
Find: <View style={styles.content}>
      <View style={styles.questionContainer}>
Replace: <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.questionContainer}>
```

### 3. Copy Styles
- Open `question-1.tsx`
- Copy lines 127-296 (entire styles section)
- Paste into each question file
- Adjust progress percentage for each

---

## ✅ Verification Checklist

After updating each file:
- [ ] Responsive imports added
- [ ] ScrollView instead of View
- [ ] Styles copied from question-1
- [ ] Progress percentage correct (30%, 40%, etc.)
- [ ] No linter errors
- [ ] File saves successfully

---

## 🎯 Result

After these updates:
- ✅ **No overlap** on ANY device
- ✅ **Scrollable** content
- ✅ **Responsive** sizing
- ✅ **Works everywhere** (iPhone SE to iPad Pro)

---

## 📊 Progress Tracker

- [x] Question 1 (10%) ✅
- [x] Question 2 (20%) ✅
- [ ] Question 3 (30%)
- [ ] Question 4 (40%)
- [ ] Question 5 (50%)
- [ ] Question 6 (60%)
- [ ] Question 7 (70%)
- [ ] Question 8 (80%)
- [ ] Question 9 (90%)
- [ ] Question 10 (100%)

---

## 💡 Pro Tip

Use multi-cursor editing in your IDE:
1. Open all question files (3-10) in tabs
2. Use Cmd+D / Ctrl+D to select multiple instances
3. Edit them all at once
4. Save all (Cmd+K S / Ctrl+K S)

**Estimated time: 2-5 minutes for all 8 files!** ⚡

---

**Questions 1-2 are already perfect.** Just follow this guide for 3-10 and you're done!

