# 📝 Responsive Design Cheat Sheet

**Keep this open while migrating files** ⚡

---

## 1️⃣ Import (Copy/Paste)

```typescript
import { scale, verticalScale, RFValue, moderateScale } from '@/utils/responsive';
```

---

## 2️⃣ Font Sizes → RFValue()

```typescript
fontSize: 12   →   fontSize: RFValue(12)
fontSize: 14   →   fontSize: RFValue(14)
fontSize: 16   →   fontSize: RFValue(16)
fontSize: 18   →   fontSize: RFValue(18)
fontSize: 20   →   fontSize: RFValue(20)
fontSize: 24   →   fontSize: RFValue(24)
```

---

## 3️⃣ Horizontal Spacing → scale()

```typescript
padding: 16           →   padding: scale(16)
paddingHorizontal: 20 →   paddingHorizontal: scale(20)
paddingLeft: 12       →   paddingLeft: scale(12)
paddingRight: 12      →   paddingRight: scale(12)

margin: 8             →   margin: scale(8)
marginHorizontal: 16  →   marginHorizontal: scale(16)
marginLeft: 10        →   marginLeft: scale(10)
marginRight: 10       →   marginRight: scale(10)

width: 60             →   width: scale(60)
minWidth: 100         →   minWidth: scale(100)
maxWidth: 400         →   maxWidth: scale(400)
```

---

## 4️⃣ Vertical Spacing → verticalScale()

```typescript
paddingVertical: 12   →   paddingVertical: verticalScale(12)
paddingTop: 16        →   paddingTop: verticalScale(16)
paddingBottom: 16     →   paddingBottom: verticalScale(16)

marginVertical: 8     →   marginVertical: verticalScale(8)
marginTop: 12         →   marginTop: verticalScale(12)
marginBottom: 12      →   marginBottom: verticalScale(12)

height: 100           →   height: verticalScale(100)
minHeight: 50         →   minHeight: verticalScale(50)
maxHeight: 300        →   maxHeight: verticalScale(300)

gap: 8                →   gap: verticalScale(8)
```

---

## 5️⃣ Border Radius → moderateScale()

```typescript
borderRadius: 8       →   borderRadius: moderateScale(8)
borderRadius: 12      →   borderRadius: moderateScale(12)
borderRadius: 16      →   borderRadius: moderateScale(16)
borderRadius: 20      →   borderRadius: moderateScale(20)
borderRadius: 24      →   borderRadius: moderateScale(24)

borderTopLeftRadius: 16     →   borderTopLeftRadius: moderateScale(16)
borderBottomRightRadius: 16 →   borderBottomRightRadius: moderateScale(16)
```

---

## 6️⃣ Keep Fixed (DON'T Change)

```typescript
// Hairline borders
borderWidth: 1              ✅ NO CHANGE
borderWidth: 0.5            ✅ NO CHANGE
borderTopWidth: 1           ✅ NO CHANGE

// Tiny border radius (< 5)
borderRadius: 1             ✅ NO CHANGE
borderRadius: 2             ✅ NO CHANGE
borderRadius: 4             ✅ NO CHANGE

// Shadows
shadowOffset: { width: 0, height: 2 }   ✅ NO CHANGE
shadowOpacity: 0.1          ✅ NO CHANGE
shadowRadius: 8             ✅ NO CHANGE

// Elevation (Android)
elevation: 2                ✅ NO CHANGE
elevation: 4                ✅ NO CHANGE

// Opacity / Transparency
opacity: 0.5                ✅ NO CHANGE
opacity: 0.8                ✅ NO CHANGE

// Z-Index / Layer Order
zIndex: 1                   ✅ NO CHANGE
zIndex: 999                 ✅ NO CHANGE

// Letter Spacing
letterSpacing: 0.5          ✅ NO CHANGE
letterSpacing: 1.2          ✅ NO CHANGE

// Line Height (usually)
lineHeight: 24              ⚠️  Consider: RFValue(24)
```

---

## 7️⃣ Special Cases

### Icons & Touch Targets
```typescript
// Keep square (use scale for both)
icon: {
  width: scale(32),
  height: scale(32),
}

// Touch target (44x44 minimum)
button: {
  width: scale(44),
  height: scale(44),
}
```

### Percentage-Based
```typescript
width: '100%'               ✅ NO CHANGE (already responsive)
width: '90%'                ✅ NO CHANGE
height: '100%'              ✅ NO CHANGE

// Or use helper functions
width: wp(90)               // 90% of screen width
height: hp(50)              // 50% of screen height
```

### Dynamic Values in JSX
```typescript
// Before
<View style={{ width: 60 }} />

// After
<View style={{ width: scale(60) }} />

// Or
const dynamicWidth = scale(60);
<View style={{ width: dynamicWidth }} />
```

---

## 🔍 Quick Find/Replace Patterns

### VS Code / Cursor Regex

**Find font sizes**:
```
fontSize: (\d+)
```
**Replace**:
```
fontSize: RFValue($1)
```

**Find padding**:
```
padding: (\d+)
```
**Replace**:
```
padding: scale($1)
```

**Find width**:
```
width: (\d+)
```
**Replace**:
```
width: scale($1)
```

**Find border radius**:
```
borderRadius: (\d+)
```
**Replace**:
```
borderRadius: moderateScale($1)
```

---

## ✅ Quick Test

After migrating, check:
1. Import is at top ✅
2. All fontSize use RFValue ✅
3. Horizontal values use scale ✅
4. Vertical values use verticalScale ✅
5. Border radius use moderateScale ✅
6. Fixed values stayed fixed ✅
7. App looks identical on iPhone 14 Pro ✅

---

## 🎯 Common Patterns

### Card Component
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(20),
    margin: scale(16),
    shadowColor: '#000',          // Keep fixed
    shadowOffset: { width: 0, height: 2 },  // Keep fixed
    shadowOpacity: 0.1,           // Keep fixed
    shadowRadius: 8,              // Keep fixed
    elevation: 3,                 // Keep fixed
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: '700',
    marginBottom: verticalScale(12),
  },
  body: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
});
```

### Button Component
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    minWidth: scale(120),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

### List Item
```typescript
const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,         // Keep fixed
    borderBottomColor: '#E5E5EA',
  },
  icon: {
    width: scale(24),
    height: scale(24),
    marginRight: scale(12),
  },
  text: {
    fontSize: RFValue(16),
    flex: 1,
  },
});
```

---

## 💡 Pro Tips

1. **Start with fonts** - Easiest to spot and replace
2. **Then padding/margin** - Usually consistent patterns
3. **Then widths/heights** - May need case-by-case review
4. **Keep borderWidth: 1** - These should stay hairline
5. **Test frequently** - Check iPhone 14 Pro after each file

---

## 🚨 Warning Signs

**If you see any of these, stop and review**:
- Layout looks broken on iPhone 14 Pro
- Text is different size than before
- Spacing is noticeably different
- Components overlap

**Most likely cause**: Scaled a value that should stay fixed.

---

## 📚 Full Documentation

- **Example**: `components/BurnoutForecastWidget.tsx`
- **Workflow**: `OPTION_A_WORKFLOW.md`
- **Full Guide**: `RESPONSIVE_MIGRATION_GUIDE.md`

---

**Print this out or keep it in a side window while migrating!** 📌


