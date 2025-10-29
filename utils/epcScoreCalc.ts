// EPC Score Calculation Utility
// Maps user answers to Energy, Purpose, and Connection scores

// Apple Health Data Interface
export interface AppleHealthData {
  steps: {
    count: number;
    goal: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
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
  heartRate: {
    resting: number;
    current: number;
    max: number;
    hrv: number;
    trend: 'up' | 'down' | 'stable';
  };
  mindfulness: {
    minutesToday: number;
    sessionsCompleted: number;
    weeklyGoal: number;
    currentStreak: number;
  };
  mood: {
    currentMood: 'Very Low' | 'Low' | 'Neutral' | 'High' | 'Very High';
    stressLevel: number;
    anxietyLevel: number;
    energyLevel: number;
  };
  workouts: {
    todayWorkouts: number;
    weeklyWorkouts: number;
    favoriteWorkoutType: string;
    avgWorkoutDuration: number;
  };
  environmental: {
    noiseLevel: number;
    airQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    uvIndex: number;
  };
  lastUpdated: Date;
  source: 'real' | 'mock';
  permissionsGranted: boolean;
}

// Removed mock data imports - using real HealthKit only

export interface EPCScores {
  energy: number;
  purpose: number;
  connection: number;
}

export interface QuestionAnswer {
  questionId: number;
  answer: number; // 1-5 scale
}

export interface CapacityAnswer {
  questionId: number;
  state: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued';
}

// Score values for each capacity state
const CAPACITY_SCORES = {
  'Maximized': 4,
  'Reserved': 3, 
  'Indulgent': 2,
  'Fatigued': 1
} as const;

// Question mapping to EPC categories
// Questions 1-2 map to Energy, Questions 3-4 map to Purpose, Question 5 maps to Connection
const QUESTION_MAPPING = {
  energy: [1, 2],
  purpose: [3, 4], 
  connection: [5]
};

/**
 * Calculate EPC scores from user answers
 * @param answers Array of answers (1-5 scale) in order [Q1, Q2, Q3, Q4, Q5]
 * @returns EPCScores object with energy, purpose, connection scores (0-100 scale)
 */
export function calculateEPCScores(answers: number[], biometricData?: AppleHealthData): EPCScores {
  if (answers.length !== 5) {
    throw new Error('Expected exactly 5 answers');
  }

  // Ensure all answers are in valid range
  for (const answer of answers) {
    if (answer < 1 || answer > 5) {
      throw new Error('All answers must be between 1 and 5');
    }
  }

  // Calculate Energy score (average of questions 1-2, converted to 0-100 scale)
  const energyAnswers = [answers[0], answers[1]];
  const energyAverage = energyAnswers.reduce((sum, val) => sum + val, 0) / energyAnswers.length;
  const energy = Math.round(((energyAverage - 1) / 4) * 100); // Convert 1-5 scale to 0-100

  // Calculate Purpose score (average of questions 3-4, converted to 0-100 scale)  
  const purposeAnswers = [answers[2], answers[3]];
  const purposeAverage = purposeAnswers.reduce((sum, val) => sum + val, 0) / purposeAnswers.length;
  const purpose = Math.round(((purposeAverage - 1) / 4) * 100);

  // Calculate Connection score (question 5, converted to 0-100 scale)
  const connectionAnswer = answers[4];
  const connection = Math.round(((connectionAnswer - 1) / 4) * 100);

  let finalScores: EPCScores = {
    energy,
    purpose,
    connection
  };

  // Apply biometric adjustments if data is provided
  if (biometricData) {
    console.log('Applying biometric adjustments...');
    // Apply health adjustments based on real data
    const adjustments = {
      energyAdjustment: 0,
      purposeAdjustment: 0,
      connectionAdjustment: 0,
    };
    
    // Simple health-based adjustments
    if (biometricData.steps.count >= 10000) {
      adjustments.energyAdjustment += 5;
    }
    if (biometricData.sleep.hoursSlept >= 8) {
      adjustments.energyAdjustment += 5;
    }
    if (biometricData.activityRings.exercise.current >= 30) {
      adjustments.purposeAdjustment += 3;
    }

    finalScores = {
      energy: Math.max(0, Math.min(100, finalScores.energy + adjustments.energyAdjustment)),
      purpose: Math.max(0, Math.min(100, finalScores.purpose + adjustments.purposeAdjustment)),
      connection: Math.max(0, Math.min(100, finalScores.connection + adjustments.connectionAdjustment)),
    };
    console.log('Biometric adjustments applied, new scores:', finalScores);
  }

  return finalScores;
}

/**
 * Get the weakest EPC pillar for generating targeted recommendations
 */
export function getWeakestPillar(scores: EPCScores): 'energy' | 'purpose' | 'connection' {
  const { energy, purpose, connection } = scores;
  
  if (energy <= purpose && energy <= connection) {
    return 'energy';
  } else if (purpose <= connection) {
    return 'purpose';
  } else {
    return 'connection';
  }
} 

/**
 * Calculate EPC scores from capacity-based assessment answers
 * @param answers Array of capacity states for all 10 questions
 * @returns EPCScores object with energy, purpose, connection scores (0-100 scale)
 */
export function calculateEPCFromCapacityAssessment(answers: string[]): EPCScores {
  if (answers.length !== 10) {
    throw new Error('Expected exactly 10 answers');
  }

  // Convert capacity states to numeric scores
  const numericAnswers = answers.map(state => {
    if (!CAPACITY_SCORES[state as keyof typeof CAPACITY_SCORES]) {
      throw new Error(`Invalid capacity state: ${state}`);
    }
    return CAPACITY_SCORES[state as keyof typeof CAPACITY_SCORES];
  });

  // Map questions to EPC categories (distribute 10 questions across 3 categories)
  // Questions 1-4: Energy-related
  // Questions 5-7: Purpose-related  
  // Questions 8-10: Connection-related
  
  const energyAnswers = numericAnswers.slice(0, 4); // Questions 1-4
  const purposeAnswers = numericAnswers.slice(4, 7); // Questions 5-7
  const connectionAnswers = numericAnswers.slice(7, 10); // Questions 8-10

  // Calculate averages and convert to 0-100 scale
  const energyAverage = energyAnswers.reduce((sum, val) => sum + val, 0) / energyAnswers.length;
  const purposeAverage = purposeAnswers.reduce((sum, val) => sum + val, 0) / purposeAnswers.length;
  const connectionAverage = connectionAnswers.reduce((sum, val) => sum + val, 0) / connectionAnswers.length;

  // Convert 1-4 scale to 0-100 scale
  const energy = Math.round(((energyAverage - 1) / 3) * 100);
  const purpose = Math.round(((purposeAverage - 1) / 3) * 100);
  const connection = Math.round(((connectionAverage - 1) / 3) * 100);

  return {
    energy,
    purpose,
    connection
  };
}

/**
 * Determine dominant capacity state from assessment answers
 * @param answers Array of capacity states for all 10 questions
 * @returns The most frequently selected capacity state
 */
export function getDominantCapacityState(answers: string[]): 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' {
  if (answers.length !== 10) {
    throw new Error('Expected exactly 10 answers');
  }

  // Count occurrences of each state
  const stateCounts = answers.reduce((counts, state) => {
    counts[state] = (counts[state] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Find the state with the highest count
  let dominantState = 'Maximized' as 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued';
  let maxCount = 0;

  for (const [state, count] of Object.entries(stateCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantState = state as 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued';
    }
  }

  return dominantState;
} 