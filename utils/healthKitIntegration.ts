// HealthKit Integration Utility
// Fetches health data and applies adjustment rules to EPC scores

// Removed mock data imports - using real HealthKit only

import { getAppleHealthDataRealOnly } from './appleHealth';
import { EPCScores } from './epcScoreCalc';
import { applySleepQualityAdjustment } from './storage';

// Health data structure
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
    highActivity: { threshold: 60, energyBonus: 6, purposeBonus: 3 },
    goodActivity: { threshold: 30, energyBonus: 3, purposeBonus: 2 },
    lowActivity: { threshold: 15, energyPenalty: -2, purposePenalty: -1 },
  },
  heartRate: {
    // Resting HR impact on Energy
    excellentHR: { threshold: 60, energyBonus: 5 },
    goodHR: { threshold: 70, energyBonus: 2 },
    poorHR: { threshold: 80, energyPenalty: -3 },
    // HRV impact on Energy and Connection
    excellentHRV: { threshold: 50, energyBonus: 4, connectionBonus: 2 },
    goodHRV: { threshold: 30, energyBonus: 2, connectionBonus: 1 },
    poorHRV: { threshold: 20, energyPenalty: -2, connectionPenalty: -1 },
  },
  mindfulness: {
    // Mindfulness impact on Connection and Purpose
    highMindfulness: { threshold: 20, connectionBonus: 5, purposeBonus: 3 },
    goodMindfulness: { threshold: 10, connectionBonus: 3, purposeBonus: 2 },
    lowMindfulness: { threshold: 5, connectionPenalty: -2, purposePenalty: -1 },
  },
  mood: {
    // Mood impact on all scores
    excellent: { threshold: 5, energyBonus: 5, purposeBonus: 5, connectionBonus: 5 },
    good: { threshold: 4, energyBonus: 3, purposeBonus: 3, connectionBonus: 3 },
    poor: { threshold: 2, energyPenalty: -3, purposePenalty: -3, connectionPenalty: -3 },
    terrible: { threshold: 1, energyPenalty: -5, purposePenalty: -5, connectionPenalty: -5 },
  },
};

/**
 * Get health data from real HealthKit
 */
