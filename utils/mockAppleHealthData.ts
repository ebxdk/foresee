// Mock Apple Health Data
// This file contains realistic mock data for Apple Health integration
// When you get Apple Developer account access, replace these functions with real HealthKit calls

export interface AppleHealthData {
  // Core Health Metrics
  steps: {
    count: number;
    goal: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  
  // Activity Rings (Move, Exercise, Stand)
  activityRings: {
    move: {
      current: number;
      goal: number;
      percentage: number;
    };
    exercise: {
      current: number;
      goal: number;
      percentage: number;
    };
    stand: {
      current: number;
      goal: number;
      percentage: number;
    };
  };
  
  // Sleep Data
  sleep: {
    hoursSlept: number;
    sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    bedtime: string;
    wakeTime: string;
    sleepStages: {
      deep: number;
      core: number;
      rem: number;
      awake: number;
    };
  };
  
  // Heart Rate & HRV
  heartRate: {
    resting: number;
    current: number;
    max: number;
    hrv: number;
    trend: 'up' | 'down' | 'stable';
  };
  
  // Mindfulness & Mental Health
  mindfulness: {
    minutesToday: number;
    sessionsCompleted: number;
    weeklyGoal: number;
    currentStreak: number;
  };
  
  // Mood & Stress (iOS 17+ features)
  mood: {
    currentMood: 'Very Pleasant' | 'Pleasant' | 'Neutral' | 'Unpleasant' | 'Very Unpleasant';
    stressLevel: number; // 1-10
    anxietyLevel: number; // 1-10
    energyLevel: number; // 1-10
  };
  
  // Workout Data
  workouts: {
    todayWorkouts: number;
    weeklyWorkouts: number;
    favoriteWorkoutType: string;
    avgWorkoutDuration: number;
  };
  
  // Environmental Data
  environmental: {
    noiseLevel: number;
    airQuality: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
    uvIndex: number;
  };
  
  // Timestamp
  lastUpdated: Date;
  
  // Data source validation
  source: 'real' | 'mock';
  permissionsGranted: boolean;
}

/**
 * Generate realistic mock Apple Health data
 * This simulates what you'd get from HealthKit with proper Apple Developer access
 */
export function generateMockAppleHealthData(): AppleHealthData {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Create deterministic but realistic variations based on current time
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Steps Data
  const baseSteps = isWeekend ? 6500 : 9200;
  const timeProgressFactor = Math.min(1, hour / 20); // Steps accumulate throughout day
  const stepsVariation = seededRandom(dateSeed) * 3000 - 1500;
  const currentSteps = Math.max(500, Math.floor((baseSteps + stepsVariation) * timeProgressFactor));
  const stepsGoal = 10000;
  
  // Activity Rings
  const moveCalories = Math.floor(currentSteps * 0.045 + seededRandom(dateSeed + 1) * 200);
  const moveGoal = 630;
  const exerciseMinutes = Math.floor(currentSteps / 200) + Math.floor(seededRandom(dateSeed + 2) * 30);
  const exerciseGoal = 30;
  const standHours = Math.min(12, Math.floor(hour * 0.7) + Math.floor(seededRandom(dateSeed + 3) * 3));
  const standGoal = 12;

  // Sleep Data (from previous night)
  const sleepHours = isWeekend ? 
    7.5 + seededRandom(dateSeed + 4) * 2 : 
    6.8 + seededRandom(dateSeed + 4) * 1.5;
  const sleepQuality = sleepHours >= 8 ? 'Excellent' : 
                       sleepHours >= 7 ? 'Good' : 
                       sleepHours >= 6 ? 'Fair' : 'Poor';
  
  // Heart Rate Data
  const baseRestingHR = 58 + Math.floor(seededRandom(dateSeed + 5) * 20);
  const currentHR = baseRestingHR + Math.floor(seededRandom(dateSeed + 6) * 40 + 10);
  const maxHR = 220 - 30; // Assuming age ~30
  const hrv = Math.max(20, Math.min(60, 45 - (baseRestingHR - 60) * 0.5 + seededRandom(dateSeed + 7) * 10));

  // Mindfulness Data
  const mindfulnessMinutes = seededRandom(dateSeed + 8) > 0.7 ? 
    Math.floor(seededRandom(dateSeed + 9) * 20 + 5) : 0;
  const mindfulnessSessions = mindfulnessMinutes > 0 ? 
    Math.floor(mindfulnessMinutes / 10) + 1 : 0;

  // Mood Data (iOS 17+ State of Mind)
  const moodOptions = ['Very Pleasant', 'Pleasant', 'Neutral', 'Unpleasant', 'Very Unpleasant'] as const;
  const moodIndex = Math.floor(seededRandom(dateSeed + 10) * moodOptions.length);
  const currentMood = moodOptions[moodIndex];
  
  // Stress correlates with mood and sleep
  const stressLevel = sleepQuality === 'Poor' ? 
    Math.floor(seededRandom(dateSeed + 11) * 3 + 7) : 
    Math.floor(seededRandom(dateSeed + 11) * 6 + 2);
  
  const anxietyLevel = Math.max(1, Math.min(10, stressLevel + Math.floor(seededRandom(dateSeed + 12) * 3 - 1)));
  const energyLevel = sleepQuality === 'Excellent' ? 
    Math.floor(seededRandom(dateSeed + 13) * 3 + 7) : 
    Math.floor(seededRandom(dateSeed + 13) * 6 + 3);

  // Workout Data
  const todayWorkouts = seededRandom(dateSeed + 14) > 0.6 ? 1 : 0;
  const weeklyWorkouts = Math.floor(seededRandom(dateSeed + 15) * 4 + 2);
  const workoutTypes = ['Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Strength Training'];
  const favoriteWorkoutType = workoutTypes[Math.floor(seededRandom(dateSeed + 16) * workoutTypes.length)];

  // Environmental Data
  const noiseLevel = Math.floor(seededRandom(dateSeed + 17) * 30 + 40); // 40-70 dB
  const airQualityOptions = ['Good', 'Moderate', 'Unhealthy', 'Hazardous'] as const;
  const airQuality = airQualityOptions[Math.floor(seededRandom(dateSeed + 18) * airQualityOptions.length)];
  const uvIndex = Math.floor(seededRandom(dateSeed + 19) * 10 + 1);

  return {
    steps: {
      count: currentSteps,
      goal: stepsGoal,
      percentage: Math.round((currentSteps / stepsGoal) * 100),
      trend: seededRandom(dateSeed + 20) > 0.5 ? 'up' : 'stable',
    },
    
    activityRings: {
      move: {
        current: moveCalories,
        goal: moveGoal,
        percentage: Math.round((moveCalories / moveGoal) * 100),
      },
      exercise: {
        current: exerciseMinutes,
        goal: exerciseGoal,
        percentage: Math.round((exerciseMinutes / exerciseGoal) * 100),
      },
      stand: {
        current: standHours,
        goal: standGoal,
        percentage: Math.round((standHours / standGoal) * 100),
      },
    },
    
    sleep: {
      hoursSlept: Math.round(sleepHours * 10) / 10,
      sleepQuality,
      bedtime: '10:30 PM',
      wakeTime: '6:45 AM',
      sleepStages: {
        deep: Math.round(sleepHours * 0.15 * 10) / 10,
        core: Math.round(sleepHours * 0.55 * 10) / 10,
        rem: Math.round(sleepHours * 0.25 * 10) / 10,
        awake: Math.round(sleepHours * 0.05 * 10) / 10,
      },
    },
    
    heartRate: {
      resting: baseRestingHR,
      current: currentHR,
      max: maxHR,
      hrv: Math.round(hrv),
      trend: seededRandom(dateSeed + 21) > 0.6 ? 'stable' : 'down',
    },
    
    mindfulness: {
      minutesToday: mindfulnessMinutes,
      sessionsCompleted: mindfulnessSessions,
      weeklyGoal: 70,
      currentStreak: Math.floor(seededRandom(dateSeed + 22) * 7 + 1),
    },
    
    mood: {
      currentMood,
      stressLevel,
      anxietyLevel,
      energyLevel,
    },
    
    workouts: {
      todayWorkouts,
      weeklyWorkouts,
      favoriteWorkoutType,
      avgWorkoutDuration: Math.floor(seededRandom(dateSeed + 23) * 30 + 30),
    },
    
    environmental: {
      noiseLevel,
      airQuality,
      uvIndex,
    },
    
    lastUpdated: now,
    source: 'mock' as const,
    permissionsGranted: false,
  };
}

/**
 * Mock function to get Apple Health data
 * TODO: Replace with real HealthKit integration when Apple Developer account is available
 */
export async function getMockAppleHealthData(): Promise<AppleHealthData> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const data = generateMockAppleHealthData();
  
