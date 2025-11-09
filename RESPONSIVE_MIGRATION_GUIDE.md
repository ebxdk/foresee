# 📱 Responsive Design Migration Guide

## Overview
This guide explains how to safely migrate hardcoded dimensions to responsive scaling while ensuring **iPhone 14 Pro remains identical**.

## Key Principle: iPhone 14 Pro as Base
- **Base Dimensions**: 393 x 852 (iPhone 14 Pro)
- **On iPhone 14 Pro**: `scale(16)` returns exactly `16` (NO CHANGE)
- **On other devices**: Values scale proportionally

## Quick Reference

### When to Use Each Function

| Function | Use Case | Example |
|----------|----------|---------|
| `scale()` | Horizontal spacing, widths, icon sizes | `width: scale(60)` |
| `verticalScale()` | Vertical spacing, heights | `height: verticalScale(100)` |
| `moderateScale()` | Values that shouldn't scale as aggressively | `borderRadius: moderateScale(20)` |
| `RFValue()` | Font sizes | `fontSize: RFValue(16)` |
| `wp()` / `hp()` | Percentage-based layouts | `width: wp(90)` (90% of screen width) |

## Migration Steps

### Step 1: Import the utilities
```typescript
import { scale, verticalScale, RFValue, moderateScale } from '@/utils/responsive';
```

### Step 2: Replace hardcoded values

#### ❌ Before (Hardcoded)
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  icon: {
    width: 32,
    height: 32,
  },
});
```

#### ✅ After (Responsive)
```typescript
const styles = StyleSheet.create({
  container: {
    padding: scale(16),           // Scales with screen width
    borderRadius: moderateScale(20), // Scales moderately
  },
  title: {
    fontSize: RFValue(20),        // Scales for font
    marginBottom: verticalScale(12), // Scales with screen height
  },
  icon: {
    width: scale(32),             // Scales with screen width
    height: scale(32),            // Keep aspect ratio
  },
});
```

## Guidelines

### 1. Font Sizes
**Always use `RFValue()`** for font sizes:
```typescript
fontSize: RFValue(16)  // ✅ Good
fontSize: scale(16)    // ❌ Don't use scale() for fonts
```

### 2. Padding & Margins
Use `scale()` for horizontal, `verticalScale()` for vertical:
```typescript
paddingHorizontal: scale(16)    // ✅ Horizontal spacing
paddingVertical: verticalScale(12) // ✅ Vertical spacing
padding: scale(16)              // ✅ Also fine for uniform padding
```

### 3. Widths & Heights
Use `scale()` for both to maintain aspect ratios:
```typescript
width: scale(100)   // ✅ Scales proportionally
height: scale(100)  // ✅ Maintains square shape
```

### 4. Border Radius
Use `moderateScale()` for more conservative scaling:
```typescript
borderRadius: moderateScale(20)  // ✅ Won't look too rounded on large screens
borderRadius: scale(20)          // ⚠️ Might look overly rounded on iPad
```

### 5. Fixed Sizes (When NOT to scale)
Some values should remain fixed:
```typescript
borderWidth: 1              // ✅ Keep as is - hairline borders
shadowRadius: 12            // ✅ Keep as is - shadow effects
elevation: 4                // ✅ Keep as is - Android elevation
opacity: 0.8                // ✅ Keep as is - opacity values
```

### 6. Percentage-based Layouts
For full-width or percentage-based components:
```typescript
width: wp(90)        // 90% of screen width
maxWidth: wp(80)     // 80% of screen width
height: hp(50)       // 50% of screen height
```

## Testing Strategy

### On iPhone 14 Pro
1. The app should look **IDENTICAL** to before
2. Check the console logs: `Is iPhone 14 Pro: YES ✅`
3. Verify: `scale(16)` returns exactly `16.00`

### On Other iPhones
1. Layout should scale proportionally
2. Text remains readable (not too small/large)
3. Spacing feels natural

### On iPad
1. Components should be larger but proportional
2. Use `getDeviceType()` if special iPad layouts needed
3. Consider max-width constraints for very large screens

## Priority Order (Option 1)

### Phase 1: Core Screens (High Priority)
- [x] Utilities created
- [ ] `app/(tabs)/home.tsx`
- [ ] `app/(tabs)/coach.tsx`
- [ ] `app/(tabs)/tools.tsx`
- [ ] `app/(tabs)/progress.tsx`
- [ ] `app/(tabs)/radar.tsx`

### Phase 2: Core Components (High Priority)
- [ ] `components/EnhancedEPCDisplay.tsx`
- [ ] `components/BurnoutGraphChart.tsx`
- [ ] `components/BurnoutForecastWidget.tsx`
- [ ] `components/HorizontalTimelineGraph.tsx`
- [ ] `components/CapacityRing.tsx`

### Phase 3: Auth Screens (Medium Priority)
- [ ] `components/LoginScreen.tsx`
- [ ] `components/EmailInputScreen.tsx`
- [ ] `components/PasswordSetupScreen.tsx`
- [ ] `components/VerificationCodeScreen.tsx`

### Phase 4: Remaining Screens (Low Priority)
- [ ] Tool screens (122 files)
- [ ] Modal screens
- [ ] Onboarding screens

## Common Patterns

### Pattern 1: Card Components
```typescript
container: {
  backgroundColor: '#FFFFFF',
  borderRadius: moderateScale(16),
  padding: scale(20),
  margin: scale(8),
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 }, // Keep fixed
  shadowOpacity: 0.08, // Keep fixed
  shadowRadius: 12, // Keep fixed
  elevation: 4, // Keep fixed
}
```

### Pattern 2: Typography
```typescript
title: {
  fontSize: RFValue(20),
  fontWeight: '700',
  color: '#1C1C1E',
  marginBottom: verticalScale(12),
}
```

### Pattern 3: Icons & Buttons
```typescript
iconContainer: {
  width: scale(44),  // Touch target
  height: scale(44), // Touch target
  borderRadius: moderateScale(22), // Half of width
  justifyContent: 'center',
  alignItems: 'center',
}
```

## Verification Checklist

Before committing changes:
- [ ] Test on iPhone 14 Pro (should look identical)
- [ ] Test on simulator with different device sizes
- [ ] Check console logs for scale factor
- [ ] Verify text is readable on all sizes
- [ ] Ensure touch targets are appropriately sized
- [ ] No layout overflow or clipping

## Troubleshooting

### "Values look different on iPhone 14 Pro!"
- Double-check you're using the utilities correctly
- Verify in console: `Is iPhone 14 Pro: YES ✅`
- Check that BASE_WIDTH = 393 and BASE_HEIGHT = 852

### "iPad looks weird"
- Consider using `getDeviceType()` for tablet-specific layouts
- Add max-width constraints: `maxWidth: scale(600)`
- Use percentage-based layouts: `width: wp(80)`

### "Fonts too small on small devices"
- This is expected for smaller screens
- Consider using `moderateScale()` with custom factor:
  ```typescript
  fontSize: moderateScale(16, 0.3) // Less aggressive scaling
  ```

## Notes

- Always test on multiple device sizes
- Keep a test device with iPhone 14 Pro dimensions
- Update this guide as you discover new patterns
- Consider using the test file (`responsive.test.tsx`) to verify scaling