export async function getHealthData(): Promise<HealthData | null> {
  try {
    const appleHealthData = await getAppleHealthDataRealOnly();
    
    const healthData: HealthData = {
      sleep: {
        hoursSlept: appleHealthData.sleep.hoursSlept,
        sleepQuality: appleHealthData.sleep.sleepQuality === 'Excellent' ? 5 : 
                     appleHealthData.sleep.sleepQuality === 'Good' ? 4 :
                     appleHealthData.sleep.sleepQuality === 'Fair' ? 3 : 2,
      },
      activity: {
        steps: appleHealthData.steps.count,
        activeMinutes: appleHealthData.activityRings.exercise.current,
        caloriesBurned: appleHealthData.activityRings.move.current,
      },
      heartRate: {
        restingHR: appleHealthData.heartRate.resting,
        hrv: appleHealthData.heartRate.hrv,
      },
      mood: {
        rating: 3, // Default neutral mood
        timestamp: new Date(),
      },
      mindfulness: {
        minutesToday: appleHealthData.mindfulness.minutesToday,
        sessionsCompleted: appleHealthData.mindfulness.sessionsCompleted,
      },
    };

    return healthData;
  } catch (error) {
    console.error('Failed to get health data:', error);
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
  } else if (sleepHours >= HEALTH_ADJUSTMENTS.sleep.poor.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.poor.energyPenalty;
  } else {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.sleep.terrible.energyPenalty;
  }

  // Sleep quality adjustments
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
  } else if (steps < HEALTH_ADJUSTMENTS.activity.lowSteps.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.lowSteps.energyPenalty;
  }

  if (activeMinutes >= HEALTH_ADJUSTMENTS.activity.highActivity.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.highActivity.energyBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.activity.highActivity.purposeBonus;
  } else if (activeMinutes >= HEALTH_ADJUSTMENTS.activity.goodActivity.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.goodActivity.energyBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.activity.goodActivity.purposeBonus;
  } else if (activeMinutes < HEALTH_ADJUSTMENTS.activity.lowActivity.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.activity.lowActivity.energyPenalty;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.activity.lowActivity.purposePenalty;
  }

  // Heart rate adjustments (affects Energy)
  const restingHR = healthData.heartRate.restingHR;
  if (restingHR <= HEALTH_ADJUSTMENTS.heartRate.excellentHR.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.excellentHR.energyBonus;
  } else if (restingHR <= HEALTH_ADJUSTMENTS.heartRate.goodHR.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.goodHR.energyBonus;
  } else if (restingHR >= HEALTH_ADJUSTMENTS.heartRate.poorHR.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.poorHR.energyPenalty;
  }

  // HRV adjustments (affects Energy and Connection)
  const hrv = healthData.heartRate.hrv;
  if (hrv >= HEALTH_ADJUSTMENTS.heartRate.excellentHRV.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.excellentHRV.energyBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.heartRate.excellentHRV.connectionBonus;
  } else if (hrv >= HEALTH_ADJUSTMENTS.heartRate.goodHRV.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.goodHRV.energyBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.heartRate.goodHRV.connectionBonus;
  } else if (hrv < HEALTH_ADJUSTMENTS.heartRate.poorHRV.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.heartRate.poorHRV.energyPenalty;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.heartRate.poorHRV.connectionPenalty;
  }

  // Mindfulness adjustments (affects Connection and Purpose)
  const mindfulnessMinutes = healthData.mindfulness.minutesToday;
  if (mindfulnessMinutes >= HEALTH_ADJUSTMENTS.mindfulness.highMindfulness.threshold) {
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mindfulness.highMindfulness.connectionBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mindfulness.highMindfulness.purposeBonus;
  } else if (mindfulnessMinutes >= HEALTH_ADJUSTMENTS.mindfulness.goodMindfulness.threshold) {
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mindfulness.goodMindfulness.connectionBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mindfulness.goodMindfulness.purposeBonus;
  } else if (mindfulnessMinutes < HEALTH_ADJUSTMENTS.mindfulness.lowMindfulness.threshold) {
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mindfulness.lowMindfulness.connectionPenalty;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mindfulness.lowMindfulness.purposePenalty;
  }

  // Mood adjustments (affects all scores)
  const moodRating = healthData.mood.rating;
  if (moodRating >= HEALTH_ADJUSTMENTS.mood.excellent.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.mood.excellent.energyBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.excellent.purposeBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.excellent.connectionBonus;
  } else if (moodRating >= HEALTH_ADJUSTMENTS.mood.good.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.mood.good.energyBonus;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.good.purposeBonus;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.good.connectionBonus;
  } else if (moodRating <= HEALTH_ADJUSTMENTS.mood.poor.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.mood.poor.energyPenalty;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.poor.purposePenalty;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.poor.connectionPenalty;
  } else if (moodRating <= HEALTH_ADJUSTMENTS.mood.terrible.threshold) {
    adjustedScores.energy += HEALTH_ADJUSTMENTS.mood.terrible.energyPenalty;
    adjustedScores.purpose += HEALTH_ADJUSTMENTS.mood.terrible.purposePenalty;
    adjustedScores.connection += HEALTH_ADJUSTMENTS.mood.terrible.connectionPenalty;
  }

  // Ensure scores stay within bounds (0-100)
  adjustedScores.energy = Math.max(0, Math.min(100, adjustedScores.energy));
  adjustedScores.purpose = Math.max(0, Math.min(100, adjustedScores.purpose));
  adjustedScores.connection = Math.max(0, Math.min(100, adjustedScores.connection));

  return adjustedScores;
}

/**
 * Get adjusted EPC scores based on health data
 */
export async function getAdjustedEPCScores(baseScores: EPCScores): Promise<EPCScores> {
  try {
    const healthData = await getHealthData();
    if (!healthData) {
      console.log('No health data available, returning base scores');
      return baseScores;
    }

    const adjustedScores = applyHealthAdjustments(baseScores, healthData);
    
    // Apply sleep quality adjustment for energy decay
    if (healthData.sleep.hoursSlept > 0) {
      const sleepAdjustment = await applySleepQualityAdjustment(
        healthData.sleep.sleepQuality,
        healthData.sleep.hoursSlept
      );
      if (sleepAdjustment) {
        adjustedScores.energy = sleepAdjustment.newEnergy;
      }
    }

    return adjustedScores;
  } catch (error) {
    console.error('Failed to get adjusted EPC scores:', error);
    return baseScores;
  }
}