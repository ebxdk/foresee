// Burnout Calculation Utility
// Converts EPC scores to burnout percentage

import { getGreenToOrangeGradient } from './colorUtils';
import { EPCScores } from './epcScoreCalc';

/**
 * Calculate burnout percentage from EPC scores
 * @param energy Energy score (0-100)
 * @param purpose Purpose score (0-100) 
 * @param connection Connection score (0-100)
 * @returns Burnout percentage (0-100, where higher = more burnout risk)
 */
export function calculateBurnout(energy: number, purpose: number, connection: number): number {
  // Validate inputs
  if (energy < 0 || energy > 100 || purpose < 0 || purpose > 100 || connection < 0 || connection > 100) {
    throw new Error('All EPC scores must be between 0 and 100');
  }

  // Calculate average EPC score
  const averageEPC = (energy + purpose + connection) / 3;
  
  // Convert to burnout risk (inverse relationship)
  // High EPC scores = Low burnout risk
  // Low EPC scores = High burnout risk
  const burnoutPercentage = Math.round(100 - averageEPC);
  
  return Math.max(0, Math.min(100, burnoutPercentage));
}

/**
 * Calculate burnout from EPCScores object
 */
export function calculateBurnoutFromScores(scores: EPCScores): number {
  return calculateBurnout(scores.energy, scores.purpose, scores.connection);
}

/**
 * Get burnout risk level and color
 */
export function getBurnoutRiskLevel(burnoutPercentage: number): {
  level: 'Low' | 'Moderate' | 'High';
  color: string;
  description: string;
} {
  const color = getGreenToOrangeGradient(burnoutPercentage);

  if (burnoutPercentage <= 30) {
    return {
      level: 'Low',
      color,
      description: 'You\'re managing stress well and maintaining good balance.'
    };
  } else if (burnoutPercentage <= 60) {
    return {
      level: 'Moderate', 
      color,
      description: 'Some signs of stress. Consider taking breaks and focusing on self-care.'
    };
  } else {
    return {
      level: 'High',
      color,
      description: 'High stress levels detected. Priority should be on recovery and rest.'
    };
  }
} 