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
    // console.log('✅ HealthKit module loaded successfully');
  }
} catch (e) {
  // console.log('❌ HealthKit not available (Expo Go or missing native module), using mock data');
  // console.log('HealthKit import error:', (e as Error).message);
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

function startOfDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
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
  // Reset bridge status if it was previously unavailable - try again
  if (bridgeStatus === 'unavailable') {
    bridgeStatus = 'unknown';
  }

  if (Platform.OS !== 'ios' || !HealthKit) {
    bridgeStatus = 'unavailable';
    return false;
  }

  try {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    if (!isAvailable) {
      bridgeStatus = 'unavailable';
      return false;
    }

    const toRead = getHealthKitReadIdentifiers();
    await HealthKit.requestAuthorization([], toRead);
    
    // Check if permissions were actually granted
    const authDebug = await getHealthAuthorizationDebug();
    
    const hasDeniedPermissions = authDebug.statuses.some(status => status.status === 'sharingDenied');
    
    if (hasDeniedPermissions) {
      bridgeStatus = 'unavailable';
      return false;
    }
    
    bridgeStatus = 'healthy';
    return true;
  } catch (error) {
    console.error('HealthKit init error:', error);
    console.error('Error details:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      name: (error as Error)?.name
    });
    
    if ((error as Error)?.message?.includes('std::runtime_error')) {
      bridgeStatus = 'unavailable';
    }
    return false;
  }
}