  // Log for debugging (remove in production)
  console.log('🍎 Mock Apple Health Data:', {
    steps: `${data.steps.count.toLocaleString()}/${data.steps.goal.toLocaleString()} (${data.steps.percentage}%)`,
    sleep: `${data.sleep.hoursSlept}h - ${data.sleep.sleepQuality}`,
    heartRate: `${data.heartRate.resting} BPM resting, ${data.heartRate.hrv}ms HRV`,
    mood: `${data.mood.currentMood} (Stress: ${data.mood.stressLevel}/10)`,
    activityRings: `${data.activityRings.move.percentage}% Move, ${data.activityRings.exercise.percentage}% Exercise, ${data.activityRings.stand.percentage}% Stand`,
  });
  
  return data;
}

/**
 * Convert Apple Health data to EPC score adjustments
 * This uses the same logic as the existing healthKitIntegration but with richer data
 */
export function convertAppleHealthToEPCAdjustments(healthData: AppleHealthData): {
  energyAdjustment: number;
  purposeAdjustment: number;
  connectionAdjustment: number;
} {
  let energyAdjustment = 0;
  let purposeAdjustment = 0;
  let connectionAdjustment = 0;

  // Sleep impact on Energy
  if (healthData.sleep.hoursSlept >= 8) {
    energyAdjustment += 10;
  } else if (healthData.sleep.hoursSlept >= 7) {
    energyAdjustment += 5;
  } else if (healthData.sleep.hoursSlept <= 6) {
    energyAdjustment -= 8;
  }

  // Sleep quality bonus/penalty
  switch (healthData.sleep.sleepQuality) {
    case 'Excellent':
      energyAdjustment += 8;
      break;
    case 'Good':
      energyAdjustment += 4;
      break;
    case 'Fair':
      energyAdjustment += 0;
      break;
    case 'Poor':
      energyAdjustment -= 6;
      break;
  }

  // Activity impact on Energy and Purpose
  const movePercentage = healthData.activityRings.move.percentage;
  const exercisePercentage = healthData.activityRings.exercise.percentage;
  
  if (movePercentage >= 100) {
    energyAdjustment += 8;
    purposeAdjustment += 3;
  } else if (movePercentage >= 75) {
    energyAdjustment += 5;
    purposeAdjustment += 2;
  } else if (movePercentage <= 25) {
    energyAdjustment -= 5;
    purposeAdjustment -= 2;
  }

  if (exercisePercentage >= 100) {
    energyAdjustment += 6;
    purposeAdjustment += 4;
  }

  // Heart Rate Variability impact on Energy
  if (healthData.heartRate.hrv >= 40) {
    energyAdjustment += 5;
  } else if (healthData.heartRate.hrv <= 25) {
    energyAdjustment -= 4;
  }

  // Mood impact on Purpose and Connection
  switch (healthData.mood.currentMood) {
    case 'Very Pleasant':
      purposeAdjustment += 8;
      connectionAdjustment += 6;
      break;
    case 'Pleasant':
      purposeAdjustment += 4;
      connectionAdjustment += 3;
      break;
    case 'Neutral':
      // No adjustment
      break;
    case 'Unpleasant':
      purposeAdjustment -= 4;
      connectionAdjustment -= 3;
      break;
    case 'Very Unpleasant':
      purposeAdjustment -= 8;
      connectionAdjustment -= 6;
      break;
  }

  // Stress level impact
  if (healthData.mood.stressLevel >= 8) {
    energyAdjustment -= 6;
    purposeAdjustment -= 4;
    connectionAdjustment -= 3;
  } else if (healthData.mood.stressLevel <= 3) {
    energyAdjustment += 4;
    purposeAdjustment += 2;
    connectionAdjustment += 2;
  }

  // Mindfulness impact on Purpose and Connection
  if (healthData.mindfulness.minutesToday >= 20) {
    purposeAdjustment += 6;
    connectionAdjustment += 4;
  } else if (healthData.mindfulness.minutesToday >= 10) {
    purposeAdjustment += 3;
    connectionAdjustment += 2;
  }

  // Environmental factors
  if (healthData.environmental.airQuality === 'Hazardous') {
    energyAdjustment -= 3;
  } else if (healthData.environmental.airQuality === 'Good') {
    energyAdjustment += 2;
  }

  // Cap adjustments to reasonable ranges
  energyAdjustment = Math.max(-20, Math.min(20, energyAdjustment));
  purposeAdjustment = Math.max(-15, Math.min(15, purposeAdjustment));
  connectionAdjustment = Math.max(-15, Math.min(15, connectionAdjustment));

  return {
    energyAdjustment,
    purposeAdjustment,
    connectionAdjustment,
  };
}

/**
 * Get formatted Apple Health summary for display
 */
export function getAppleHealthSummary(healthData: AppleHealthData): {
  activityRings: string;
  sleep: string;
  heartRate: string;
  mood: string;
  mindfulness: string;
  steps: string;
} {
  return {
    activityRings: `${healthData.activityRings.move.percentage}% • ${healthData.activityRings.exercise.percentage}% • ${healthData.activityRings.stand.percentage}%`,
    sleep: `${healthData.sleep.hoursSlept}h • ${healthData.sleep.sleepQuality}`,
    heartRate: `${healthData.heartRate.resting} BPM • ${healthData.heartRate.hrv}ms HRV`,
    mood: `${healthData.mood.currentMood} • Stress: ${healthData.mood.stressLevel}/10`,
    mindfulness: `${healthData.mindfulness.minutesToday}min • ${healthData.mindfulness.sessionsCompleted} sessions`,
    steps: `${healthData.steps.count.toLocaleString()} • ${healthData.steps.percentage}% of goal`,
  };
} 