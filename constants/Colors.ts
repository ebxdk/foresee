/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Foresee's color system - soft pastels and glassmorphism for calm, supportive capacity management
 */

// Foresee's pastel color palette
const palette = {
  // Primary pastels
  lavender: {
    light: '#E6E6FA',
    medium: '#D8BFD8',
    dark: '#B19CD9',
  },
  mint: {
    light: '#F0FFF0',
    medium: '#98FB98',
    dark: '#90EE90',
  },
  skyBlue: {
    light: '#E0F6FF',
    medium: '#87CEEB',
    dark: '#4FC3F7',
  },
  // Backgrounds
  background: {
    light: '#FFFFFF',
    dark: '#000000',
  },
  card: {
    light: '#F9F9F9',
    dark: '#1C1C1E',
  },
  border: {
    light: '#E0E0E0',
    dark: '#38383A',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(255, 255, 255, 0.1)',
  },
  // Text
  text: {
    light: {
      primary: '#2C2C2E',
      secondary: '#48484A',
      tertiary: '#8E8E93',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      tertiary: '#EBEBF599',
    },
  },
  textOnTint: {
    light: '#000000',
    dark: '#FFFFFF',
  },
  // Capacity rings - soft and calming
  energy: {
    light: '#90EE90', // Soft mint green
    dark: '#98FB98',
  },
  purpose: {
    light: '#DDA0DD', // Soft plum
    dark: '#E6E6FA',
  },
  connection: {
    light: '#87CEEB', // Sky blue
    dark: '#4FC3F7',
  },
  // Status colors - gentle versions
  success: {
    light: '#98FB98', // Mint green
    dark: '#90EE90',
  },
  warning: {
    light: '#F5DEB3', // Wheat
    dark: '#DDD6C0',
  },
  low: {
    light: '#FFB6C1', // Light pink
    dark: '#F8BBD9',
  },
  // Gradients for tools
  aiCoach: {
    start: '#E6E6FA', // Lavender
    end: '#D8BFD8',
  },
  schedule: {
    start: '#98FB98', // Mint
    end: '#90EE90',
  },
  radar: {
    start: '#87CEEB', // Sky blue
    end: '#4FC3F7',
  },
};

export const Colors = {
  light: {
    text: palette.text.light.primary,
    textSecondary: palette.text.light.secondary,
    textTertiary: palette.text.light.tertiary,
    textOnTint: palette.textOnTint.light,
    background: palette.background.light,
    glass: palette.glass.light,
    tint: palette.lavender.dark,
    card: palette.card.light,
    border: palette.border.light,
    tabIconDefault: palette.text.light.tertiary,
    tabIconSelected: palette.lavender.dark,
    // Capacity colors
    energy: palette.energy.light,
    purpose: palette.purpose.light,
    connection: palette.connection.light,
    // Status colors
    success: palette.success.light,
    warning: palette.warning.light,
    error: palette.low.light,
    // Tool gradients (arrays for LinearGradient)
    aiCoach: [palette.aiCoach.start, palette.aiCoach.end],
    schedule: [palette.schedule.start, palette.schedule.end],
    radar: [palette.radar.start, palette.radar.end],
    // Tool single colors (for backgrounds, borders, etc.)
    aiCoachSingle: palette.aiCoach.start,
    scheduleSingle: palette.schedule.start,
    radarSingle: palette.radar.start,
  },
  dark: {
    text: palette.text.dark.primary,
    textSecondary: palette.text.dark.secondary,
    textTertiary: palette.text.dark.tertiary,
    textOnTint: palette.textOnTint.dark,
    background: palette.background.dark,
    glass: palette.glass.dark,
    tint: palette.lavender.medium,
    card: palette.card.dark,
    border: palette.border.dark,
    tabIconDefault: palette.text.dark.tertiary,
    tabIconSelected: palette.lavender.medium,
    // Capacity colors
    energy: palette.energy.dark,
    purpose: palette.purpose.dark,
    connection: palette.connection.dark,
    // Status colors
    success: palette.success.dark,
    warning: palette.warning.dark,
    error: palette.low.dark,
    // Tool gradients (arrays for LinearGradient)
    aiCoach: [palette.aiCoach.start, palette.aiCoach.end],
    schedule: [palette.schedule.start, palette.schedule.end],
    radar: [palette.radar.start, palette.radar.end],
    // Tool single colors (for backgrounds, borders, etc.)
    aiCoachSingle: palette.aiCoach.start,
    scheduleSingle: palette.schedule.start,
    radarSingle: palette.radar.start,
  },
};

export const Gradients = {
  background: {
    light: ['#F0F8FF', '#E6E6FA', '#F0FFF0'], // Sky to lavender to mint
    dark: ['#1a1a2e', '#16213e', '#0f0f23'],
  },
  aiCoach: [palette.aiCoach.start, palette.aiCoach.end],
  schedule: [palette.schedule.start, palette.schedule.end],
  radar: [palette.radar.start, palette.radar.end],
};
