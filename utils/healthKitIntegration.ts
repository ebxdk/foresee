// HealthKit Integration Utility
// Fetches health data and applies adjustment rules to EPC scores

import { EPCScores } from './epcScoreCalc';
import { convertAppleHealthToEPCAdjustments, getMockAppleHealthData } from './mockAppleHealthData';
import { applySleepQualityAdjustment, storeDailyActivity } from './storage';

// Mock HealthKit data structure (replace with actual HealthKit integration)
export interface HealthData {
  sleep: {
    hoursSlept: number;
    sleepQuality: number; // 1-5 scale
  };
  activity: {
    steps: number;
    activeMinutes: number;
    caloriesBurned: number;
  };
  heartRate: {
    restingHR: number;
    hrv: number; // Heart Rate Variability
  };
  mood: {
    rating: number; // 1-5 scale (1=very bad, 5=excellent)
    timestamp: Date;
  };
  mindfulness: {
    minutesToday: number;
    sessionsCompleted: number;
  };
}

// Health adjustment rules for EPC scores
const HEALTH_ADJUSTMENTS = {
  sleep: {
    // Sleep hours impact on Energy
    excellent: { threshold: 8, energyBonus: 10 },
    good: { threshold: 7, energyBonus: 5 },
    poor: { threshold: 6, energyPenalty: -5 },
    terrible: { threshold: 5, energyPenalty: -10 },
    // Sleep quality impact
    qualityBonus: 2, // per point above 3
    qualityPenalty: -3, // per point below 3
  },
  activity: {
    // Steps impact on Energy
    highSteps: { threshold: 10000, energyBonus: 8 },
    goodSteps: { threshold: 7000, energyBonus: 5 },
    lowSteps: { threshold: 3000, energyPenalty: -3 },
    // Active minutes impact on Energy and Purpose
    activeMinutesBonus: 0.2, // per minute above 30
    activeMinutesPenalty: -0.1, // per minute below 30
  },
  heartRate: {
    // HRV impact on Energy (higher HRV = better recovery)
    hrvBonus: 0.5, // per point above baseline
    hrvPenalty: -0.3, // per point below baseline
    // Resting HR impact on Energy (lower is better)
    restingHRBonus: -0.2, // per BPM below 60
    restingHRPenalty: 0.1, // per BPM above 80
  },
  mood: {
    // Mood impact on Purpose and Connection
    excellent: { threshold: 5, purposeBonus: 8, connectionBonus: 5 },
    good: { threshold: 4, purposeBonus: 3, connectionBonus: 2 },
    poor: { threshold: 2, purposePenalty: -5, connectionPenalty: -3 },
    terrible: { threshold: 1, purposePenalty: -10, connectionPenalty: -8 },
  },
  mindfulness: {
    // Mindfulness impact on Purpose and Connection
    minutesBonus: 0.3, // per minute of mindfulness
    sessionsBonus: 2, // per session completed
    maxDailyBonus: 10, // cap the daily bonus
  },
};

/**
 * Generate realistic mock health data based on time patterns
 * Simulates actual Apple Health app data with realistic variations
 */
