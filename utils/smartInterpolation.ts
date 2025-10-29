/**
 * Smart Biometric Interpolation for Burnout Data
 * 
 * Fills gaps in burnout data using biometric patterns and health data
 * to create smooth, believable curves instead of gray holes.
 * 
 * Inspired by Apple Health's approach to data visualization.
 */

import { BurnoutDataPoint } from '../types/BurnoutDataPoint';
import { getAppleHealthDataRealOnly } from './appleHealth';

export interface BiometricPattern {
  heartRateVariability: number; // 0-100 (higher = better stress management)
  sleepQuality: number; // 0-100 (from sleep data)
  activityLevel: number; // 0-100 (from activity rings)
  stressLevel: number; // 0-100 (derived from various metrics)
  timeOfDay: number; // 0-23 hours
}

export interface InterpolationConfig {
  smoothingFactor: number; // 0-1 (how smooth the curves should be)
  biometricWeight: number; // 0-1 (how much biometrics influence predictions)
  naturalPatterns: boolean; // Apply natural daily energy patterns
  preserveAnchors: boolean; // Ensure interpolated curves pass through real data points
}

/**
 * Default configuration for Apple Health-style interpolation
 */
export const DEFAULT_INTERPOLATION_CONFIG: InterpolationConfig = {
  smoothingFactor: 0.8, // Very smooth curves
  biometricWeight: 0.6, // Moderate biometric influence
  naturalPatterns: true, // Apply natural energy patterns
  preserveAnchors: true, // Always pass through real data
};

/**
 * Generate biometric pattern for a specific time based on health data
 */
export async function getBiometricPattern(hour: number, minute: number): Promise<BiometricPattern> {
  const timeOfDay = hour + minute / 60;
  
  // Safe defaults if HealthKit is unavailable
  let sleepQuality = 70;      // neutral
  let activityLevel = 60;     // moderate
  let stressLevel = 50;       // medium

  try {
    const healthData = await getAppleHealthDataRealOnly();
    const sleepQualityMap = { 'Excellent': 90, 'Good': 75, 'Fair': 50, 'Poor': 25 };
    sleepQuality = sleepQualityMap[healthData.sleep.sleepQuality as keyof typeof sleepQualityMap] ?? sleepQuality;
    activityLevel = Math.max(0, Math.min(300, healthData.activityRings?.move?.percentage ?? activityLevel));
    stressLevel = Math.round(((healthData.mood?.stressLevel ?? 5) / 10) * 100);
  } catch (e) {
    // Use defaults; keep interpolation working without HealthKit
  }
  
  // Heart rate variability pattern (higher in morning, lower at night)
  const hrvPattern = Math.sin((timeOfDay / 24) * Math.PI * 2) * 20 + 60;
  const heartRateVariability = Math.max(0, Math.min(100, hrvPattern + (sleepQuality - 70) * 0.5));
  
  return {
    heartRateVariability,
    sleepQuality,
    activityLevel,
    stressLevel,
    timeOfDay,
  };
}

/**
 * Calculate natural energy pattern for time of day
 * Based on circadian rhythm research
 */
export function getNaturalEnergyPattern(hour: number, minute: number): number {
  const timeOfDay = hour + minute / 60;
  
  // Natural energy patterns (inverted for burnout - high energy = low burnout)
  let pattern = 0;
  
  // Morning energy rise (6-10 AM): Energy increases
  if (timeOfDay >= 6 && timeOfDay <= 10) {
    pattern = -15 * Math.sin(((timeOfDay - 6) / 4) * Math.PI);
  }
  // Midday energy (10 AM - 2 PM): Peak energy
  else if (timeOfDay > 10 && timeOfDay <= 14) {
    pattern = -15;
  }
  // Afternoon dip (2-4 PM): Energy decreases
  else if (timeOfDay > 14 && timeOfDay <= 16) {
    pattern = -15 + 10 * Math.sin(((timeOfDay - 14) / 2) * Math.PI);
  }
  // Evening energy (4-8 PM): Moderate energy
  else if (timeOfDay > 16 && timeOfDay <= 20) {
    pattern = -5;
  }
  // Night decline (8 PM - 12 AM): Decreasing energy
  else if (timeOfDay > 20 || timeOfDay <= 6) {
    const nightTime = timeOfDay > 20 ? timeOfDay - 20 : timeOfDay + 4;
    pattern = 5 + 10 * (nightTime / 10);
  }
  
  return pattern;
}

/**
 * Calculate burnout prediction based on biometric data
 */
export function calculateBiometricBurnout(
  pattern: BiometricPattern,
  baselineBurnout: number,
  config: InterpolationConfig
): number {
  let prediction = baselineBurnout;
  
  // Apply biometric influences
  if (config.biometricWeight > 0) {
    const biometricWeight = config.biometricWeight;
    
    // Heart rate variability: Higher HRV = lower burnout
    const hrvInfluence = (pattern.heartRateVariability - 50) * -0.3;
    
    // Sleep quality: Better sleep = lower burnout
    const sleepInfluence = (pattern.sleepQuality - 70) * -0.2;
    
    // Activity level: Moderate activity helps, too much increases burnout
    const optimalActivity = 60;
    const activityInfluence = -Math.abs(pattern.activityLevel - optimalActivity) * 0.1;
    
    // Stress level: Higher stress = higher burnout
    const stressInfluence = (pattern.stressLevel - 30) * 0.25;
    
    prediction += (hrvInfluence + sleepInfluence + activityInfluence + stressInfluence) * biometricWeight;
  }
  
  // Apply natural energy patterns
  if (config.naturalPatterns) {
    const naturalPattern = getNaturalEnergyPattern(
      Math.floor(pattern.timeOfDay),
      (pattern.timeOfDay % 1) * 60
    );
    prediction += naturalPattern * 0.5;
  }
  
  // Ensure reasonable bounds
  return Math.max(0, Math.min(100, prediction));
}

