import { Platform } from 'react-native';
import { AppleHealthData, convertAppleHealthToEPCAdjustments } from './mockAppleHealthData';

type HealthKitBridgeStatus = 'unknown' | 'healthy' | 'unavailable';

let bridgeStatus: HealthKitBridgeStatus = 'unknown';
const BRIDGE_UNAVAILABLE_MSG =
  "HealthKit data read failed: HealthKit native bridge is unavailable (std::runtime_error). This usually means the app was built without Expo's new architecture/Nitro modules. Rebuild the dev client with EXPO_USE_NEW_ARCH=1 and run a fresh pod install before launching on device.";

// Graceful HealthKit import - works in Expo Go (mock) and dev builds (real)
let HealthKit: any = null;

try {
  if (Platform.OS === 'ios') {
    const healthKitModule = require('@kingstinct/react-native-healthkit');
    HealthKit = healthKitModule.default;
  }
} catch (e) {
  console.log('HealthKit not available (Expo Go or missing native module), using mock data');
}

function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfYesterdayEveningISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(18, 0, 0, 0); // 6pm yesterday as a heuristic to capture main sleep
  return d.toISOString();
}

function getHealthKitReadIdentifiers(): string[] {
  return [
    'HKQuantityTypeIdentifierStepCount',
    'HKQuantityTypeIdentifierAppleExerciseTime',
    'HKQuantityTypeIdentifierActiveEnergyBurned',
    'HKCategoryTypeIdentifierSleepAnalysis',
    'HKQuantityTypeIdentifierHeartRate',
    'HKQuantityTypeIdentifierRestingHeartRate',
    'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    'HKCategoryTypeIdentifierMindfulSession',
  ];
}

export async function initHealthKit(): Promise<boolean> {
  // Guard: iOS only and native module must be present (not available in Expo Go)
  if (bridgeStatus === 'unavailable') {
    return false;
  }

  if (Platform.OS !== 'ios' || !HealthKit) {
    bridgeStatus = 'unavailable';
    return false;
  }

  try {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    if (!isAvailable) {
      console.warn('HealthKit not available on this device');
      bridgeStatus = 'unavailable';
      return false;
    }

    const toRead = getHealthKitReadIdentifiers();
    await HealthKit.requestAuthorization([], toRead);
    bridgeStatus = 'healthy';
    return true;
  } catch (error) {
    console.warn('HealthKit init error:', error);
    if ((error as Error)?.message?.includes('std::runtime_error')) {
      bridgeStatus = 'unavailable';
    }
    return false;
  }
}

export async function getAppleHealthDataOrMock(): Promise<AppleHealthData> {
  // Only use real HealthKit data - no mock data fallback
  if (Platform.OS !== 'ios') {
    throw new Error('HealthKit is only available on iOS devices');
  }

  if (!HealthKit) {
    throw new Error('HealthKit module not available - requires native iOS build');
  }

  if (bridgeStatus === 'unavailable') {
    throw new Error(BRIDGE_UNAVAILABLE_MSG);
  }

  const ok = await initHealthKit();
  if (!ok) {
    throw new Error('HealthKit authorization failed - please grant permissions in Settings');
  }

  try {
    const endDate = new Date();
    const startToday = startOfTodayLocal();

    // Prefer statistics cumulative sum for steps to match Fitness app totals
    const stepStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierStepCount',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'count' }
    );
    const stepsToday = Math.round(stepStats?.sumQuantity?.quantity ?? 0);

    // Exercise minutes (Apple Exercise Time)
    const exerciseStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierAppleExerciseTime',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'min' }
    );
    const exerciseMinutes: number = Math.round(exerciseStats?.sumQuantity?.quantity ?? 0);

    // Active energy (Move calories)
    const energyStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'kcal' }
    );
    const activeEnergy: number = Math.round(energyStats?.sumQuantity?.quantity ?? 0);

    // Most recent Resting Heart Rate (bpm) and HRV (ms)
    const rhrStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierRestingHeartRate',
      ['mostRecent'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'count/min' }
    );
    const hrvStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      ['mostRecent'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'ms' }
    );
    const restingHR = Math.round(rhrStats?.mostRecentQuantity?.quantity ?? 0);
    const hrvMs = Math.round(hrvStats?.mostRecentQuantity?.quantity ?? 0);

    // For now, use simplified data structure - we can enhance later
    const health: AppleHealthData = {
      steps: {
        count: stepsToday,
        goal: 10000,
        percentage: Math.round((stepsToday / 10000) * 100),
        trend: 'stable',
      },
      activityRings: {
        move: {
          current: Math.round(activeEnergy),
          goal: 630,
          percentage: Math.round((activeEnergy / 630) * 100),
        },
        exercise: {
          current: Math.round(exerciseMinutes),
          goal: 30,
          percentage: Math.round((exerciseMinutes / 30) * 100),
        },
        stand: {
          current: 0,
          goal: 12,
          percentage: 0,
        },
      },
      sleep: {
        hoursSlept: 0, // n/a until implemented via category samples
        sleepQuality: 'Poor', // use valid enum, display can show N/A if 0h
        bedtime: '',
        wakeTime: '',
        sleepStages: { deep: 0, core: 0, rem: 0, awake: 0 },
      },
      heartRate: {
        resting: restingHR,
        current: 0,
        max: 0,
        hrv: hrvMs,
        trend: 'stable',
      },
      mindfulness: {
        minutesToday: 0, // Placeholder - will implement mindfulness queries later
        sessionsCompleted: 0,
        weeklyGoal: 70,
        currentStreak: 0,
      },
      mood: {
        currentMood: 'Neutral',
        stressLevel: 5,
        anxietyLevel: 5,
        energyLevel: 5,
      },
      workouts: {
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        favoriteWorkoutType: 'Walking',
        avgWorkoutDuration: 0,
      },
      environmental: {
        noiseLevel: 0,
        airQuality: 'Good',
        uvIndex: 0,
      },
      lastUpdated: new Date(),
    };

    return health;
  } catch (e) {
    const message = (e as Error)?.message ?? 'Unknown error';

    if (message.includes('std::runtime_error')) {
      bridgeStatus = 'unavailable';
      throw new Error(BRIDGE_UNAVAILABLE_MSG);
    }

    throw new Error(`HealthKit data read failed: ${message}`);
  }
}