function generateRealisticHealthData(): HealthData {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  // Create a seed based on the current date for consistent daily values
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Sleep data - varies by day of week (weekends vs weekdays)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseSleepHours = isWeekend ? 8.2 : 7.1; // More sleep on weekends
  const sleepVariation = seededRandom(dateSeed) * 1.5 - 0.75; // ±45 minutes
  const hoursSlept = Math.max(5.5, Math.min(9.5, baseSleepHours + sleepVariation));
  
  // Sleep quality correlates with sleep duration
  let sleepQuality = 3;
  if (hoursSlept >= 8) sleepQuality = 4 + Math.floor(seededRandom(dateSeed + 1) * 2); // 4-5
  else if (hoursSlept >= 7) sleepQuality = 3 + Math.floor(seededRandom(dateSeed + 1) * 2); // 3-4
  else if (hoursSlept >= 6) sleepQuality = 2 + Math.floor(seededRandom(dateSeed + 1) * 2); // 2-3
  else sleepQuality = 1 + Math.floor(seededRandom(dateSeed + 1) * 2); // 1-2

  // Activity data - varies by day and current time
  const baseSteps = isWeekend ? 6500 : 8500; // Less steps on weekends
  const timeMultiplier = Math.min(1, hour / 20); // Steps accumulate throughout the day
  const stepsVariation = seededRandom(dateSeed + 2) * 4000 - 2000; // ±2000 steps
  const steps = Math.max(1000, Math.floor((baseSteps + stepsVariation) * timeMultiplier));
  
  // Active minutes correlate with steps
  const baseActiveMinutes = Math.floor(steps / 150); // Roughly 150 steps per active minute
  const activeMinutes = Math.max(10, Math.min(120, baseActiveMinutes + Math.floor(seededRandom(dateSeed + 3) * 20 - 10)));
  
  // Calories burned correlate with activity
  const caloriesBurned = Math.floor(steps * 0.04 + activeMinutes * 8 + seededRandom(dateSeed + 4) * 200);

  // Heart rate data - varies by fitness level and stress
  const baseRestingHR = 62 + Math.floor(seededRandom(dateSeed + 5) * 16); // 62-78 BPM
  const stressModifier = isWeekend ? -2 : 3; // Lower HR on weekends
  const restingHR = Math.max(50, Math.min(90, baseRestingHR + stressModifier));
  
  // HRV inversely correlates with resting HR (higher fitness = lower RHR, higher HRV)
  const baseHRV = 50 - (restingHR - 60) * 0.8; // Better HRV with lower resting HR
  const hrv = Math.max(15, Math.min(60, baseHRV + seededRandom(dateSeed + 6) * 10 - 5));

  // Mood data - varies by day of week and sleep quality
  let baseMood = isWeekend ? 4.2 : 3.8; // Better mood on weekends
  if (sleepQuality >= 4) baseMood += 0.5; // Good sleep improves mood
  else if (sleepQuality <= 2) baseMood -= 0.7; // Poor sleep worsens mood
  
  const moodRating = Math.max(1, Math.min(5, Math.floor(baseMood + seededRandom(dateSeed + 7) * 1.5 - 0.75)));

  // Mindfulness data - more likely on weekends and varies by person
  const mindfulnessProbability = isWeekend ? 0.6 : 0.3;
  const doesMindfulness = seededRandom(dateSeed + 8) < mindfulnessProbability;
  
  let minutesToday = 0;
  let sessionsCompleted = 0;
  
  if (doesMindfulness) {
    sessionsCompleted = 1 + Math.floor(seededRandom(dateSeed + 9) * 2); // 1-2 sessions
    minutesToday = sessionsCompleted * (5 + Math.floor(seededRandom(dateSeed + 10) * 15)); // 5-20 min per session
  }

  return {
    sleep: {
      hoursSlept: Math.round(hoursSlept * 10) / 10, // Round to 1 decimal
      sleepQuality,
    },
    activity: {
      steps,
      activeMinutes,
      caloriesBurned,
    },
    heartRate: {
      restingHR,
      hrv: Math.round(hrv),
    },
    mood: {
      rating: moodRating,
      timestamp: now,
    },
    mindfulness: {
      minutesToday,
      sessionsCompleted,
    },
  };
}

/**
 * Mock function to get health data from HealthKit
 * In production, this would use actual HealthKit APIs
 */
export async function getHealthData(): Promise<HealthData | null> {
  try {
    // Generate realistic mock data for Expo/Replit environment
    const mockData = generateRealisticHealthData();
    
    // Log the mock data for debugging
    console.log('Mock Health Data Generated:', {
      sleep: `${mockData.sleep.hoursSlept}h (quality: ${mockData.sleep.sleepQuality}/5)`,
      activity: `${mockData.activity.steps.toLocaleString()} steps, ${mockData.activity.activeMinutes}min active`,
      heartRate: `${mockData.heartRate.restingHR} BPM resting, ${mockData.heartRate.hrv}ms HRV`,
      mood: `${mockData.mood.rating}/5`,
      mindfulness: `${mockData.mindfulness.minutesToday}min, ${mockData.mindfulness.sessionsCompleted} sessions`,
    });

    // Store daily activity data for energy decay calculations
    await storeDailyActivity({
      steps: mockData.activity.steps,
      activeMinutes: mockData.activity.activeMinutes,
      exerciseMinutes: Math.floor(mockData.activity.activeMinutes * 0.3) // Estimate exercise from active minutes
    });

    return mockData;
  } catch (error) {
    console.error('Error generating mock health data:', error);
    return null;
  }
}

