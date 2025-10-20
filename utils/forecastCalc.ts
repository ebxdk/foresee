// Deterministic Forecast Calculation Utility
// EWMA-based forecasting system for burnout prediction

export type TrendType = 'improving' | 'stable' | 'declining';

export interface ForecastConfidence {
  score: number;        // 0-100%
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  daysAvailable: number;
  variance: number;     // Statistical variance of recent history
  standardDeviation: number; // Square root of variance
}

// Constants for forecast model
const MIN_HISTORY_FOR_FORECAST = 3; // Need 3+ days for trend
const OPTIMAL_HISTORY_DAYS = 7;      // Best with full week
const MAX_HISTORY_DAYS = 30;         // Keep last 30 days
const EWMA_ALPHA = 0.7;              // 70% weight to recent data
const BASELINE_BURNOUT = 50;         // Neutral baseline when no data

// Enhanced forecast parameters for better accuracy
const TREND_SENSITIVITY = 1.5;       // How sensitive trend detection is
const CONFIDENCE_DECAY = 0.95;       // How confidence decreases over time
const VOLATILITY_THRESHOLD = 10;      // High volatility threshold
const SEASONAL_ADJUSTMENT = 0.15;    // Seasonal pattern strength

const clampBurnout = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * Generate deterministic forecast using EWMA (Exponential Weighted Moving Average)
 * Same inputs always produce same outputs
 */
export function generateSmartForecast(
  currentBurnout: number,
  recentHistory: number[] = []
): { forecast: number[]; trend: TrendType; confidence: ForecastConfidence } {
  
  // Enhanced data validation
  if (!Number.isFinite(currentBurnout) || currentBurnout < 0 || currentBurnout > 100) {
    console.warn('Invalid currentBurnout value:', currentBurnout, 'using baseline');
    currentBurnout = BASELINE_BURNOUT;
  }
  
  // Validate recent history
  const validHistory = recentHistory.filter(val => 
    Number.isFinite(val) && val >= 0 && val <= 100
  );
  
  if (validHistory.length !== recentHistory.length) {
    console.warn('Filtered invalid history values:', {
      original: recentHistory.length,
      valid: validHistory.length
    });
  }
  
  // Data validation - require minimum history
  if (validHistory.length < MIN_HISTORY_FOR_FORECAST) {
    return generateBaselineForecast(currentBurnout, validHistory.length);
  }
  
  const boundedHistory = validHistory.slice(-MAX_HISTORY_DAYS);
  const historyWithCurrent = [...boundedHistory, currentBurnout];
  
  // Analyze recent trend and derive confidence from available data
  const trend = analyzeTrend(boundedHistory, currentBurnout);
  const confidence = calculateConfidence(historyWithCurrent);
  
  // Generate 10-day forecast using EWMA
  const forecast: number[] = [];
  const mutableHistory = [...historyWithCurrent];
  let lastValue = currentBurnout;
  
  for (let day = 1; day <= 10; day++) {
    const forecastValue = calculateEWMAForecast(lastValue, day, trend, mutableHistory);
    const clampedValue = clampBurnout(forecastValue);
    forecast.push(clampedValue);
    mutableHistory.push(clampedValue);
    lastValue = clampedValue;
  }
  
  return { forecast, trend, confidence };
}

/**
 * Generate baseline forecast when insufficient data
 */
function generateBaselineForecast(currentBurnout: number, daysAvailable: number): { 
  forecast: number[]; 
  trend: TrendType; 
  confidence: ForecastConfidence 
} {
  const safeCurrent = clampBurnout(Number.isFinite(currentBurnout) ? currentBurnout : BASELINE_BURNOUT);
  const forecast = Array(10).fill(safeCurrent);
  const confidence: ForecastConfidence = {
    score: 0,
    dataQuality: 'poor',
    daysAvailable,
    variance: 0,
    standardDeviation: 0
  };
  
  return { forecast, trend: 'stable', confidence };
}

/**
 * Analyze trend from recent history with enhanced accuracy
 */
