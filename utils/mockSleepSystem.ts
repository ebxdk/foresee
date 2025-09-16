import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for sleep data
const SLEEP_STORAGE_KEYS = {
  SLEEP_PATTERNS: 'mock_sleep_patterns',
  SLEEP_HISTORY: 'mock_sleep_history',
  LAST_SLEEP_UPDATE: 'last_sleep_update',
  USER_ACTIVITY_PATTERNS: 'user_activity_patterns',
} as const;

// Sleep quality levels
export const SLEEP_QUALITY_LEVELS = {
  EXCELLENT: { score: 5, bonus: 15, description: 'Excellent sleep' },
  GOOD: { score: 4, bonus: 10, description: 'Good sleep' },
  FAIR: { score: 3, bonus: 5, description: 'Fair sleep' },
  POOR: { score: 2, penalty: -15, description: 'Poor sleep' },
  VERY_POOR: { score: 1, penalty: -10, description: 'Very poor sleep' },
} as const;

// Sleep pattern interface
export interface SleepPattern {
  typicalBedtime: number;      // Hour (0-23) when user typically goes to sleep
  typicalWakeTime: number;     // Hour (0-23) when user typically wakes up
  averageSleepDuration: number; // Average hours of sleep
  sleepQuality: number;        // 1-5 scale
  isNightOwl: boolean;         // Whether user is a night owl
  lastUpdated: Date;           // When pattern was last updated
}

// Sleep session interface
export interface SleepSession {
  startTime: Date;
  endTime: Date;
  duration: number;            // Hours
  quality: number;             // 1-5 scale
  energyBefore: number;        // Energy level before sleep
  energyAfter: number;         // Energy level after sleep
}

// User activity pattern interface
export interface UserActivityPattern {
  hour: number;                // Hour of day (0-23)
  activityLevel: number;       // 0-1 scale (0 = inactive, 1 = very active)
  lastUpdated: Date;
}

// Default night owl pattern
const DEFAULT_NIGHT_OWL_PATTERN: SleepPattern = {
  typicalBedtime: 1,           // 1:00 AM
  typicalWakeTime: 9,          // 9:00 AM
  averageSleepDuration: 8,     // 8 hours
  sleepQuality: 4,             // Good sleep quality
  isNightOwl: true,
  lastUpdated: new Date(),
};

/**
 * Get or create default sleep patterns
 */
export async function getSleepPatterns(): Promise<SleepPattern> {
  try {
    const stored = await AsyncStorage.getItem(SLEEP_STORAGE_KEYS.SLEEP_PATTERNS);
    if (stored) {
      const patterns = JSON.parse(stored);
      return {
        ...patterns,
        lastUpdated: new Date(patterns.lastUpdated),
      };
    }
    
    // Create default patterns
    await AsyncStorage.setItem(SLEEP_STORAGE_KEYS.SLEEP_PATTERNS, JSON.stringify(DEFAULT_NIGHT_OWL_PATTERN));
    return DEFAULT_NIGHT_OWL_PATTERN;
  } catch (error) {
    console.error('Error getting sleep patterns:', error);
    return DEFAULT_NIGHT_OWL_PATTERN;
  }
}

/**
 * Update sleep patterns based on user behavior
 */
export async function updateSleepPatterns(newPatterns: Partial<SleepPattern>): Promise<void> {
  try {
    const current = await getSleepPatterns();
    const updated = {
      ...current,
      ...newPatterns,
      lastUpdated: new Date(),
    };
    
    await AsyncStorage.setItem(SLEEP_STORAGE_KEYS.SLEEP_PATTERNS, JSON.stringify(updated));
    console.log('🔄 Sleep patterns updated:', updated);
  } catch (error) {
    console.error('Error updating sleep patterns:', error);
  }
}

/**
 * Learn from user activity patterns
 */