/**
 * Apply health data adjustments to EPC scores
 */
export function applyHealthAdjustments(
  baseScores: EPCScores,
  healthData: HealthData
): EPCScores {
  let adjustedScores = { ...baseScores };

  // Sleep adjustments (affects Energy)
  const sleepHours = healthData.sleep.hoursSlept;
  const sleepQuality = healthData.sleep.sleepQuality;
  
  if (sleepHours >= HEALTH_ADJUSTMENTS.sleep.excellent.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.excellent.energyBonus;
  } else if (sleepHours >= HEALTH_ADJUSTMENTS.sleep.good.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.good.energyBonus;
  } else if (sleepHours <= HEALTH_ADJUSTMENTS.sleep.poor.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.poor.energyPenalty;
  } else if (sleepHours <= HEALTH_ADJUSTMENTS.sleep.terrible.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.terrible.energyPenalty;
  }

  // Sleep quality adjustment
  if (sleepQuality > 3) {
    adjustedScores.energy += (sleepQuality - 3) * HEALTH_ADJUSTMENTS.sleep.qualityBonus;
  } else if (sleepQuality < 3) {
    adjustedScores.energy += (sleepQuality - 3) * HEALTH_ADJUSTMENTS.sleep.qualityPenalty;
  }

  // Activity adjustments (affects Energy and Purpose)
  const steps = healthData.activity.steps;
  const activeMinutes = healthData.activity.activeMinutes;

  if (steps >= HEALTH_ADJUSTMENTS.activity.highSteps.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.highSteps.energyBonus;
  } else if (steps >= HEALTH_ADJUSTMENTS.activity.goodSteps.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.goodSteps.energyBonus;
  } else if (steps <= HEALTH_ADJUSTMENTS.activity.lowSteps.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.lowSteps.energyPenalty;
  }

  // Active minutes adjustment
  if (activeMinutes > 30) {
    const bonus = (activeMinutes - 30) * HEALTH_ADJUSTMENTS.activity.activeMinutesBonus;
    adjustedScores.energy += Math.min(bonus, 5); // Cap at +5
    adjustedScores.purpose += Math.min(bonus * 0.5, 3); // Cap at +3
  } else if (activeMinutes < 30) {
    const penalty = (30 - activeMinutes) * HEALTH_ADJUSTMENTS.activity.activeMinutesPenalty;
    adjustedScores.energy += Math.max(penalty, -5); // Cap at -5
  }

  // Heart Rate and HRV adjustments (affects Energy)
  const restingHR = healthData.heartRate.restingHR;
  const hrv = healthData.heartRate.hrv;

  // HRV adjustment (baseline assumed at 30)
  if (hrv > 30) {
    adjustedScores.energy += Math.min((hrv - 30) * HEALTH_ADJUSTMENTS.heartRate.hrvBonus, 8);
  } else if (hrv < 30) {
    adjustedScores.energy += Math.max((hrv - 30) * HEALTH_ADJUSTMENTS.heartRate.hrvPenalty, -8);
  }

  // Resting HR adjustment
  if (restingHR < 60) {
    adjustedScores.energy += Math.min((60 - restingHR) * HEALTH_ADJUSTMENTS.heartRate.restingHRBonus, 5);
  } else if (restingHR > 80) {
    adjustedScores.energy += Math.max((restingHR - 80) * HEALTH_ADJUSTMENTS.heartRate.restingHRPenalty, -5);
  }

  // Mood adjustments (affects Purpose and Connection)
  const mood = healthData.mood.rating;
  
  if (mood >= HEALTH_ADJUSTMENTS.mood.excellent.threshold) {
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.excellent.purposeBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.excellent.connectionBonus;
  } else if (mood >= HEALTH_ADJUSTMENTS.mood.good.threshold) {
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.good.purposeBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.good.connectionBonus;
  } else if (mood <= HEALTH_ADJUSTMENTS.mood.poor.threshold) {
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.poor.purposePenalty;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.poor.connectionPenalty;
  } else if (mood <= HEALTH_ADJUSTMENTS.mood.terrible.threshold) {
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.terrible.purposePenalty;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.terrible.connectionPenalty;
  }

  // Mindfulness adjustments (affects Purpose and Connection)
  const mindfulnessMinutes = healthData.mindfulness.minutesToday;
  const mindfulnessSessions = healthData.mindfulness.sessionsCompleted;

  const mindfulnessBonus = Math.min(
    mindfulnessMinutes * HEALTH_ADJUSTMENTS.mindfulness.minutesBonus +
    mindfulnessSessions * HEALTH_ADJUSTMENTS.mindfulness.sessionsBonus,
    HEALTH_ADJUSTMENTS.mindfulness.maxDailyBonus
  );

  adjustedScores.purpose += mindfulnessBonus * 0.6;
  adjustedScores.connection += mindfulnessBonus * 0.4;

  // Ensure scores stay within 0-100 range
  adjustedScores.energy = Math.max(0, Math.min(100, adjustedScores.energy));
  adjustedScores.purpose = Math.max(0, Math.min(100, adjustedScores.purpose));
  adjustedScores.connection = Math.max(0, Math.min(100, adjustedScores.connection));

  return adjustedScores;
}