export async function getAppleHealthDataOrMock(): Promise<AppleHealthData | null> {
  // Return null if HealthKit is not available instead of throwing errors
  if (Platform.OS !== 'ios') {
    return null;
  }

  if (!HealthKit) {
    return null;
  }

  if (bridgeStatus === 'unavailable') {
    return null;
  }

  const ok = await initHealthKit();
  if (!ok) {
    return null;
  }

  try {
    const endDate = new Date();
    const startToday = startOfTodayLocal();

    let stepsToday = 0;
    let exerciseMinutes = 0;
    let activeEnergy = 0;
    let restingHR = 0;
    let hrvMs = 0;
    let sleepHours = 0;
    let sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent' = 'Poor';
    let bedtime = '';
    let wakeTime = '';
    let sleepStages = { deep: 0, core: 0, rem: 0, awake: 0 };

    stepsToday = await getTodayStepCountAccurate(startToday, endDate);

    try {
      const exerciseStats = await HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierAppleExerciseTime',
        ['cumulativeSum'],
        { filter: { startDate: startToday, endDate }, unit: 'min' }
      );
      exerciseMinutes = Math.round(exerciseStats?.sumQuantity?.quantity ?? 0);
    } catch (_) {
      const samples = await HealthKit.queryQuantitySamples(
        'HKQuantityTypeIdentifierAppleExerciseTime',
        { filter: { startDate: startToday, endDate }, unit: 'min', limit: 500, ascending: true }
      );
      exerciseMinutes = Math.round((samples || []).reduce((s: number, x: any) => s + (x?.quantity ?? 0), 0));
    }

    try {
      const energyStats = await HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        ['cumulativeSum'],
        { filter: { startDate: startToday, endDate }, unit: 'kcal' }
      );
      activeEnergy = Math.round(energyStats?.sumQuantity?.quantity ?? 0);
    } catch (_) {
      const samples = await HealthKit.queryQuantitySamples(
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        { filter: { startDate: startToday, endDate }, unit: 'kcal', limit: 1000, ascending: true }
      );
      activeEnergy = Math.round((samples || []).reduce((s: number, x: any) => s + (x?.quantity ?? 0), 0));
    }

    try {
      const rhrStats = await HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierRestingHeartRate',
        ['mostRecent'],
        { filter: { startDate: startToday, endDate }, unit: 'count/min' }
      );
      restingHR = Math.round(rhrStats?.mostRecentQuantity?.quantity ?? 0);
    } catch (_) {
      const samples = await HealthKit.queryQuantitySamples(
        'HKQuantityTypeIdentifierRestingHeartRate',
        { filter: { startDate: startToday, endDate }, unit: 'count/min', limit: 1, ascending: false }
      );
      restingHR = Math.round(samples?.[0]?.quantity ?? 0);
    }

    // If no resting HR today, look back up to 7 days and take most recent
    if (!restingHR) {
      try {
        const fallbackStart = startOfDaysAgo(7);
        const samples = await HealthKit.queryQuantitySamples(
          'HKQuantityTypeIdentifierRestingHeartRate',
          { filter: { startDate: fallbackStart, endDate }, unit: 'count/min', limit: 1, ascending: false }
        );
        restingHR = Math.round(samples?.[0]?.quantity ?? 0);
      } catch {}
    }

    try {
      const hrvStats = await HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
        ['mostRecent'],
        { filter: { startDate: startToday, endDate }, unit: 'ms' }
      );
      hrvMs = Math.round(hrvStats?.mostRecentQuantity?.quantity ?? 0);
    } catch (_) {
      const samples = await HealthKit.queryQuantitySamples(
        'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
        { filter: { startDate: startToday, endDate }, unit: 'ms', limit: 1, ascending: false }
      );
      hrvMs = Math.round(samples?.[0]?.quantity ?? 0);
    }

    // If no HRV today, look back up to 7 days and take most recent
    if (!hrvMs) {
      try {
        const fallbackStart = startOfDaysAgo(7);
        const samples = await HealthKit.queryQuantitySamples(
          'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
          { filter: { startDate: fallbackStart, endDate }, unit: 'ms', limit: 1, ascending: false }
        );
        hrvMs = Math.round(samples?.[0]?.quantity ?? 0);
      } catch {}
    }

    // Sleep: aggregate last night's sleep using category samples
    try {
      const sleepSamples = await HealthKit.queryCategorySamples(
        'HKCategoryTypeIdentifierSleepAnalysis',
        {
          filter: { startDate: new Date(startOfYesterdayEveningISO()), endDate },
          limit: 1000,
          ascending: true,
        }
      );

      let totalMs = 0;
      let deepMs = 0;
      let coreMs = 0;
      let remMs = 0;
      let awakeMs = 0;

      const ASLEEP_VALUES = new Set([1, 3, 4, 5]); // unspecified, core, deep, rem
      let firstAsleepStart: Date | null = null;
      let lastAsleepEnd: Date | null = null;

      for (const s of sleepSamples || []) {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        const ms = Math.max(0, end.getTime() - start.getTime());
        const val = Number(s.value);

        if (ASLEEP_VALUES.has(val)) {
          totalMs += ms;
          if (!firstAsleepStart) firstAsleepStart = start;
          lastAsleepEnd = end;
          if (val === 4) deepMs += ms; // deep
          else if (val === 3) coreMs += ms; // core
          else if (val === 5) remMs += ms; // rem
        } else if (val === 2 /* awake */) {
          awakeMs += ms;
        }
      }

      sleepHours = Math.round((totalMs / 36e5) * 10) / 10; // hours with 0.1 precision
      sleepStages = {
        deep: Math.round((deepMs / 36e5) * 10) / 10,
        core: Math.round((coreMs / 36e5) * 10) / 10,
        rem: Math.round((remMs / 36e5) * 10) / 10,
        awake: Math.round((awakeMs / 36e5) * 10) / 10,
      };
      bedtime = firstAsleepStart ? firstAsleepStart.toLocaleTimeString() : '';
      wakeTime = lastAsleepEnd ? lastAsleepEnd.toLocaleTimeString() : '';

      if (sleepHours >= 8) sleepQuality = 'Excellent';
      else if (sleepHours >= 7) sleepQuality = 'Good';
      else if (sleepHours >= 6) sleepQuality = 'Fair';
      else sleepQuality = 'Poor';
    } catch (_) {
      // Leave sleep at defaults if query fails or no permission
    }

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
          percentage: Math.max(0, Math.min(300, Math.round((activeEnergy / 630) * 100))),
        },
        exercise: {
          current: Math.round(exerciseMinutes),
          goal: 30,
          percentage: Math.max(0, Math.min(300, Math.round((exerciseMinutes / 30) * 100))),
        },
        stand: {
          current: 0,
          goal: 12,
          percentage: 0,
        },
      },
      sleep: {
        hoursSlept: sleepHours,
        sleepQuality,
        bedtime,
        wakeTime,
        sleepStages,
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
      source: 'real' as const,
      permissionsGranted: true,
    };

    return health;
  } catch (e) {
    const message = (e as Error)?.message ?? 'Unknown error';

    // Re-throw the original native error message for accurate diagnosis instead of
    // mapping all std::runtime_error cases to a bridge problem.
    if (message.includes('Native module cannot be null') || message.includes('TurboModule')) {
      bridgeStatus = 'unavailable';
      throw new Error(BRIDGE_UNAVAILABLE_MSG);
    }

    throw new Error(`HealthKit data read failed: ${message}`);
  }
}