/**
 * Smart interpolation between two data points using biometric data
 */
export async function interpolateBetweenPoints(
  startPoint: BurnoutDataPoint,
  endPoint: BurnoutDataPoint,
  minutesToFill: number,
  config: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG
): Promise<BurnoutDataPoint[]> {
  const interpolatedPoints: BurnoutDataPoint[] = [];
  
  if (minutesToFill <= 0) return interpolatedPoints;
  
  const startHour = startPoint.hour || 0;
  const startMinute = startPoint.minute || 0;
  const totalMinutes = startHour * 60 + startMinute;
  
  for (let i = 1; i <= minutesToFill; i++) {
    const currentMinute = totalMinutes + i;
    const hour = Math.floor(currentMinute / 60) % 24;
    const minute = currentMinute % 60;
    
    // Get biometric pattern for this time
    const biometricPattern = await getBiometricPattern(hour, minute);
    
    // Linear interpolation between points as baseline
    const progress = i / (minutesToFill + 1);
    const linearInterpolation = startPoint.value + (endPoint.value - startPoint.value) * progress;
    
    // Apply biometric influence
    const biometricPrediction = calculateBiometricBurnout(
      biometricPattern,
      linearInterpolation,
      config
    );
    
    // Smooth the prediction
    const smoothedValue = config.preserveAnchors
      ? linearInterpolation + (biometricPrediction - linearInterpolation) * config.smoothingFactor
      : biometricPrediction;
    
    interpolatedPoints.push({
      value: Math.round(smoothedValue * 10) / 10, // Round to 1 decimal place
      label: i % 60 === 0 ? `${hour % 12 || 12}${hour >= 12 ? 'p' : 'a'}` : '',
      hasData: false, // Mark as interpolated
      hour,
      minute,
    });
  }
  
  return interpolatedPoints;
}

/**
 * Fill gaps in Today's minute data with smart biometric interpolation
 */
export async function fillTodayDataGaps(
  originalData: BurnoutDataPoint[],
  config: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG
): Promise<BurnoutDataPoint[]> {
  if (originalData.length === 0) return originalData;
  
  const filledData: BurnoutDataPoint[] = [];
  const realDataPoints = originalData.filter(point => point.hasData);
  
  if (realDataPoints.length === 0) {
    // No real data - use baseline patterns
    return originalData;
  }
  
  if (realDataPoints.length === 1) {
    // Only one real point - extrapolate from it
    const basePoint = realDataPoints[0];
    
    for (const point of originalData) {
      if (point.hasData) {
        filledData.push(point);
      } else {
        const biometricPattern = await getBiometricPattern(point.hour || 0, point.minute || 0);
        const predictedValue = calculateBiometricBurnout(biometricPattern, basePoint.value, config);
        
        filledData.push({
          ...point,
          value: Math.round(predictedValue * 10) / 10,
          hasData: false, // Keep as interpolated
        });
      }
    }
    
    return filledData;
  }
  
  // Multiple real points - interpolate between them
  
  let currentRealIndex = 0;
  
  for (let i = 0; i < originalData.length; i++) {
    const currentPoint = originalData[i];
    
    if (currentPoint.hasData) {
      // Real data point - keep as is
      filledData.push(currentPoint);
      
      // Find next real data point
      const nextRealIndex = realDataPoints.findIndex(
        (realPoint, idx) => idx > currentRealIndex && 
        realPoint.hour === currentPoint.hour && 
        realPoint.minute === currentPoint.minute
      );
      
      if (nextRealIndex !== -1) {
        currentRealIndex = nextRealIndex;
      }
    } else {
      // Gap to fill - find nearest real points
      const prevReal = realDataPoints[currentRealIndex];
      const nextReal = realDataPoints[currentRealIndex + 1];
      
      if (prevReal && nextReal) {
        // Interpolate between two real points
        const prevMinute = (prevReal.hour || 0) * 60 + (prevReal.minute || 0);
        const nextMinute = (nextReal.hour || 0) * 60 + (nextReal.minute || 0);
        const currentMinute = (currentPoint.hour || 0) * 60 + (currentPoint.minute || 0);
        
        const progress = (currentMinute - prevMinute) / (nextMinute - prevMinute);
        const linearValue = prevReal.value + (nextReal.value - prevReal.value) * progress;
        
        const biometricPattern = await getBiometricPattern(
          currentPoint.hour || 0,
          currentPoint.minute || 0
        );
        const biometricValue = calculateBiometricBurnout(biometricPattern, linearValue, config);
        
        const finalValue = config.preserveAnchors
          ? linearValue + (biometricValue - linearValue) * config.smoothingFactor
          : biometricValue;
        
        filledData.push({
          ...currentPoint,
          value: Math.round(finalValue * 10) / 10,
          hasData: false,
        });
      } else if (prevReal) {
        // Extrapolate from last real point
        const biometricPattern = await getBiometricPattern(
          currentPoint.hour || 0,
          currentPoint.minute || 0
        );
        const predictedValue = calculateBiometricBurnout(biometricPattern, prevReal.value, config);
        
        filledData.push({
          ...currentPoint,
          value: Math.round(predictedValue * 10) / 10,
          hasData: false,
        });
      } else {
        // No context - keep original
        filledData.push(currentPoint);
      }
    }
  }
  
  return filledData;
}
