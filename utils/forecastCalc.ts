// Smart Forecast Calculation Utility
// Rule-based forecasting system for burnout prediction (No ML/LLM)

export type TrendType = 'improving' | 'stable' | 'declining';

/**
 * Generate smart forecast based on current burnout and recent history
 * This is a rule-based system that simulates behavioral trends, not ML
 */
export function generateSmartForecast(
  currentBurnout: number,
  recentHistory: number[] = []
): { forecast: number[]; trend: TrendType; confidence: number } {
  
  // Analyze recent trend (last 7 days)
  const trend = analyzeTrend(recentHistory, currentBurnout);
  const volatility = calculateVolatility(recentHistory);
  
  // Generate 6-day forecast (excluding today)
  const forecast: number[] = [];
  let lastValue = currentBurnout;
  
  for (let day = 1; day <= 6; day++) {
    const forecastValue = calculateDayForecast(lastValue, day, trend, volatility, recentHistory);
    forecast.push(Math.max(0, Math.min(100, forecastValue)));
    lastValue = forecastValue;
  }
  
  // Calculate confidence based on data availability
  const confidence = Math.min(recentHistory.length / 7, 1) * 100;
  
  return { forecast, trend, confidence: Math.round(confidence) };
}

/**
 * Analyze trend from recent history
 */
function analyzeTrend(history: number[], current: number): TrendType {
  if (history.length < 2) return 'stable';
  
  // Calculate trend over last 3-7 days
  const recentValues = [...history.slice(-3), current];
  const trendSlope = calculateTrendSlope(recentValues);
  
  // Trend thresholds
  if (trendSlope > 2) return 'declining'; // Burnout increasing
  if (trendSlope < -2) return 'improving'; // Burnout decreasing
  return 'stable';
}

/**
 * Calculate trend slope (positive = worsening burnout)
 */
function calculateTrendSlope(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const sumX = (n * (n - 1)) / 2; // Sum of indices 0,1,2...n-1
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
  const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}

/**
 * Calculate volatility (how much values fluctuate)
 */
function calculateVolatility(history: number[]): number {
  if (history.length < 2) return 5; // Default volatility
  
  const mean = history.reduce((sum, val) => sum + val, 0) / history.length;
  const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.min(stdDev, 15); // Cap volatility at 15
}

/**
 * Calculate forecast for a specific day
 */
function calculateDayForecast(
  previousValue: number,
  dayOffset: number,
  trend: TrendType,
  volatility: number,
  history: number[]
): number {
  
  // Base forecast starts with previous value
  let forecast = previousValue;
  
  // Apply trend effects (compound over time)
  const trendEffect = getTrendEffect(trend, dayOffset);
  forecast += trendEffect;
  
  // Apply behavioral simulation
  const behaviorEffect = simulateBehaviorPatterns(previousValue, dayOffset, history);
  forecast += behaviorEffect;
  
  // Apply recovery/fatigue dynamics
  const recoveryEffect = simulateRecoveryDynamics(previousValue, dayOffset, trend);
  forecast += recoveryEffect;
  
  // Add controlled randomness for natural variation
  const randomEffect = (Math.random() - 0.5) * volatility * 0.3;
  forecast += randomEffect;
  
  // Apply weekly patterns (weekends vs weekdays)
  const weeklyEffect = getWeeklyPatternEffect(dayOffset);
  forecast += weeklyEffect;
  
  return forecast;
}

/**
 * Get trend effect based on current trend direction
 */
function getTrendEffect(trend: TrendType, dayOffset: number): number {
  const trendMultiplier = Math.pow(0.8, dayOffset - 1); // Diminishing effect over time
  
  switch (trend) {
    case 'improving':
      return -1.5 * trendMultiplier; // Burnout continues to decrease
    case 'declining':
      return 2.0 * trendMultiplier; // Burnout continues to increase
    case 'stable':
      return 0.2 * (Math.random() - 0.5) * trendMultiplier; // Small random drift
  }
}

/**
 * Simulate behavioral patterns that affect burnout
 */
function simulateBehaviorPatterns(
  currentBurnout: number,
  dayOffset: number,
  history: number[]
): number {
  let behaviorEffect = 0;
  
  // High burnout tends to perpetuate (fatigue builds)
  if (currentBurnout > 70) {
    behaviorEffect += 1.0 + (dayOffset * 0.3); // Compounds over time
  }
  
  // Very low burnout tends to stabilize upward (can't stay perfect)
  if (currentBurnout < 20) {
    behaviorEffect += 0.8 + (dayOffset * 0.2);
  }
  
  // Consecutive high-burnout days compound
  const recentHighDays = history.slice(-3).filter(val => val > 65).length;
  if (recentHighDays >= 2) {
    behaviorEffect += recentHighDays * 0.8;
  }
  
  // Consecutive low-burnout days lead to gradual increase (regression to mean)
  const recentLowDays = history.slice(-3).filter(val => val < 35).length;
  if (recentLowDays >= 2) {
    behaviorEffect += recentLowDays * 0.5;
  }
  
  return behaviorEffect;
}