// Returns availability + per-type authorization for the identifiers we read
export async function getHealthAuthorizationDebug(): Promise<{
  isAvailable: boolean;
  bridge: HealthKitBridgeStatus;
  statuses: Array<{ type: string; status: 'notDetermined' | 'sharingDenied' | 'sharingAuthorized' | 'error' }>;
}> {
  const result = {
    isAvailable: false,
    bridge: bridgeStatus,
    statuses: [] as Array<{ type: string; status: 'notDetermined' | 'sharingDenied' | 'sharingAuthorized' | 'error' }>,
  };

  if (Platform.OS !== 'ios' || !HealthKit) {
    return result;
  }

  try {
    result.isAvailable = !!(await HealthKit.isHealthDataAvailable());
  } catch {
    result.isAvailable = false;
  }

  try {
    const types = getHealthKitReadIdentifiers();
    for (const t of types) {
      try {
        const statusNum = await HealthKit.authorizationStatusFor(t);
        const status = statusNum === 2 ? 'sharingAuthorized' : statusNum === 1 ? 'sharingDenied' : 'notDetermined';
        result.statuses.push({ type: t, status });
      } catch {
        result.statuses.push({ type: t, status: 'error' });
      }
    }
  } catch {
    // ignore
  }

  return result;
}

// Attempts lightweight reads to demonstrate read access. Apple does not expose
// read-authorization status, so proving reads with small queries is the most
// reliable validation.
export async function getHealthReadProbe(): Promise<{
  stepsToday: number;
  activeEnergyKcalToday: number;
  exerciseMinToday: number;
  sleepLastNightHours: number;
  restingHRMostRecent?: { value: number; date: string };
  hrvMostRecentMs?: { value: number; date: string };
}> {
  if (Platform.OS !== 'ios' || !HealthKit) {
    throw new Error('HealthKit not available: iOS device and dev/prod build required');
  }

  const ok = await initHealthKit();
  if (!ok) throw new Error('HealthKit authorization failed');

  const endDate = new Date();
  const startToday = startOfTodayLocal();

  // Steps / energy / exercise
  let stepsToday = 0;
  try { stepsToday = await getTodayStepCountAccurate(startToday, endDate); } catch {}

  let activeEnergyKcalToday = 0;
  try {
    const s = await HealthKit.queryStatisticsForQuantity('HKQuantityTypeIdentifierActiveEnergyBurned', ['cumulativeSum'], { filter: { startDate: startToday, endDate }, unit: 'kcal' });
    activeEnergyKcalToday = Math.round(s?.sumQuantity?.quantity ?? 0);
  } catch {}

  let exerciseMinToday = 0;
  try {
    const s = await HealthKit.queryStatisticsForQuantity('HKQuantityTypeIdentifierAppleExerciseTime', ['cumulativeSum'], { filter: { startDate: startToday, endDate }, unit: 'min' });
    exerciseMinToday = Math.round(s?.sumQuantity?.quantity ?? 0);
  } catch {}

  // Sleep
  let sleepLastNightHours = 0;
  try {
    const samples = await HealthKit.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', { filter: { startDate: new Date(startOfYesterdayEveningISO()), endDate }, ascending: true, limit: 500 });
    const ASLEEP = new Set([1,3,4,5]);
    let ms = 0;
    for (const s of samples || []) {
      const v = Number(s.value);
      if (ASLEEP.has(v)) {
        ms += Math.max(0, new Date(s.endDate).getTime() - new Date(s.startDate).getTime());
      }
    }
    sleepLastNightHours = Math.round((ms/36e5)*10)/10;
  } catch {}

  // Most recent Resting HR and HRV
  let restingHRMostRecent: { value: number; date: string } | undefined;
  let hrvMostRecentMs: { value: number; date: string } | undefined;
  try {
    const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', { filter: { startDate: startOfDaysAgo(14), endDate }, unit: 'count/min', limit: 1, ascending: false });
    if (samples && samples[0]) {
      restingHRMostRecent = { value: Math.round(samples[0].quantity || 0), date: new Date(samples[0].endDate).toLocaleString() };
    }
  } catch {}
  try {
    const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', { filter: { startDate: startOfDaysAgo(14), endDate }, unit: 'ms', limit: 1, ascending: false });
    if (samples && samples[0]) {
      hrvMostRecentMs = { value: Math.round(samples[0].quantity || 0), date: new Date(samples[0].endDate).toLocaleString() };
    }
  } catch {}

  return { stepsToday, activeEnergyKcalToday, exerciseMinToday, sleepLastNightHours, restingHRMostRecent, hrvMostRecentMs };
}

