import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';
import { AppleHealthData, convertAppleHealthToEPCAdjustments, generateMockAppleHealthData } from './mockAppleHealthData';

type Callback<T> = (error: string, result: T) => void;

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

const permissions = {
  permissions: {
    read: [
      // Activity
      (AppleHealthKit as any).Constants.Permissions.StepCount,
      (AppleHealthKit as any).Constants.Permissions.AppleExerciseTime,
      (AppleHealthKit as any).Constants.Permissions.ActiveEnergyBurned,
      // Sleep
      (AppleHealthKit as any).Constants.Permissions.SleepAnalysis,
      // Heart
      (AppleHealthKit as any).Constants.Permissions.HeartRate,
      (AppleHealthKit as any).Constants.Permissions.RestingHeartRate,
      (AppleHealthKit as any).Constants.Permissions.HeartRateVariabilitySDNN,
      // Mindfulness
      (AppleHealthKit as any).Constants.Permissions.MindfulSession,
    ],
    write: [],
  },
};

export async function initHealthKit(): Promise<boolean> {
  // Guard: iOS only and native module must be present (not available in Expo Go)
  if (Platform.OS !== 'ios') {
    return false;
  }

  const hasInit = typeof (AppleHealthKit as any)?.initHealthKit === 'function';
  if (!hasInit) {
    console.warn('HealthKit native module unavailable; using mock (Expo Go or missing dev client)');
    return false;
  }

  return new Promise((resolve) => {
    (AppleHealthKit as any).initHealthKit(permissions, (error: string) => {
      if (error) {
        console.warn('HealthKit init error:', error);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
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

    const endDate = new Date().toISOString();
    const startToday = startOfTodayISO();
    const sleepWindowStart = startOfYesterdayEveningISO();

    // Steps today
    const stepsToday: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getStepCount) return resolve(0);
      (AppleHealthKit as any).getStepCount(
        { startDate: startToday, endDate },
        (_e: string, r: { value: number }) => resolve(r?.value || 0)
      );
    });

    // Exercise minutes (Apple Exercise Time)
    const exerciseMinutes: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getAppleExerciseTime) return resolve(0);
      (AppleHealthKit as any).getAppleExerciseTime(
        { startDate: startToday, endDate },
        (_e: string, r: { value: number }) => resolve(r?.value || 0)
      );
    }).catch(() => 0);

    // Active energy (Move calories)
    const activeEnergy: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getActiveEnergyBurned) return resolve(0);
      (AppleHealthKit as any).getActiveEnergyBurned(
        { startDate: startToday, endDate },
        (_e: string, r: { value: number }) => resolve(r?.value || 0)
      );
    }).catch(() => 0);

    // Sleep samples (sum main session hours)
    const sleepHours: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getSleepSamples) return resolve(0);
      (AppleHealthKit as any).getSleepSamples(
        { startDate: sleepWindowStart, endDate },
        (_e: string, samples: Array<{ start: string; end: string; value: string }>) => {
          let totalMs = 0;
          samples?.forEach((s) => {
            if ((s.value || '').toLowerCase().includes('asleep')) {
              const st = new Date(s.start).getTime();
              const en = new Date(s.end).getTime();
              if (en > st) totalMs += en - st;
            }
          });
          resolve(Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10);
        }
      );
    }).catch(() => 0);

    // Resting HR samples (average today)
    const restingHR: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getRestingHeartRateSamples) return resolve(0);
      (AppleHealthKit as any).getRestingHeartRateSamples(
        { startDate: startToday, endDate },
        (_e: string, samples: Array<{ value: number }>) => {
          const values = (samples || []).map((s) => s.value).filter((v) => typeof v === 'number');
          if (values.length === 0) return resolve(0);
          resolve(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
        }
      );
    }).catch(() => 0);

    // HRV samples (average today)
    const hrv: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getHeartRateVariabilitySamples) return resolve(0);
      (AppleHealthKit as any).getHeartRateVariabilitySamples(
        { startDate: startToday, endDate },
        (_e: string, samples: Array<{ value: number }>) => {
          const values = (samples || []).map((s) => s.value).filter((v) => typeof v === 'number');
          if (values.length === 0) return resolve(0);
          resolve(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
        }
      );
    }).catch(() => 0);

    // Mindfulness minutes today (sum durations of MindfulSession)
    const mindfulnessMinutes: number = await new Promise((resolve) => {
      if (!(AppleHealthKit as any)?.getMindfulMinutes) return resolve(0);
      (AppleHealthKit as any).getMindfulMinutes(
        { startDate: startToday, endDate },
        (_e: string, r: { value: number }) => resolve(r?.value || 0)
      );
    }).catch(() => 0);

    // Assemble into AppleHealthData shape for existing converters/UI
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
        hoursSlept: sleepHours,
        sleepQuality: sleepHours >= 8 ? 'Excellent' : sleepHours >= 7 ? 'Good' : sleepHours >= 6 ? 'Fair' : 'Poor',
        bedtime: '',
        wakeTime: '',
        sleepStages: { deep: 0, core: 0, rem: 0, awake: 0 },
      },
      heartRate: {
        resting: restingHR,
        current: 0,
        max: 0,
        hrv: hrv,
        trend: 'stable',
      },
      mindfulness: {
        minutesToday: mindfulnessMinutes,
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