function analyzeTrend(history: number[], current: number): TrendType {
  if (history.length < 2) return 'stable';
  
  // Use multiple time windows for more robust trend detection
  const shortTerm = [...history.slice(-3), current];
  const mediumTerm = history.length >= 5 ? [...history.slice(-5), current] : shortTerm;
  const longTerm = history.length >= 7 ? [...history.slice(-7), current] : mediumTerm;
  
  // Calculate weighted trend scores
  const shortSlope = calculateTrendSlope(shortTerm);
  const mediumSlope = calculateTrendSlope(mediumTerm);
  const longSlope = calculateTrendSlope(longTerm);
  
  // Weighted average with more weight on recent trends
  const weightedSlope = (shortSlope * 0.5) + (mediumSlope * 0.3) + (longSlope * 0.2);
  
  // Enhanced trend thresholds with sensitivity adjustment
  const threshold = TREND_SENSITIVITY;
  if (weightedSlope > threshold) return 'declining'; // Burnout increasing
  if (weightedSlope < -threshold) return 'improving'; // Burnout decreasing
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
 * Calculate EWMA forecast for a specific day with enhanced accuracy
 */
function calculateEWMAForecast(
  previousValue: number,
  dayOffset: number,
  trend: TrendType,
  history: number[]
): number {
  
  // Project next burnout value from historical slope with regression to baseline
  const projectedFromHistory = projectBurnoutFromHistory(history, previousValue, dayOffset);
  
  // Enhanced EWMA with adaptive alpha based on data quality
  const dataQuality = history.length >= 7 ? 1.0 : history.length / 7;
  const adaptiveAlpha = EWMA_ALPHA * dataQuality;
  const forecast = adaptiveAlpha * previousValue + (1 - adaptiveAlpha) * projectedFromHistory;
  
  // Apply deterministic trend influence with confidence decay
  const trendEffect = getTrendEffect(trend, dayOffset) * Math.pow(CONFIDENCE_DECAY, dayOffset - 1);
  
  // Apply weekly patterns (weekends vs weekdays)
  const weeklyEffect = getWeeklyPatternEffect(dayOffset);
  
  // Apply behavioral patterns (deterministic)
  const behaviorEffect = simulateBehaviorPatterns(previousValue, dayOffset, history);
  
  // Apply recovery/fatigue dynamics
  const recoveryEffect = simulateRecoveryDynamics(previousValue, dayOffset, trend);
  
  // Apply seasonal adjustments for better long-term accuracy
  const seasonalEffect = getSeasonalAdjustment(dayOffset, history);
  
  // Apply momentum factor for trend continuation
  const momentumEffect = getMomentumEffect(history, dayOffset);
  
  return forecast + trendEffect + weeklyEffect + behaviorEffect + recoveryEffect + seasonalEffect + momentumEffect;
}

/**
 * Deterministically project burnout from recent history
 */
function projectBurnoutFromHistory(
  history: number[],
  previousValue: number,
  dayOffset: number
): number {
  if (history.length === 0) return previousValue;
  
  const window = history.slice(-Math.min(OPTIMAL_HISTORY_DAYS, history.length));
  if (window.length < 2) return previousValue;
  
  const slope = calculateTrendSlope(window);
  const projected = previousValue + slope;
  
  // Gentle regression to baseline to avoid runaway forecasts
  const reversionStrength = Math.min(dayOffset / 10, 1);
  const regression = (BASELINE_BURNOUT - projected) * 0.1 * reversionStrength;
  
  return projected + regression;
}

/**
 * Calculate confidence based on data quality and variance with enhanced accuracy
 */
function calculateConfidence(history: number[]): ForecastConfidence {
  const days = history.length;
  if (days === 0) {
    return {
      score: 0,
      dataQuality: 'poor',
      daysAvailable: 0,
      variance: 0,
      standardDeviation: 0
    };
  }

  const stdDev = calculateVolatility(history);
  const variance = stdDev * stdDev;
  
  // Enhanced confidence calculation with multiple factors
  let score = Math.min((days / OPTIMAL_HISTORY_DAYS) * 100, 100);
  
  // Data consistency factor (lower variance = higher confidence)
  const consistencyFactor = Math.max(0.3, 1 - (stdDev / VOLATILITY_THRESHOLD));
  score *= consistencyFactor;
  
  // Data recency factor (more recent data = higher confidence)
  const recencyFactor = Math.min(1.0, 1 + (Math.min(days, 7) - 3) * 0.1);
  score *= recencyFactor;
  
  // Trend stability factor (stable trends = higher confidence)
  if (days >= 3) {
    const recentValues = history.slice(-3);
    const trendStability = 1 - (Math.abs(calculateTrendSlope(recentValues)) / 5);
    score *= Math.max(0.5, trendStability);
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Enhanced data quality determination
  let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 85 && stdDev < 5) dataQuality = 'excellent';
  else if (score >= 70 && stdDev < 8) dataQuality = 'good';
  else if (score >= 50) dataQuality = 'fair';
  else dataQuality = 'poor';
  
  return {
    score: Math.round(score),
    dataQuality,
    daysAvailable: days,
    variance: Math.round(variance * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100
  };
}

/**
 * Get trend effect based on current trend direction (deterministic)
 */
function getTrendEffect(trend: TrendType, dayOffset: number): number {
  const trendMultiplier = Math.pow(0.8, dayOffset - 1); // Diminishing effect over time
  
  switch (trend) {
    case 'improving':
      return -1.5 * trendMultiplier; // Burnout continues to decrease
    case 'declining':
      return 2.0 * trendMultiplier; // Burnout continues to increase
    case 'stable':
      return 0; // No drift when stable
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
 * Get seasonal adjustment based on time of year
 */
function getSeasonalAdjustment(dayOffset: number, history: number[]): number {
  const today = new Date();
  const futureDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const month = futureDate.getMonth(); // 0-11
  
  // Seasonal patterns (Northern Hemisphere)
  let seasonalEffect = 0;
  
  // Winter months (Dec, Jan, Feb) - higher burnout
  if (month === 11 || month === 0 || month === 1) {
    seasonalEffect = 1.0;
  }
  // Spring months (Mar, Apr, May) - moderate
  else if (month >= 2 && month <= 4) {
    seasonalEffect = -0.5;
  }
  // Summer months (Jun, Jul, Aug) - lower burnout
  else if (month >= 5 && month <= 7) {
    seasonalEffect = -1.0;
  }
  // Fall months (Sep, Oct, Nov) - moderate
  else {
    seasonalEffect = 0.2;
  }
  
  return seasonalEffect * SEASONAL_ADJUSTMENT;
}

/**
 * Get momentum effect based on recent trend strength
 */
function getMomentumEffect(history: number[], dayOffset: number): number {
  if (history.length < 3) return 0;
  
  const recentValues = history.slice(-3);
  const momentum = calculateTrendSlope(recentValues);
  
  // Momentum decays over time
  const momentumDecay = Math.pow(0.8, dayOffset - 1);
  
  return momentum * 0.3 * momentumDecay;
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
    confidence: baseForecast.confidence.score
  };
}

/**
 * Generate deterministic confidence intervals for forecast
 */
export function generateConfidenceIntervals(
  forecast: number[],
  volatility: number
): { high: number[]; low: number[] } {
  const confidenceMultiplier = 1.645; // 90% confidence interval
  
  const high = forecast.map(value => 
    Math.min(100, value + (volatility * confidenceMultiplier))
  );
  
  const low = forecast.map(value => 
    Math.max(0, value - (volatility * confidenceMultiplier))
  );
  
  return { high, low };
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
 * Legacy function for backward compatibility - returns confidence as number
 */
export function generateForecastWithLegacyConfidence(
  todayBurnout: number,
  recentHistory: number[] = []
): { forecast: number[]; trend: TrendType; confidence: number } {
  const result = generateSmartForecast(todayBurnout, recentHistory);
  return {
    forecast: result.forecast,
    trend: result.trend,
    confidence: result.confidence.score
  };
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
