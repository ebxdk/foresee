import { Platform } from 'react-native';
import { AppleHealthData, convertAppleHealthToEPCAdjustments, generateMockAppleHealthData } from './mockAppleHealthData';

// Graceful HealthKit import - works in Expo Go (mock) and dev builds (real)
let HealthKit: any = null;
let HKQuantityTypeIdentifier: any = {};
let HKCategoryTypeIdentifier: any = {};

try {
  if (Platform.OS === 'ios') {
    const healthKitModule = require('@kingstinct/react-native-healthkit');
    HealthKit = healthKitModule.default;
    HKQuantityTypeIdentifier = healthKitModule.HKQuantityTypeIdentifier;
    HKCategoryTypeIdentifier = healthKitModule.HKCategoryTypeIdentifier;
  }
} catch (e) {
  console.log('HealthKit not available (Expo Go or missing native module), using mock data');
}

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfYesterdayEveningISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(18, 0, 0, 0); // 6pm yesterday as a heuristic to capture main sleep
  return d.toISOString();
}

const permissions = [
  HKQuantityTypeIdentifier.stepCount,
  HKQuantityTypeIdentifier.appleExerciseTime,
  HKQuantityTypeIdentifier.activeEnergyBurned,
  HKCategoryTypeIdentifier.sleepAnalysis,
  HKQuantityTypeIdentifier.heartRate,
  HKQuantityTypeIdentifier.restingHeartRate,
  HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
  HKCategoryTypeIdentifier.mindfulSession,
];

export async function initHealthKit(): Promise<boolean> {
  // Guard: iOS only and native module must be present (not available in Expo Go)
  if (Platform.OS !== 'ios' || !HealthKit) {
    return false;
  }

  try {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    if (!isAvailable) {
      console.warn('HealthKit not available on this device');
      return false;
    }

    await HealthKit.requestAuthorization(permissions, []);
    return true;
  } catch (error) {
    console.warn('HealthKit init error:', error);
    return false;
  }
}

export async function getAppleHealthDataOrMock(): Promise<AppleHealthData> {
  try {
    // HealthKit is iOS-only and requires a dev client with the native module installed
    if (Platform.OS !== 'ios') {
      return generateMockAppleHealthData();
    }

    const ok = await initHealthKit();
    if (!ok) {
      return generateMockAppleHealthData();
    }

    const endDate = new Date();
    const startToday = new Date(startOfTodayISO());

    // Steps today
    const stepsToday: number = await HealthKit.querySamplesWithAnchor(
      HKQuantityTypeIdentifier.stepCount,
      {
        from: startToday,
        to: endDate,
      }
    ).then(result => {
      const total = result.samples.reduce((sum, sample) => sum + sample.quantity, 0);
      return Math.round(total);
    }).catch(() => 0);

    // Exercise minutes (Apple Exercise Time)
    const exerciseMinutes: number = await HealthKit.querySamplesWithAnchor(
      HKQuantityTypeIdentifier.appleExerciseTime,
      {
        from: startToday,
        to: endDate,
      }
    ).then(result => {
      const total = result.samples.reduce((sum, sample) => sum + sample.quantity, 0);
      return Math.round(total);
    }).catch(() => 0);

    // Active energy (Move calories)  
    const activeEnergy: number = await HealthKit.querySamplesWithAnchor(
      HKQuantityTypeIdentifier.activeEnergyBurned,
      {
        from: startToday,
        to: endDate,
      }
    ).then(result => {
      const total = result.samples.reduce((sum, sample) => sum + sample.quantity, 0);
      return Math.round(total);
    }).catch(() => 0);

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
        hoursSlept: 7.5, // Placeholder - will implement sleep queries later
        sleepQuality: 'Good',
        bedtime: '',
        wakeTime: '',
        sleepStages: { deep: 0, core: 0, rem: 0, awake: 0 },
      },
      heartRate: {
        resting: 65, // Placeholder - will implement HR queries later
        current: 0,
        max: 0,
        hrv: 45,
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
    console.warn('HealthKit read failed, using mock:', e);
    return generateMockAppleHealthData();
  }
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