// Strict variant: never returns mock data. Throws if HealthKit isn't available or authorized.
export async function getAppleHealthDataRealOnly(): Promise<AppleHealthData> {
  if (Platform.OS !== 'ios' || !HealthKit) {
    throw new Error('HealthKit not available: iOS device and dev/prod build required');
  }

  const ok = await initHealthKit();
  if (!ok) {
    throw new Error('HealthKit authorization failed or unavailable');
  }

  try {
    const endDate = new Date();
    const startToday = startOfTodayLocal();

    // Prefer statistics cumulative sum for steps to match Fitness app totals
    const stepStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierStepCount',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'count' }
    );
    const stepsToday = Math.round(stepStats?.sumQuantity?.quantity ?? 0);

    const exerciseStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierAppleExerciseTime',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'min' }
    );
    const exerciseMinutes: number = Math.round(exerciseStats?.sumQuantity?.quantity ?? 0);

    const energyStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      ['cumulativeSum'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'kcal' }
    );
    const activeEnergy: number = Math.round(energyStats?.sumQuantity?.quantity ?? 0);

    // Most recent Resting Heart Rate (bpm) and HRV (ms)
    const rhrStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierRestingHeartRate',
      ['mostRecent'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'count/min' }
    );
    const hrvStats = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      ['mostRecent'],
      { filter: { startDate: startToday, endDate: endDate }, unit: 'ms' }
    );
    const restingHR = Math.round(rhrStats?.mostRecentQuantity?.quantity ?? 0);
    const hrvMs = Math.round(hrvStats?.mostRecentQuantity?.quantity ?? 0);

    const health: AppleHealthData = {
      steps: {
        count: stepsToday,
        goal: 10000,
        percentage: Math.round((stepsToday / 10000) * 100),
        trend: 'stable',
      },
      activityRings: {
        move: {
          current: Math.round(activeEnergy),
          goal: 630,
          percentage: Math.round((activeEnergy / 630) * 100),
        },
        exercise: {
          current: Math.round(exerciseMinutes),
          goal: 30,
          percentage: Math.round((exerciseMinutes / 30) * 100),
        },
        stand: {
          current: 0,
          goal: 12,
          percentage: 0,
        },
      },
      sleep: {
        hoursSlept: 0,
        sleepQuality: 'Poor',
        bedtime: '',
        wakeTime: '',
        sleepStages: { deep: 0, core: 0, rem: 0, awake: 0 },
      },
      heartRate: {
        resting: restingHR,
        current: 0,
        max: 0,
        hrv: hrvMs,
        trend: 'stable',
      },
      mindfulness: {
        minutesToday: 0,
        sessionsCompleted: 0,
        weeklyGoal: 70,
        currentStreak: 0,
      },
      mood: {
        currentMood: 'Neutral',
        stressLevel: 5,
        anxietyLevel: 5,
        energyLevel: 5,
      },
      workouts: {
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        favoriteWorkoutType: 'Walking',
        avgWorkoutDuration: 0,
      },
      environmental: {
        noiseLevel: 0,
        airQuality: 'Good',
        uvIndex: 0,
      },
      lastUpdated: new Date(),
    };

    return health;
  } catch (e) {
    if (e instanceof Error && e.message.includes('std::runtime_error')) {
      bridgeStatus = 'unavailable';
      throw new Error(BRIDGE_UNAVAILABLE_MSG);
    }
    throw e instanceof Error ? e : new Error('HealthKit read failed');
  }
}

/**
 * Subscribe to HealthKit quantity changes for near-realtime updates while app is active.
 * Returns an unsubscribe function to stop observing.
 */
export async function subscribeToRealtimeHealthChanges(onChange: () => void): Promise<() => void> {
  if (Platform.OS !== 'ios' || !HealthKit) {
    throw new Error('HealthKit not available for subscriptions');
  }

  const ok = await initHealthKit();
  if (!ok) {
    throw new Error('HealthKit authorization failed');
  }

  const identifiers: string[] = [
    'HKQuantityTypeIdentifierStepCount',
    'HKQuantityTypeIdentifierAppleExerciseTime',
    'HKQuantityTypeIdentifierActiveEnergyBurned',
  ];

  const queryIds: string[] = [];
  for (const id of identifiers) {
    try {
      const qid = await HealthKit.subscribeToChanges(id, () => {
        try { onChange(); } catch (_) {}
      });
      if (qid) queryIds.push(qid);
    } catch (_) {
      // ignore per-identifier subscription failures
    }
  }

  return () => {
    try {
      if (queryIds.length > 0 && HealthKit.unsubscribeQueries) {
        HealthKit.unsubscribeQueries(queryIds);
      }
    } catch (_) {}
  };
}

// Helper in case other modules want EPC adjustments directly from HealthKit
export async function getEPCAdjustmentsFromHealth(): Promise<{
  energyAdjustment: number;
  purposeAdjustment: number;
  connectionAdjustment: number;
}> {
  const health = await getAppleHealthDataOrMock();
  return convertAppleHealthToEPCAdjustments(health);
}

export function getHealthKitBridgeStatus(): HealthKitBridgeStatus {
  return bridgeStatus;
}