/**
 * Get health-adjusted EPC scores using mock Apple Health data
 * This will be replaced with real HealthKit integration when Apple Developer account is available
 */
export async function getAdjustedEPCScores(baseScores: EPCScores): Promise<EPCScores> {
  try {
    // Get mock Apple Health data
    const appleHealthData = await getMockAppleHealthData();
    
    // Apply sleep quality adjustments to energy level first
    const sleepAdjustedScores = await applySleepQualityAdjustment(
      appleHealthData.sleep.sleepQuality === 'Excellent' ? 5 : 
      appleHealthData.sleep.sleepQuality === 'Good' ? 4 :
      appleHealthData.sleep.sleepQuality === 'Fair' ? 3 : 2,
      appleHealthData.sleep.hoursSlept
    );
    
    // If no EPC scores exist yet, fall back to original scores
    if (!sleepAdjustedScores) {
      console.log('⚠️ No EPC scores found for health adjustments, returning original scores');
      return baseScores;
    }
    
    // Convert to EPC adjustments
    const adjustments = convertAppleHealthToEPCAdjustments(appleHealthData);
    
    // Apply adjustments to sleep-adjusted scores
    const adjustedScores = {
      energy: Math.max(0, Math.min(100, sleepAdjustedScores.newEnergy + adjustments.energyAdjustment)),
      purpose: Math.max(0, Math.min(100, baseScores.purpose + adjustments.purposeAdjustment)),
      connection: Math.max(0, Math.min(100, baseScores.connection + adjustments.connectionAdjustment)),
    };
    
    console.log('🍎 Health-adjusted EPC scores:', {
      original: baseScores,
      sleepAdjustment: `${sleepAdjustedScores.previousEnergy} → ${sleepAdjustedScores.newEnergy} (${sleepAdjustedScores.sleepBonus > 0 ? '+' : ''}${sleepAdjustedScores.sleepBonus})`,
      healthAdjustments: adjustments,
      final: adjustedScores,
    });
    
    return adjustedScores;
  } catch (error) {
    console.error('Error getting health-adjusted EPC scores:', error);
    return baseScores; // Fallback to original scores
  }
}

/**
 * Get health data summary for display
 */
export function getHealthDataSummary(healthData: HealthData): {
  sleep: string;
  activity: string;
  mood: string;
  mindfulness: string;
} {
  return {
    sleep: `${healthData.sleep.hoursSlept.toFixed(1)}h (${healthData.sleep.sleepQuality}/5)`,
    activity: `${healthData.activity.steps.toLocaleString()} steps, ${healthData.activity.activeMinutes}min active`,
    mood: `${healthData.mood.rating}/5`,
    mindfulness: `${healthData.mindfulness.minutesToday}min, ${healthData.mindfulness.sessionsCompleted} sessions`,
  };
} 