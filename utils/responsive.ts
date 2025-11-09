import { Dimensions, PixelRatio } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions - iPhone 14 Pro
// This ensures iPhone 14 Pro users see NO CHANGE
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scales a value based on screen width relative to iPhone 14 Pro
 * On iPhone 14 Pro (393 width), returns the exact input value
 * On other devices, scales proportionally
 * 
 * @param size - The size value from iPhone 14 Pro design
 * @returns Scaled size for current device
 * 
 * @example
 * scale(16) // Returns 16 on iPhone 14 Pro, ~17.5 on 15 Pro Max, ~41.7 on iPad
 */
export const scale = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return size * scaleFactor;
};

/**
 * Scales a value based on screen height relative to iPhone 14 Pro
 * On iPhone 14 Pro (852 height), returns the exact input value
 * On other devices, scales proportionally
 * 
 * @param size - The size value from iPhone 14 Pro design
 * @returns Scaled size for current device
 * 
 * @example
 * verticalScale(20) // Returns 20 on iPhone 14 Pro, scales on other devices
 */
export const verticalScale = (size: number): number => {
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  return size * scaleFactor;
};

/**
 * Moderate scale - uses a factor to control how aggressively to scale
 * On iPhone 14 Pro, still returns the exact input value
 * On other devices, scales more conservatively
 * 
 * @param size - The size value from iPhone 14 Pro design
 * @param factor - How much to scale (0 = no scale, 1 = full scale). Default 0.5
 * @returns Moderately scaled size for current device
 * 
 * @example
 * moderateScale(16) // More conservative scaling than scale()
 * moderateScale(16, 0.3) // Even more conservative
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return size + (size * (scaleFactor - 1)) * factor;
};

/**
 * Responsive Font Value - scales font sizes intelligently
 * On iPhone 14 Pro, returns the exact input value
 * Uses screen height for better text scaling
 * 
 * @param fontSize - The font size from iPhone 14 Pro design
 * @returns Scaled font size for current device
 * 
 * @example
 * RFValue(16) // Returns 16 on iPhone 14 Pro, scales on other devices
 */
export const RFValue = (fontSize: number): number => {
  const heightPercent = (fontSize * SCREEN_HEIGHT) / BASE_HEIGHT;
  return Math.round(heightPercent);
};

/**
 * Scale with pixel ratio consideration
 * Useful for hairline borders and very precise measurements
 */
export const scaleWithPixelRatio = (size: number): number => {
  return PixelRatio.roundToNearestPixel(scale(size));
};

/**
 * Check if current device is iPhone 14 Pro
 * (or very close to its dimensions)
 */
export const isIPhone14Pro = (): boolean => {
  return Math.abs(SCREEN_WIDTH - BASE_WIDTH) < 5 && 
         Math.abs(SCREEN_HEIGHT - BASE_HEIGHT) < 5;
};

/**
 * Get device type for conditional logic if needed
 */
export const getDeviceType = (): 'phone' | 'tablet' => {
  return SCREEN_WIDTH < 768 ? 'phone' : 'tablet';
};

/**
 * Helper to convert percentage to actual width
 * @param percentage - Percentage of screen width (e.g., 90 for 90%)
 */
export const widthPercentageToDP = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Helper to convert percentage to actual height
 * @param percentage - Percentage of screen height (e.g., 50 for 50%)
 */
export const heightPercentageToDP = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Shorthand exports
export const wp = widthPercentageToDP;
export const hp = heightPercentageToDP;

// Export dimensions for direct use if needed
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;
export const baseWidth = BASE_WIDTH;
export const baseHeight = BASE_HEIGHT;

// Log for debugging (remove in production)
if (__DEV__) {
  console.log('📱 Responsive Utils Initialized');
  console.log(`Screen: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
  console.log(`Base (iPhone 14 Pro): ${BASE_WIDTH}x${BASE_HEIGHT}`);
  console.log(`Scale Factor: ${(SCREEN_WIDTH / BASE_WIDTH).toFixed(3)}`);
  console.log(`Is iPhone 14 Pro: ${isIPhone14Pro()}`);
  console.log(`Device Type: ${getDeviceType()}`);
}