// Debug helper: precise breakdown of today's step count and data source
export async function getTodayStepsDebug(): Promise<{
  total: number;
  method: 'statistics' | 'samples';
  start: Date;
  end: Date;
  perSource: Array<{ source?: string; device?: string; count: number }>;
  samplesPreview: Array<{ source?: string; device?: string; quantity: number; start: string; end: string }>;
}> {
  if (Platform.OS !== 'ios' || !HealthKit) {
    throw new Error('HealthKit not available: iOS device + dev/prod build required');
  }

  if (bridgeStatus === 'unavailable') {
    throw new Error(BRIDGE_UNAVAILABLE_MSG);
  }

  const ok = await initHealthKit();
  if (!ok) {
    throw new Error('HealthKit authorization failed - please grant permissions in Settings');
  }

  const endDate = new Date();
  const startToday = startOfTodayLocal();

  // 1) Try reliable statistics total first (strict day bucket)
  try {
    // Prefer day-bucketed statistics collection and surface the actual bucket window
    let statStart = startToday;
    let statEnd = endDate;
    try {
      const buckets = await HealthKit.queryStatisticsCollectionForQuantity(
        'HKQuantityTypeIdentifierStepCount',
        ['cumulativeSum'],
        startToday.toISOString(),
        { day: 1 },
        { filter: { startDate: startToday, endDate: endDate, strictStartDate: true, strictEndDate: true }, unit: 'count' }
      );
      const bucket = (buckets || []).pop();
      if (bucket?.startDate) statStart = new Date(bucket.startDate);
      if (bucket?.endDate) statEnd = new Date(bucket.endDate);
    } catch {}

    const total = await getTodayStepCountAccurate(startToday, endDate);

    // Also fetch samples to show per-source breakdown for transparency
    const samples = await HealthKit.queryQuantitySamples(
      'HKQuantityTypeIdentifierStepCount',
      { filter: { startDate: statStart, endDate: statEnd, strictStartDate: true, strictEndDate: true }, unit: 'count', limit: 1000, ascending: true }
    );

    const perSourceMap = new Map<string, { source?: string; device?: string; count: number }>();
    for (const s of samples || []) {
      const key = `${s.sourceRevision?.source?.name || 'Unknown'}|${s.device?.name || ''}`;
      const prev = perSourceMap.get(key) || { source: s.sourceRevision?.source?.name, device: s.device?.name, count: 0 };
      prev.count += Math.round(s.quantity || 0);
      perSourceMap.set(key, prev);
    }

    const preview = (samples || [])
      .slice(-5)
      .reverse()
      .map((s: any) => ({
        source: s.sourceRevision?.source?.name,
        device: s.device?.name,
        quantity: Math.round(s.quantity || 0),
        start: new Date(s.startDate).toLocaleString(),
        end: new Date(s.endDate).toLocaleString(),
      }));

    return {
      total,
      method: 'statistics',
      start: statStart,
      end: statEnd,
      perSource: Array.from(perSourceMap.values()),
      samplesPreview: preview,
    };
  } catch (_e) {
    // 2) Fallback to sample summation (may double-count across devices)
    const samples = await HealthKit.queryQuantitySamples(
      'HKQuantityTypeIdentifierStepCount',
      { filter: { startDate: startToday, endDate, strictStartDate: true, strictEndDate: true }, unit: 'count', limit: 2000, ascending: true }
    );
    let total = 0;
    const perSourceMap = new Map<string, { source?: string; device?: string; count: number }>();
    for (const s of samples || []) {
      const n = Math.round(s.quantity || 0);
      total += n;
      const key = `${s.sourceRevision?.source?.name || 'Unknown'}|${s.device?.name || ''}`;
      const prev = perSourceMap.get(key) || { source: s.sourceRevision?.source?.name, device: s.device?.name, count: 0 };
      prev.count += n;
      perSourceMap.set(key, prev);
    }

    const preview = (samples || [])
      .slice(-5)
      .reverse()
      .map((s: any) => ({
        source: s.sourceRevision?.source?.name,
        device: s.device?.name,
        quantity: Math.round(s.quantity || 0),
        start: new Date(s.startDate).toLocaleString(),
        end: new Date(s.endDate).toLocaleString(),
      }));

    return {
      total,
      method: 'samples',
      start: startToday,
      end: endDate,
      perSource: Array.from(perSourceMap.values()),
      samplesPreview: preview,
    };
  }
}