export async function learnFromUserActivity(currentHour: number, isActive: boolean): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SLEEP_STORAGE_KEYS.USER_ACTIVITY_PATTERNS);
    let patterns: UserActivityPattern[] = stored ? JSON.parse(stored) : [];
    
    // Update or create pattern for current hour
    const existingIndex = patterns.findIndex(p => p.hour === currentHour);
    const activityLevel = isActive ? 1 : 0;
    
    if (existingIndex >= 0) {
      // Update existing pattern with weighted average
      const existing = patterns[existingIndex];
      const weight = 0.7; // 70% weight to new data, 30% to existing
      patterns[existingIndex] = {
        ...existing,
        activityLevel: (existing.activityLevel * (1 - weight)) + (activityLevel * weight),
        lastUpdated: new Date(),
      };
    } else {
      // Create new pattern
      patterns.push({
        hour: currentHour,
        activityLevel,
        lastUpdated: new Date(),
      });
    }
    
    await AsyncStorage.setItem(SLEEP_STORAGE_KEYS.USER_ACTIVITY_PATTERNS, JSON.stringify(patterns));
    
    // Analyze patterns to detect night owl behavior
    await analyzeAndUpdateSleepPatterns(patterns);
  } catch (error) {
    console.error('Error learning from user activity:', error);
  }
}

/**
 * Analyze activity patterns to detect sleep behavior
 */
async function analyzeAndUpdateSleepPatterns(patterns: UserActivityPattern[]): Promise<void> {
  try {
    // Find peak activity hours (night owl indicator)
    const sortedPatterns = patterns
      .sort((a, b) => b.activityLevel - a.activityLevel)
      .slice(0, 5); // Top 5 most active hours
    
    const nightOwlHours = sortedPatterns.filter(p => p.hour >= 22 || p.hour <= 6);
    const isNightOwl = nightOwlHours.length >= 2; // At least 2 active hours during night
    
    if (isNightOwl) {
      // Update patterns to reflect night owl behavior
      const current = await getSleepPatterns();
      if (!current.isNightOwl) {
        await updateSleepPatterns({
          isNightOwl: true,
          typicalBedtime: 1, // 1:00 AM
          typicalWakeTime: 9, // 9:00 AM
        });
        console.log('🦉 Detected night owl behavior!');
      }
    }
  } catch (error) {
    console.error('Error analyzing sleep patterns:', error);
  }
}

/**
 * Check if user is currently sleeping based on patterns
 */
export async function isUserCurrentlySleeping(): Promise<boolean> {
  try {
    const patterns = await getSleepPatterns();
    const now = new Date();
    const currentHour = now.getHours();
    
    // Handle overnight sleep (bedtime > wake time)
    if (patterns.typicalBedtime > patterns.typicalWakeTime) {
      // Night owl: sleeps from late night to morning
      return currentHour >= patterns.typicalBedtime || currentHour < patterns.typicalWakeTime;
    } else {
      // Normal: sleeps from evening to morning
      return currentHour >= patterns.typicalBedtime && currentHour < patterns.typicalWakeTime;
    }
  } catch (error) {
    console.error('Error checking sleep status:', error);
    return false;
  }
}

/**
 * Get current sleep status and quality
 */