/**
 * Simulate recovery and fatigue dynamics
 */
function simulateRecoveryDynamics(
  currentBurnout: number,
  dayOffset: number,
  trend: TrendType
): number {
  let recoveryEffect = 0;
  
  // Recovery is slower than fatigue buildup (asymmetric)
  if (trend === 'improving') {
    // Recovery slows down over time
    recoveryEffect = -0.8 * Math.pow(0.7, dayOffset - 1);
  } else if (trend === 'declining') {
    // Fatigue can build more quickly
    recoveryEffect = 1.2 * Math.pow(0.9, dayOffset - 1);
  }
  
  // Natural tendency toward baseline (regression to mean)
  const baseline = 50; // Assume 50% is average burnout
  const regressionForce = (baseline - currentBurnout) * 0.05;
  recoveryEffect += regressionForce;
  
  return recoveryEffect;
}

/**
 * Apply weekly pattern effects (weekends vs weekdays)
 */
function getWeeklyPatternEffect(dayOffset: number): number {
  // Simulate weekly patterns - weekends typically better
  const today = new Date();
  const futureDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const dayOfWeek = futureDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend effect (Saturday/Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return -2.0; // Weekends reduce burnout
  }
  
  // Monday effect
  if (dayOfWeek === 1) {
    return 1.5; // Mondays increase burnout
  }
  
  // Friday effect
  if (dayOfWeek === 5) {
    return -0.5; // Fridays slightly reduce burnout
  }
  
  return 0; // Neutral for Tue/Wed/Thu
}

/**
 * Generate forecast with health data influence
 */
export function generateHealthInfluencedForecast(
  currentBurnout: number,
  recentHistory: number[],
  healthTrends: {
    sleepTrend: TrendType;
    activityTrend: TrendType;
    moodTrend: TrendType;
  }
): { forecast: number[]; trend: TrendType; confidence: number } {
  
  // Get base forecast
  const baseForecast = generateSmartForecast(currentBurnout, recentHistory);
  
  // Apply health trend influences
  const healthInfluencedForecast = baseForecast.forecast.map((value, index) => {
    let adjustment = 0;
    
    // Sleep trend influence (strongest on energy/burnout)
    if (healthTrends.sleepTrend === 'improving') {
      adjustment -= 1.5 * Math.pow(0.8, index); // Improving sleep reduces burnout
    } else if (healthTrends.sleepTrend === 'declining') {
      adjustment += 2.0 * Math.pow(0.9, index); // Declining sleep increases burnout
    }
    
    // Activity trend influence
    if (healthTrends.activityTrend === 'improving') {
      adjustment -= 1.0 * Math.pow(0.9, index);
    } else if (healthTrends.activityTrend === 'declining') {
      adjustment += 1.2 * Math.pow(0.85, index);
    }
    
    // Mood trend influence
    if (healthTrends.moodTrend === 'improving') {
      adjustment -= 0.8 * Math.pow(0.85, index);
    } else if (healthTrends.moodTrend === 'declining') {
      adjustment += 1.5 * Math.pow(0.9, index);
    }
    
    return Math.max(0, Math.min(100, value + adjustment));
  });
  
  return {
    forecast: healthInfluencedForecast,
    trend: baseForecast.trend,
    confidence: baseForecast.confidence
  };
}

/**
 * Legacy function for backward compatibility
 */
export function generateForecast(
  todayBurnout: number,
  trend: TrendType = 'stable'
): number[] {
  const result = generateSmartForecast(todayBurnout, []);
  return [todayBurnout, ...result.forecast];
}

/**
 * Determine trend based on recent burnout history
 */
export function determineTrend(
  recentBurnoutLevels: number[] = []
): TrendType {
  if (recentBurnoutLevels.length < 2) {
    return 'stable'; // Default if no history
  }
  
  // Calculate average change over recent period
  let totalChange = 0;
  for (let i = 1; i < recentBurnoutLevels.length; i++) {
    totalChange += recentBurnoutLevels[i] - recentBurnoutLevels[i - 1];
  }
  
  const averageChange = totalChange / (recentBurnoutLevels.length - 1);
  
  // Classify trend based on average change
  if (averageChange > 1.5) {
    return 'declining';
  } else if (averageChange < -1.5) {
    return 'improving';  
  } else {
    return 'stable';
  }
} 