// Uses StatisticsCollection (1-day bucket) with strict start/end to match Health app
async function getTodayStepCountAccurate(start: Date, end: Date): Promise<number> {
  try {
    const responses = await HealthKit.queryStatisticsCollectionForQuantity(
      'HKQuantityTypeIdentifierStepCount',
      ['cumulativeSum'],
      start.toISOString(),
      { day: 1 },
      { filter: { startDate: start, endDate: end, strictStartDate: true, strictEndDate: true }, unit: 'count' }
    );
    // Expect one bucket for today; if multiple, take the last
    const bucket = (responses || []).pop();
    if (bucket?.sumQuantity?.quantity != null) {
      return Math.round(bucket.sumQuantity.quantity);
    }
  } catch {}

  // Fallback to simple statistics with strict flags
  try {
    const stat = await HealthKit.queryStatisticsForQuantity(
      'HKQuantityTypeIdentifierStepCount',
      ['cumulativeSum'],
      { filter: { startDate: start, endDate: end, strictStartDate: true, strictEndDate: true }, unit: 'count' }
    );
    return Math.round(stat?.sumQuantity?.quantity ?? 0);
  } catch {}

  // Final fallback: sum samples (may diverge slightly from Health app)
  const samples = await HealthKit.queryQuantitySamples(
    'HKQuantityTypeIdentifierStepCount',
    { filter: { startDate: start, endDate: end, strictStartDate: true, strictEndDate: true }, unit: 'count', limit: 2000, ascending: true }
  );
  return Math.round((samples || []).reduce((sum: number, s: any) => sum + (s?.quantity ?? 0), 0));
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
      source: 'real' as const,
      permissionsGranted: true,
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

/**
 * Force reset the HealthKit bridge status - useful for debugging
 */
export function resetHealthKitBridgeStatus(): void {
  console.log('🔄 Manually resetting HealthKit bridge status');
  bridgeStatus = 'unknown';
}

/**
 * Simple HealthKit status check for debugging
 */
export async function getHealthKitStatus(): Promise<{
  platform: string;
  healthKitModule: boolean;
  bridgeStatus: HealthKitBridgeStatus;
  isAvailable: boolean;
  error?: string;
}> {
  const result = {
    platform: Platform.OS,
    healthKitModule: !!HealthKit,
    bridgeStatus,
    isAvailable: false,
    error: undefined as string | undefined
  };

  try {
    if (Platform.OS === 'ios' && HealthKit) {
      result.isAvailable = await HealthKit.isHealthDataAvailable();
    }
  } catch (error) {
    result.error = (error as Error).message;
  }

  return result;
}

/**
 * Check if HealthKit permissions are properly granted and provide user guidance
 */
export async function checkHealthKitPermissions(): Promise<{
  hasPermissions: boolean;
  deniedTypes: string[];
  needsUserAction: boolean;
  guidanceMessage: string;
}> {
  if (Platform.OS !== 'ios' || !HealthKit) {
    return {
      hasPermissions: false,
      deniedTypes: [],
      needsUserAction: true,
      guidanceMessage: 'HealthKit is only available on iOS devices with a native build.'
    };
  }

  try {
    const authDebug = await getHealthAuthorizationDebug();
    const deniedTypes = authDebug.statuses
      .filter(status => status.status === 'sharingDenied')
      .map(status => status.type);
    
    const hasPermissions = deniedTypes.length === 0;
    
    let guidanceMessage = '';
    if (deniedTypes.length > 0) {
      guidanceMessage = `Health data access is currently denied. To enable it:\n\n1. Open Settings app\n2. Go to Health > Data Access & Devices\n3. Find your app and enable the data types you want to share\n\nDenied types: ${deniedTypes.join(', ')}`;
    } else {
      guidanceMessage = 'HealthKit permissions are properly configured.';
    }

    return {
      hasPermissions,
      deniedTypes,
      needsUserAction: deniedTypes.length > 0,
      guidanceMessage
    };
  } catch (error) {
    return {
      hasPermissions: false,
      deniedTypes: [],
      needsUserAction: true,
      guidanceMessage: `Error checking HealthKit permissions: ${(error as Error).message}`
    };
  }
}