export async function getCurrentSleepStatus(): Promise<{
  isSleeping: boolean;
  sleepQuality: number;
  hoursUntilWake: number;
  sleepStartTime: Date;
  sleepEndTime: Date;
}> {
  try {
    const patterns = await getSleepPatterns();
    const now = new Date();
    const currentHour = now.getHours();
    
    const isSleeping = await isUserCurrentlySleeping();
    
    // Calculate sleep times
    const sleepStartTime = new Date(now);
    sleepStartTime.setHours(patterns.typicalBedtime, 0, 0, 0);
    
    const sleepEndTime = new Date(now);
    sleepEndTime.setHours(patterns.typicalWakeTime, 0, 0, 0);
    
    // If sleep start is today but we haven't reached it yet, it's tomorrow
    if (sleepStartTime <= now) {
      sleepStartTime.setDate(sleepStartTime.getDate() + 1);
    }
    
    // If sleep end is today but we've passed it, it's tomorrow
    if (sleepEndTime <= now) {
      sleepEndTime.setDate(sleepEndTime.getDate() + 1);
    }
    
    // Calculate hours until wake
    let hoursUntilWake = 0;
    if (isSleeping) {
      hoursUntilWake = (sleepEndTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    }
    
    return {
      isSleeping,
      sleepQuality: patterns.sleepQuality,
      hoursUntilWake: Math.max(0, hoursUntilWake),
      sleepStartTime,
      sleepEndTime,
    };
  } catch (error) {
    console.error('Error getting sleep status:', error);
    return {
      isSleeping: false,
      sleepQuality: 3,
      hoursUntilWake: 0,
      sleepStartTime: new Date(),
      sleepEndTime: new Date(),
    };
  }
}

/**
 * Simulate sleep quality based on patterns and randomness
 */
export function simulateSleepQuality(): number {
  // Base quality from patterns, with some realistic variation
  const baseQuality = 4; // Default to good sleep
  const variation = Math.random() * 2 - 1; // -1 to +1
  const quality = Math.max(1, Math.min(5, Math.round(baseQuality + variation)));
  
  return quality;
}

/**
 * Get sleep bonus/penalty based on quality
 */
export function getSleepBonus(quality: number): number {
  switch (quality) {
    case 5: return SLEEP_QUALITY_LEVELS.EXCELLENT.bonus;
    case 4: return SLEEP_QUALITY_LEVELS.GOOD.bonus;
    case 3: return SLEEP_QUALITY_LEVELS.FAIR.bonus;
    case 2: return SLEEP_QUALITY_LEVELS.POOR.penalty;
    case 1: return SLEEP_QUALITY_LEVELS.VERY_POOR.penalty;
    default: return 0;
  }
}

/**
 * Record a sleep session
 */
export async function recordSleepSession(
  startTime: Date,
  endTime: Date,
  energyBefore: number,
  energyAfter: number
): Promise<void> {
  try {
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const quality = simulateSleepQuality();
    
    const session: SleepSession = {
      startTime,
      endTime,
      duration,
      quality,
      energyBefore,
      energyAfter,
    };
    
    // Store sleep session
    const stored = await AsyncStorage.getItem(SLEEP_STORAGE_KEYS.SLEEP_HISTORY);
    const history: SleepSession[] = stored ? JSON.parse(stored) : [];
    
    // Convert dates back to Date objects
    const parsedHistory = history.map(h => ({
      ...h,
      startTime: new Date(h.startTime),
      endTime: new Date(h.endTime),
      lastUpdated: new Date(h.lastUpdated),
    }));
    
    parsedHistory.push(session);
    
    // Keep only last 30 sessions
    if (parsedHistory.length > 30) {
      parsedHistory.splice(0, parsedHistory.length - 30);
    }
    
    await AsyncStorage.setItem(SLEEP_STORAGE_KEYS.SLEEP_HISTORY, JSON.stringify(parsedHistory));
    
    // Update patterns based on this session
    await updateSleepPatterns({
      averageSleepDuration: duration,
      sleepQuality: quality,
    });
    
    console.log('😴 Sleep session recorded:', {
      duration: `${duration.toFixed(1)}h`,
      quality: `${quality}/5`,
      energyChange: energyAfter - energyBefore,
    });
  } catch (error) {
    console.error('Error recording sleep session:', error);
  }
}

/**
 * Get sleep history
 */
export async function getSleepHistory(): Promise<SleepSession[]> {
  try {
    const stored = await AsyncStorage.getItem(SLEEP_STORAGE_KEYS.SLEEP_HISTORY);
    if (!stored) return [];
    
    const history: SleepSession[] = JSON.parse(stored);
    return history.map(h => ({
      ...h,
      startTime: new Date(h.startTime),
      endTime: new Date(h.endTime),
    }));
  } catch (error) {
    console.error('Error getting sleep history:', error);
    return [];
  }
}

/**
 * Initialize mock sleep system
 */
export async function initializeMockSleepSystem(): Promise<void> {
  try {
    await getSleepPatterns(); // This creates default patterns if none exist
    console.log('🌙 Mock sleep system initialized with night owl defaults');
  } catch (error) {
    console.error('Error initializing mock sleep system:', error);
  }
}

