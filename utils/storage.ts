// Storage Utility
// Handles persistent storage of EPC scores and app state

import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBurnoutFromScores } from './burnoutCalc';
import { EPCScores, calculateEPCFromCapacityAssessment, calculateEPCScores } from './epcScoreCalc';
import { ErrorHandler } from './errorHandler';
import {
    getCurrentSleepStatus,
    learnFromUserActivity
} from './mockSleepSystem';

// Storage keys
const STORAGE_KEYS = {
  EPC_SCORES: 'epc_scores',
  LAST_UPDATED: 'last_updated',
  USER_STATE: 'user_state',
  DAILY_TASKS: 'daily_tasks',
  TASK_COMPLETION: 'task_completion',
  BURNOUT_HISTORY: 'burnout_history',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ONBOARDING_ANSWERS: 'onboarding_answers',
  TOOL_USAGE_PREFIX: 'tool_usage_', // Prefix for tool usage data
  LAST_ENERGY_DECAY: 'last_energy_decay', // Track when energy was last decayed
  DAILY_ACTIVITY: 'daily_activity', // Store daily activity data for decay calculations
  TOOL_USAGE: 'tool_usage', // New key for consolidated tool usage
  ENERGY_BUFFER: 'energy_buffer', // Key for energy buffer storage
  SCORE_TAILS: 'score_tails', // Key for score tails storage
  HOURLY_BURNOUT: 'hourly_burnout', // Key for hourly burnout data
  MINUTE_BURNOUT: 'minute_burnout', // Key for minute-level burnout data
  // Auth storage keys
  AUTH_SIGNUP_DATA: 'auth_signup_data', // Temporary signup data during flow
  USER_SESSION: 'user_session', // User session token
  CURRENT_USER: 'current_user' // Current user data
} as const;

// Activity-based decay multipliers based on step ranges
const ACTIVITY_DECAY_MULTIPLIERS = {
  SEDENTARY: { minSteps: 0, maxSteps: 2000, multiplier: 1.0 }, // Normal decay
  LIGHT: { minSteps: 2001, maxSteps: 8000, multiplier: 1.2 },  // 20% faster decay
  MODERATE: { minSteps: 8001, maxSteps: 15000, multiplier: 1.5 }, // 50% faster decay
  HIGH: { minSteps: 15001, maxSteps: Infinity, multiplier: 2.0 }  // Double decay
} as const;

// Time-based decay rates (Energy points per hour)
const TIME_BASED_DECAY_RATES = {
  MORNING: { startHour: 6, endHour: 10, rate: 0.5 },    // 6-10 AM: Slow decay
  MIDDAY: { startHour: 10, endHour: 14, rate: 1.0 },    // 10 AM-2 PM: Normal decay
  AFTERNOON: { startHour: 14, endHour: 18, rate: 1.5 }, // 2-6 PM: Faster decay
  EVENING: { startHour: 18, endHour: 22, rate: 2.0 },   // 6-10 PM: Fastest decay
  NIGHT: { startHour: 22, endHour: 6, rate: 0.0 }       // 10 PM-6 AM: No decay (sleeping)
} as const;

// Tool configuration with point values and cooldown hours from the spec
export const TOOL_CONFIG = {
  hydrationHero: {
    boost: { E: 2, P: 0, C: 0 },
    cooldownHours: 2,
    state: 'Fatigued',
    buffer: { duration: 4, multiplier: 0.5 }, // 4h Energy decay slowdown
    tail: null // No tail effect
  },
  postItPriority: {
    boost: { E: 3, P: 1, C: 0 },
    cooldownHours: 4,
    state: 'Fatigued',
    buffer: null,
    tail: { duration: 6, points: { P: 1, C: 0 } } // 6h Purpose fade
  },
  oxygenMask: {
    boost: { E: 3, P: 0, C: 0 },
    cooldownHours: 3,
    state: 'Fatigued',
    buffer: { duration: 6, multiplier: 0.3 }, // 6h Energy decay slowdown
    tail: null
  },
  nourishmentCheck: {
    boost: { E: 3, P: 0, C: 0 },
    cooldownHours: 3,
    state: 'Fatigued',
    buffer: { duration: 3, multiplier: 0.7 }, // 3h Energy decay slowdown
    tail: null
  },
  freshAirFix: {
    boost: { E: 2, P: 0, C: 1 },
    cooldownHours: 2,
    state: 'Fatigued',
    buffer: { duration: 4, multiplier: 0.6 }, // 4h Energy decay slowdown
    tail: { duration: 8, points: { P: 0, C: 1 } } // 8h Connection fade
  },
  phoneFreePause: {
    boost: { E: 2, P: 0, C: 0 },
    cooldownHours: 3,
    state: 'Fatigued',
    buffer: { duration: 5, multiplier: 0.4 }, // 5h Energy decay slowdown
    tail: null
  },
  pleasurePlaylist: {
    boost: { E: 3, P: 0, C: 0 },
    cooldownHours: 4,
    state: 'Indulgent',
    buffer: null,
    tail: { duration: 12, points: { P: 0, C: 0 } } // 12h fade (no P/C points)
  },
  mentalUnload: {
    boost: { E: 6, P: 0, C: 2 },
    cooldownHours: 24,
    state: 'Indulgent',
    buffer: { duration: 12, multiplier: 0.2 }, // 12h Energy decay slowdown
    tail: { duration: 24, points: { P: 0, C: 2 } } // 24h Connection fade
  },
  connectionSpark: {
    boost: { E: 0, P: 0, C: 5 },
    cooldownHours: 12,
    state: 'Indulgent',
    buffer: null,
    tail: { duration: 18, points: { P: 0, C: 5 } } // 18h Connection fade
  },
  sweetSpotScan: {
    boost: { E: 0, P: 2, C: 0 },
    cooldownHours: 8,
    state: 'Indulgent',
    buffer: null,
    tail: { duration: 10, points: { P: 2, C: 0 } } // 10h Purpose fade
  },
  boundaryBuilder: {
    boost: { E: 1, P: 0, C: 3 },
    cooldownHours: 24,
    state: 'Reserved',
    buffer: null,
    tail: { duration: 36, points: { P: 0, C: 3 } } // 36h Connection fade
  },
  scheduleScrub: {
    boost: { E: 2, P: 2, C: 0 },
    cooldownHours: 12,
    state: 'Reserved',
    buffer: null,
    tail: { duration: 16, points: { P: 2, C: 0 } } // 16h Purpose fade
  },
  energyBudgetCheck: {
    boost: { E: 2, P: 1, C: 0 },
    cooldownHours: 12,
    state: 'Reserved',
    buffer: { duration: 8, multiplier: 0.5 }, // 8h Energy decay slowdown
    tail: { duration: 14, points: { P: 1, C: 0 } } // 14h Purpose fade
  },
  gratitudeGuardrail: {
    boost: { E: 1, P: 0, C: 4 },
    cooldownHours: 24,
    state: 'Reserved',
    buffer: null,
    tail: { duration: 48, points: { P: 0, C: 4 } } // 48h Connection fade
  },
  capacityAudit: {
    boost: { E: 2, P: 3, C: 0 },
    cooldownHours: 24,
    state: 'Maximized',
    buffer: null,
    tail: { duration: 30, points: { P: 3, C: 0 } } // 30h Purpose fade
  },
  recoveryRitual: {
    boost: { E: 3, P: 0, C: 0 },
    cooldownHours: 24,
    state: 'Maximized',
    buffer: { duration: 18, multiplier: 0.3 }, // 18h Energy decay slowdown
    tail: null
  },
  teachItForward: {
    boost: { E: 1, P: 2, C: 1 },
    cooldownHours: 12,
    state: 'Maximized',
    buffer: null,
    tail: { duration: 20, points: { P: 2, C: 1 } } // 20h fade
  },
  aimReview: {
    boost: { E: 1, P: 4, C: 0 },
    cooldownHours: 168, // 7 days
    state: 'Maximized',
    buffer: null,
    tail: { duration: 72, points: { P: 4, C: 0 } } // 72h Purpose fade
  }
} as const;

export type ToolId = keyof typeof TOOL_CONFIG;

// Tool usage data structure
export interface ToolUsage {
  lastUsed: string; // ISO timestamp
  pointsEarned: { E: number; P: number; C: number };
  cooldownHours: number;
}

// Buffer system: Temporarily slow Energy decay
export interface EnergyBuffer {
  active: boolean;
  startTime: string; // ISO timestamp
  duration: number; // hours
  multiplier: number; // e.g., 0.5 means 50% slower decay
  source: ToolId; // which tool created this buffer
  endTime: Date; // Timestamp when the buffer expires
}

// Tail system: Gradual fade effects for C/P scores
export interface ScoreTail {
  active: boolean;
  startTime: string; // ISO timestamp
  duration: number; // hours
  initialPoints: { P: number; C: number }; // points that will fade
  source: ToolId; // which tool created this tail
}

// Enhanced EPC scores with buffer/tail tracking
export interface EPCScoresWithEffects extends EPCScores {
  energyBuffer?: EnergyBuffer;
  scoreTails: ScoreTail[];
}

// Daily activity data for energy decay calculations
export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  steps: number;
  activeMinutes: number;
  exerciseMinutes: number;
  lastUpdated: string; // ISO timestamp
}

// Energy decay calculation result
export interface EnergyDecayResult {
  energyLost: number;
  decayRate: number; // points per hour
  activityMultiplier: number;
  timeMultiplier: number;
  bufferActive: boolean;
  bufferMultiplier?: number;
  nextDecayTime: string; // ISO timestamp
}

/**
 * Store EPC scores
 */
export async function storeEPCScores(scores: EPCScores): Promise<void> {
  try {
    // Validate input
    if (!ErrorHandler.validateEPCScores(scores)) {
      throw new Error('Invalid EPC scores provided');
    }

    const data = {
      ...scores,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.EPC_SCORES, JSON.stringify(data));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
    console.log('✅ EPC scores stored successfully:', scores);
  } catch (error) {
    ErrorHandler.handleError(error, 'storeEPCScores');
    throw error;
  }
}

/**
 * Retrieve EPC scores
 */
export async function getEPCScores(): Promise<EPCScores | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EPC_SCORES);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        energy: parsed.energy,
        purpose: parsed.purpose,
        connection: parsed.connection
      };
    }

    // Attempt to rebuild scores from stored onboarding or capacity answers
    const [onboardingData, capacityData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_ANSWERS),
      AsyncStorage.getItem('capacity_answers')
    ]);

    if (onboardingData) {
      const parsed = JSON.parse(onboardingData);
      const answers: number[] | undefined = parsed?.answers;
      if (Array.isArray(answers) && answers.length === 5 && answers.every(value => typeof value === 'number')) {
        const rebuiltScores = calculateEPCScores(answers);
        await storeEPCScores(rebuiltScores);
        return rebuiltScores;
      }
    }

    if (capacityData) {
      const parsed = JSON.parse(capacityData);
      const answers: string[] | undefined = parsed?.answers;
      if (Array.isArray(answers) && answers.length === 10 && answers.every(value => typeof value === 'string' && value.length > 0)) {
        const rebuiltScores = calculateEPCFromCapacityAssessment(answers);
        await storeEPCScores(rebuiltScores);
        return rebuiltScores;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving EPC scores:', error);
    return null;
  }
}

/**
 * Update EPC scores by applying tool points with global rules, buffers, and tails
 * This function ensures tool completion always results in EPC score updates
 */
export async function updateEPCScoresFromTool(toolId: ToolId, pointsEarned: { E: number; P: number; C: number }): Promise<void> {
  try {
    console.log(`🔄 Updating EPC scores for tool: ${toolId}`);
    console.log(`📊 Base points to apply:`, pointsEarned);
    
    // Get current EPC scores
    const currentScores = await getEPCScores();
    if (!currentScores) {
      throw new Error('Failed to get current EPC scores');
    }
    
    console.log(`📈 Current EPC scores:`, currentScores);
    
    // Check current buffer and tail status
    const currentBuffer = await getEnergyBuffer();
    const currentTails = await getScoreTails();
    
    if (currentBuffer) {
      console.log(`🛡️ Active Energy buffer: ${currentBuffer.multiplier}x decay slowdown, ${Math.ceil((new Date().getTime() - new Date(currentBuffer.startTime).getTime()) / (1000 * 60 * 60))}h elapsed`);
    }
    
    if (currentTails.activeTails.length > 0) {
      console.log(`🌊 Active Score tails: ${currentTails.activeTails.length} active, +${currentTails.currentImpact.P}P +${currentTails.currentImpact.C}C remaining`);
    }
    
    // Apply global rules to points
    let adjustedPoints = { ...pointsEarned };
    let rulesApplied: string[] = [];
    
    // Rule 1: Saturation (×0.7 when any battery >90)
    if (currentScores.energy > 90 || currentScores.purpose > 90 || currentScores.connection > 90) {
      adjustedPoints = {
        E: Math.round(adjustedPoints.E * 0.7),
        P: Math.round(adjustedPoints.P * 0.7),
        C: Math.round(adjustedPoints.C * 0.7)
      };
      rulesApplied.push('Saturation ×0.7 (battery >90)');
      console.log(`🌊 Saturation rule applied: ${pointsEarned.E}→${adjustedPoints.E} E, ${pointsEarned.P}→${adjustedPoints.P} P, ${pointsEarned.C}→${adjustedPoints.C} C`);
    }
    
    // Rule 2: Low-state Amplifier (×1.2 when any battery <70 for 2+ days)
    // For now, we'll implement a simplified version that checks current state
    // In a full implementation, we'd track how long each battery has been <70
    if (currentScores.energy < 70 || currentScores.purpose < 70 || currentScores.connection < 70) {
      adjustedPoints = {
        E: Math.round(adjustedPoints.E * 1.2),
        P: Math.round(adjustedPoints.P * 1.2),
        C: Math.round(adjustedPoints.C * 1.2)
      };
      rulesApplied.push('Low-state Amplifier ×1.2 (battery <70)');
      console.log(`⚡ Low-state amplifier applied: ${pointsEarned.E}→${adjustedPoints.E} E, ${pointsEarned.P}→${adjustedPoints.P} P, ${pointsEarned.C}→${adjustedPoints.C} C`);
    }
    
    if (rulesApplied.length > 0) {
      console.log(`🎯 Global rules applied: ${rulesApplied.join(', ')}`);
    } else {
      console.log(`✅ No global rules applied - using base points`);
    }
    
    // Calculate new scores with bounds (0-100)
    const newScores: EPCScores = {
      energy: Math.max(0, Math.min(100, currentScores.energy + adjustedPoints.E)),
      purpose: Math.max(0, Math.min(100, currentScores.purpose + adjustedPoints.P)),
      connection: Math.max(0, Math.min(100, currentScores.connection + adjustedPoints.C))
    };
    
    console.log(`📈 New EPC scores:`, newScores);
    
    // Calculate score changes
    const scoreChanges = {
      E: newScores.energy - currentScores.energy,
      P: newScores.purpose - currentScores.purpose,
      C: newScores.connection - currentScores.connection
    };
    
    console.log(`📊 Final score changes:`, scoreChanges);
    
    // Create buffer and tail effects based on tool configuration
    const toolConfig = TOOL_CONFIG[toolId];
    let effectsCreated: string[] = [];
    
    // Create Energy buffer if configured
    if (toolConfig.buffer) {
      await createEnergyBuffer(toolId, toolConfig.buffer.duration, toolConfig.buffer.multiplier);
      effectsCreated.push(`Energy buffer (${toolConfig.buffer.duration}h, ${toolConfig.buffer.multiplier}x decay slowdown)`);
    }
    
    // Create Score tail if configured
    if (toolConfig.tail) {
      await createScoreTail(toolId, toolConfig.tail.duration, toolConfig.tail.points);
      effectsCreated.push(`Score tail (${toolConfig.tail.duration}h fade for ${toolConfig.tail.points.P}P + ${toolConfig.tail.points.C}C)`);
    }
    
    if (effectsCreated.length > 0) {
      console.log(`✨ Effects created: ${effectsCreated.join(', ')}`);
    }
    
    // Store updated scores
    await storeEPCScores(newScores);
    
    // Store hourly burnout data for the current hour
    const currentHour = new Date().getHours();
    const currentBurnout = calculateBurnoutFromScores(newScores);
    await storeHourlyBurnoutData(currentHour, currentBurnout);
    
    console.log(`✅ EPC scores updated successfully for tool: ${toolId}`);
    console.log(`📊 Hourly burnout stored: ${currentHour}:00 = ${currentBurnout}%`);
    console.log(`🎯 Tool completion flow: ${toolId} → Base points → Global rules → Effects created → EPC updated → Home page will reflect changes`);
    
  } catch (error) {
    console.error(`❌ Error updating EPC scores for tool ${toolId}:`, error);
    throw error; // Re-throw to ensure tool completion fails if EPC update fails
  }
}

/**
 * Store onboarding completion status
 */
export async function setOnboardingComplete(complete: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete.toString());
  } catch (error) {
    console.error('Error storing onboarding status:', error);
    throw error;
  }
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Store onboarding answers
 */
export async function storeOnboardingAnswers(answers: number[]): Promise<void> {
  try {
    const data = {
      answers,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_ANSWERS, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing onboarding answers:', error);
    throw error;
  }
}

/**
 * Get onboarding answers
 */
export async function getOnboardingAnswers(): Promise<number[] | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_ANSWERS);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.answers;
  } catch (error) {
    console.error('Error retrieving onboarding answers:', error);
    return null;
  }
}

/**
 * Store burnout history for trend analysis
 */
export async function storeBurnoutHistory(burnoutPercentage: number): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.BURNOUT_HISTORY);
    let history: Array<{ date: string; burnout: number }> = [];
    
    if (existingData) {
      history = JSON.parse(existingData);
    }
    
    // Add new entry
    history.push({
      date: new Date().toISOString(),
      burnout: burnoutPercentage
    });
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    history = history.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    
    await AsyncStorage.setItem(STORAGE_KEYS.BURNOUT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error storing burnout history:', error);
    throw error;
  }
}

/**
 * Get burnout history
 */
export async function getBurnoutHistory(): Promise<Array<{ date: string; burnout: number }>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BURNOUT_HISTORY);
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving burnout history:', error);
    return [];
  }
}

/**
 * Get recent burnout levels for trend analysis
 */
export async function getRecentBurnoutLevels(days: number = 7): Promise<number[]> {
  try {
    const history = await getBurnoutHistory();
    
    // Get entries from the last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = history
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => entry.burnout);
    
    return recentEntries;
  } catch (error) {
    console.error('Error retrieving recent burnout levels:', error);
    return [];
  }
}

/**
 * Clear all stored data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

/**
 * Get when EPC scores were last updated
 */
export async function getLastUpdated(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Error getting last updated timestamp:', error);
    return null;
  }
} 

/**
 * Store capacity assessment answers (10 questions)
 */
export async function storeCapacityAnswers(answers: string[]): Promise<void> {
  try {
    const data = {
      answers,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem('capacity_answers', JSON.stringify(data));
  } catch (error) {
    console.error('Error storing capacity answers:', error);
    throw error;
  }
}

/**
 * Get capacity assessment answers
 */
export async function getCapacityAnswers(): Promise<string[] | null> {
  try {
    const data = await AsyncStorage.getItem('capacity_answers');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.answers;
  } catch (error) {
    console.error('Error retrieving capacity answers:', error);
    return null;
  }
}

/**
 * Store user capacity state
 */
export async function storeUserState(state: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued'): Promise<void> {
  try {
    const data = {
      state,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing user state:', error);
    throw error;
  }
}

/**
 * Get user capacity state
 */
export async function getUserState(): Promise<'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.state;
  } catch (error) {
    console.error('Error retrieving user state:', error);
    return null;
  }
}

/**
 * Store daily AI-generated wellness tasks
 */
export async function storeDailyTasks(tasks: string[], completedStates?: boolean[]): Promise<void> {
  try {
    const data = {
      tasks,
      completed: completedStates || new Array(tasks.length).fill(false),
      date: new Date().toDateString(), // Store with date for daily refresh
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing daily tasks:', error);
    throw error;
  }
}

/**
 * Get daily AI-generated wellness tasks
 */
export async function getDailyTasks(): Promise<{ tasks: string[]; completed: boolean[]; date: string } | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return {
      tasks: parsed.tasks,
      completed: parsed.completed || new Array(parsed.tasks.length).fill(false),
      date: parsed.date
    };
  } catch (error) {
    console.error('Error retrieving daily tasks:', error);
    return null;
  }
}

/**
 * Update task completion state
 */
export async function updateTaskCompletion(completedStates: boolean[]): Promise<void> {
  try {
    const storedTasks = await getDailyTasks();
    if (!storedTasks) return;
    
    const data = {
      tasks: storedTasks.tasks,
      completed: completedStates,
      date: storedTasks.date,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(data));
  } catch (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
}

/**
 * Check if daily tasks need to be regenerated (new day)
 */
export async function shouldRegenerateTasks(): Promise<boolean> {
  try {
    const storedTasks = await getDailyTasks();
    if (!storedTasks) return true;
    
    const today = new Date().toDateString();
    return storedTasks.date !== today;
  } catch (error) {
    console.error('Error checking task regeneration:', error);
    return true;
  }
}

/**
 * Store tool usage with automatic buffer and tail creation
 */
export async function storeToolUsage(toolId: ToolId, pointsEarned: { E: number; P: number; C: number }): Promise<void> {
  try {
    // Validate input
    if (!ErrorHandler.validateToolId(toolId)) {
      throw new Error(`Invalid tool ID: ${toolId}`);
    }

    if (!pointsEarned || typeof pointsEarned !== 'object') {
      throw new Error('Invalid points data provided');
    }

    if (typeof pointsEarned.E !== 'number' || typeof pointsEarned.P !== 'number' || typeof pointsEarned.C !== 'number') {
      throw new Error('Invalid points values provided');
    }

    const now = new Date();
    const toolConfig = TOOL_CONFIG[toolId];
    
    // Store the tool usage
    const toolUsage: ToolUsage = {
      lastUsed: now.toISOString(),
      pointsEarned,
      cooldownHours: toolConfig.cooldownHours
    };
    
    // Get existing tool usage
    const existingUsage = await getToolUsage();
    const updatedUsage = {
      ...existingUsage,
      [toolId]: toolUsage
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.TOOL_USAGE, JSON.stringify(updatedUsage));

    console.log(`✅ Tool usage stored for ${toolId}:`, toolUsage);

    // Check if tool has buffer or tail configuration
    if (toolConfig) {
      if (toolConfig.buffer) {
        console.log(`🛡️ Creating energy buffer for ${toolId}...`);
        await createEnergyBuffer(toolId, toolConfig.buffer.duration, toolConfig.buffer.multiplier);
      }
      
      if (toolConfig.tail) {
        console.log(`🌊 Creating score tail for ${toolId}...`);
        await createScoreTail(toolId, toolConfig.tail.duration, toolConfig.tail.points);
      }
    }

  } catch (error) {
    ErrorHandler.handleError(error, 'storeToolUsage');
    throw error;
  }
}

/**
 * Get tool usage data
 */
export async function getToolUsage(toolId?: ToolId): Promise<Record<string, ToolUsage> | ToolUsage | null> {
  try {
    if (toolId) {
      // Get specific tool usage from consolidated storage
      const allUsage = await AsyncStorage.getItem(STORAGE_KEYS.TOOL_USAGE);
      if (!allUsage) return null;
      
      const usageData = JSON.parse(allUsage) as Record<string, ToolUsage>;
      return usageData[toolId] || null;
    } else {
      // Get all tool usage
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TOOL_USAGE);
      return data ? JSON.parse(data) : {};
    }
  } catch (error) {
    console.error('Error retrieving tool usage:', error);
    return null;
  }
}

/**
 * Calculate effective points for a tool based on cooldown
 * Returns scaled points and cooldown status
 */
export function calculateToolEffectiveness(toolId: ToolId, lastUsage: ToolUsage | null): {
  effectivePoints: { E: number; P: number; C: number };
  cooldownRemaining: number; // hours remaining
  isOnCooldown: boolean;
  effectivenessPercentage: number; // 0-100% of full effect
} {
  const toolConfig = TOOL_CONFIG[toolId];
  const basePoints = toolConfig.boost;
  
  if (!lastUsage) {
    // First time use - full points
    return {
      effectivePoints: basePoints,
      cooldownRemaining: 0,
      isOnCooldown: false,
      effectivenessPercentage: 100
    };
  }
  
  const now = new Date();
  const lastUsed = new Date(lastUsage.lastUsed);
  const hoursSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
  const cooldownHours = toolConfig.cooldownHours;
  
  if (hoursSinceLastUse >= cooldownHours) {
    // Cooldown complete - full points
    return {
      effectivePoints: basePoints,
      cooldownRemaining: 0,
      isOnCooldown: false,
      effectivenessPercentage: 100
    };
  }
  
  // On cooldown - calculate scaled points
  const effectivenessRatio = Math.min(1, hoursSinceLastUse / cooldownHours);
  const effectivenessPercentage = Math.round(effectivenessRatio * 100);
  
  const effectivePoints = {
    E: Math.round(basePoints.E * effectivenessRatio),
    P: Math.round(basePoints.P * effectivenessRatio),
    C: Math.round(basePoints.C * effectivenessRatio)
  };
  
  const cooldownRemaining = Math.ceil(cooldownHours - hoursSinceLastUse);
  
  return {
    effectivePoints,
    cooldownRemaining,
    isOnCooldown: true,
    effectivenessPercentage
  };
}

/**
 * Get tool cooldown status and effective points
 */
export async function getToolCooldownStatus(toolId: ToolId): Promise<{
  effectivePoints: { E: number; P: number; C: number };
  cooldownRemaining: number;
  isOnCooldown: boolean;
  effectivenessPercentage: number;
  lastUsed: string | null;
}> {
  try {
    const lastUsage = await getToolUsage(toolId) as ToolUsage | null;
    const effectiveness = calculateToolEffectiveness(toolId, lastUsage);
    
    return {
      ...effectiveness,
      lastUsed: lastUsage?.lastUsed || null
    };
  } catch (error) {
    console.error(`Error getting cooldown status for ${toolId}:`, error);
    // Return full points as fallback
    const toolConfig = TOOL_CONFIG[toolId];
    return {
      effectivePoints: toolConfig.boost,
      cooldownRemaining: 0,
      isOnCooldown: false,
      effectivenessPercentage: 100,
      lastUsed: null
    };
  }
} 

/**
 * Create an Energy buffer (temporarily slow Energy decay)
 */
export async function createEnergyBuffer(
  toolId: ToolId, 
  duration: number, 
  multiplier: number
): Promise<EnergyBuffer> {
  try {
    const buffer: EnergyBuffer = {
      active: true,
      startTime: new Date().toISOString(),
      duration,
      multiplier,
      source: toolId,
      endTime: new Date(Date.now() + duration * 60 * 60 * 1000) // Calculate end time
    };
    
    // Store the buffer
    await AsyncStorage.setItem(STORAGE_KEYS.ENERGY_BUFFER, JSON.stringify(buffer));
    
    console.log(`🛡️ Energy buffer created by ${toolId}: ${duration}h duration, ${multiplier}x decay slowdown`);
    
    return buffer;
    
  } catch (error) {
    console.error('Error creating energy buffer:', error);
    return { active: false, startTime: '', duration: 0, multiplier: 1, source: toolId, endTime: new Date() };
  }
}

/**
 * Create a Score tail (gradual fade for P/C scores)
 */
export async function createScoreTail(
  toolId: ToolId,
  duration: number,
  points: { P: number; C: number }
): Promise<ScoreTail> {
  try {
    const tail: ScoreTail = {
      active: true,
      startTime: new Date().toISOString(),
      duration,
      initialPoints: points,
      source: toolId
    };
    
    // Get existing tails and add new one
    const existingTailsJson = await AsyncStorage.getItem(STORAGE_KEYS.SCORE_TAILS);
    const existingTails: ScoreTail[] = existingTailsJson ? JSON.parse(existingTailsJson) : [];
    
    existingTails.push(tail);
    await AsyncStorage.setItem(STORAGE_KEYS.SCORE_TAILS, JSON.stringify(existingTails));
    
    console.log(`🌊 Score tail created by ${toolId}: ${duration}h duration, ${points.P}P + ${points.C}C will fade gradually`);
    
    return tail;
    
  } catch (error) {
    console.error('Error creating score tail:', error);
    return { active: false, startTime: '', duration: 0, initialPoints: { P: 0, C: 0 }, source: toolId };
  }
}

/**
 * Get current Energy buffer status
 */
export async function getEnergyBuffer(): Promise<EnergyBuffer | null> {
  try {
    const bufferJson = await AsyncStorage.getItem(STORAGE_KEYS.ENERGY_BUFFER);
    if (!bufferJson) return null;
    
    const buffer: EnergyBuffer = JSON.parse(bufferJson);
    
    // Check if buffer is still active
    const now = new Date();
    const startTime = new Date(buffer.startTime);
    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursElapsed >= buffer.duration) {
      // Buffer expired, remove it
      await AsyncStorage.removeItem(STORAGE_KEYS.ENERGY_BUFFER);
      console.log(`⏰ Energy buffer from ${buffer.source} has expired`);
      return null;
    }
    
    const remainingHours = Math.ceil(buffer.duration - hoursElapsed);
    console.log(`🛡️ Energy buffer active: ${remainingHours}h remaining, ${buffer.multiplier}x decay slowdown`);
    
    return buffer;
    
  } catch (error) {
    console.error('Error getting energy buffer:', error);
    return null;
  }
}

/**
 * Get current Score tails and calculate their impact
 */
export async function getScoreTails(): Promise<{ activeTails: ScoreTail[]; currentImpact: { P: number; C: number } }> {
  try {
    const tailsJson = await AsyncStorage.getItem(STORAGE_KEYS.SCORE_TAILS);
    if (!tailsJson) return { activeTails: [], currentImpact: { P: 0, C: 0 } };
    
    const allTails: ScoreTail[] = JSON.parse(tailsJson);
    const now = new Date();
    const activeTails: ScoreTail[] = [];
    let totalP = 0;
    let totalC = 0;
    
    for (const tail of allTails) {
      const startTime = new Date(tail.startTime);
      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed < tail.duration) {
        // Tail is still active, calculate current impact
        const progress = hoursElapsed / tail.duration; // 0 to 1
        const remainingP = Math.round(tail.initialPoints.P * (1 - progress));
        const remainingC = Math.round(tail.initialPoints.C * (1 - progress));
        
        totalP += remainingP;
        totalC += remainingC;
        
        activeTails.push({
          ...tail,
          active: true
        });
      }
    }
    
    // Clean up expired tails
    const updatedTails = allTails.filter(tail => {
      const startTime = new Date(tail.startTime);
      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return hoursElapsed < tail.duration;
    });
    
    await AsyncStorage.setItem(STORAGE_KEYS.SCORE_TAILS, JSON.stringify(updatedTails));
    
    if (activeTails.length > 0) {
      console.log(`🌊 ${activeTails.length} active score tails: +${totalP}P +${totalC}C remaining`);
    }
    
    return {
      activeTails,
      currentImpact: { P: totalP, C: totalC }
    };
    
  } catch (error) {
    console.error('Error getting score tails:', error);
    return { activeTails: [], currentImpact: { P: 0, C: 0 } };
  }
} 

/**
 * Get comprehensive status of all active effects (buffers and tails)
 */
export async function getActiveEffectsStatus(): Promise<{
  energyBuffer: EnergyBuffer | null;
  scoreTails: ScoreTail[];
  summary: string;
}> {
  try {
    const buffer = await getEnergyBuffer();
    const tails = await getScoreTails();
    
    let summary = '';
    
    if (buffer) {
      const elapsedHours = Math.ceil((new Date().getTime() - new Date(buffer.startTime).getTime()) / (1000 * 60 * 60));
      const remainingHours = Math.ceil(buffer.duration - elapsedHours);
      summary += `🛡️ Energy buffer active: ${remainingHours}h remaining, ${buffer.multiplier}x decay slowdown`;
    }
    
    if (tails.activeTails.length > 0) {
      if (summary) summary += '\n';
      summary += `🌊 ${tails.activeTails.length} active score tail(s): +${tails.currentImpact.P}P +${tails.currentImpact.C}C remaining`;
    }
    
    if (!buffer && tails.activeTails.length === 0) {
      summary = '✅ No active effects';
    }
    
    return {
      energyBuffer: buffer,
      scoreTails: tails.activeTails,
      summary
    };
    
  } catch (error) {
    console.error('Error getting active effects status:', error);
    return {
      energyBuffer: null,
      scoreTails: [],
      summary: '❌ Error checking effects status'
    };
  }
} 

/**
 * Store daily activity data for energy decay calculations
 */
export async function storeDailyActivity(activity: Omit<DailyActivity, 'date' | 'lastUpdated'>): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailyActivity: DailyActivity = {
      ...activity,
      date: today,
      lastUpdated: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(dailyActivity));
    console.log(`📊 Daily activity stored: ${activity.steps} steps, ${activity.activeMinutes}min active, ${activity.exerciseMinutes}min exercise`);
  } catch (error) {
    console.error('Error storing daily activity:', error);
    throw error;
  }
}

/**
 * Get today's activity data
 */
export async function getDailyActivity(): Promise<DailyActivity | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
    if (!data) return null;
    
    const activity: DailyActivity = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    
    // Only return if it's today's data
    if (activity.date === today) {
      return activity;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving daily activity:', error);
    return null;
  }
}

/**
 * Calculate activity-based decay multiplier based on step count
 */
function calculateActivityDecayMultiplier(steps: number): number {
  if (steps <= ACTIVITY_DECAY_MULTIPLIERS.SEDENTARY.maxSteps) {
    return ACTIVITY_DECAY_MULTIPLIERS.SEDENTARY.multiplier;
  } else if (steps <= ACTIVITY_DECAY_MULTIPLIERS.LIGHT.maxSteps) {
    return ACTIVITY_DECAY_MULTIPLIERS.LIGHT.multiplier;
  } else if (steps <= ACTIVITY_DECAY_MULTIPLIERS.MODERATE.maxSteps) {
    return ACTIVITY_DECAY_MULTIPLIERS.MODERATE.multiplier;
  } else {
    return ACTIVITY_DECAY_MULTIPLIERS.HIGH.multiplier;
  }
}

/**
 * Calculate time-based decay rate for current hour
 */
function calculateTimeBasedDecayRate(currentHour: number): number {
  for (const [period, config] of Object.entries(TIME_BASED_DECAY_RATES)) {
    if (period === 'NIGHT') {
      // Handle overnight period (22:00 - 06:00)
      if (currentHour >= config.startHour || currentHour < config.endHour) {
        return config.rate;
      }
    } else {
      if (currentHour >= config.startHour && currentHour < config.endHour) {
        return config.rate;
      }
    }
  }
  
  return TIME_BASED_DECAY_RATES.MIDDAY.rate; // Default to midday rate
}

/**
 * Calculate energy decay based on current time, activity, and sleep status
 */
export async function calculateEnergyDecay(): Promise<EnergyDecayResult> {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Get current sleep status from mock sleep system
    const sleepStatus = await getCurrentSleepStatus();
    const isSleeping = sleepStatus.isSleeping;
    
    // Get daily activity data
    const activity = await getDailyActivity();
    if (!activity) {
      return {
        decayRate: 0,
        energyLost: 0,
        activityMultiplier: 1,
        timeMultiplier: 1,
        bufferActive: false,
        nextDecayTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      };
    }
    
    // Calculate activity-based decay multiplier
    const activityMultiplier = calculateActivityDecayMultiplier(activity.steps);
    
    // Calculate time-based decay rate (only when awake)
    let timeMultiplier = 1;
    let baseDecayRate = 0;
    
    if (!isSleeping) {
      timeMultiplier = calculateTimeBasedDecayRate(currentHour);
      baseDecayRate = 0.5; // Base decay rate when awake
    }
    
    // Check for active energy buffers
    const buffer = await getEnergyBuffer();
    const bufferActive = !!(buffer && buffer.endTime > now);
    const bufferMultiplier = bufferActive ? buffer!.multiplier : 1;
    
    // Calculate final decay rate
    const finalDecayRate = baseDecayRate * timeMultiplier * activityMultiplier * bufferMultiplier;
    
    // Calculate next decay time (every hour)
    const nextDecayTime = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Learn from user activity (active if not sleeping)
    await learnFromUserActivity(currentHour, !isSleeping);
    
    return {
      decayRate: finalDecayRate,
      energyLost: 0, // Will be calculated when decay is applied
      activityMultiplier,
      timeMultiplier,
      bufferActive,
      nextDecayTime: nextDecayTime.toISOString(),
    };
  } catch (error) {
    console.error('Error calculating energy decay:', error);
    return {
      decayRate: 0,
      energyLost: 0,
      activityMultiplier: 1,
      timeMultiplier: 1,
      bufferActive: false,
      nextDecayTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
}

/**
 * Apply energy decay to current EPC scores
 */
export async function applyEnergyDecay(): Promise<{
  previousEnergy: number;
  energyLost: number;
  newEnergy: number;
  decayInfo: EnergyDecayResult;
} | null> {
  try {
    const currentScores = await getEPCScores();
    if (!currentScores) {
      console.log('⚠️ No EPC scores found, skipping energy decay (user likely hasn\'t completed onboarding)');
      return null;
    }
    
    const previousEnergy = currentScores.energy;
    const decayInfo = await calculateEnergyDecay();
    
    // Calculate energy lost based on decay rate
    const energyLost = Math.round(decayInfo.decayRate * 100) / 100; // Round to 2 decimal places
    
    // Calculate new energy level
    const newEnergy = Math.max(0, Math.min(100, previousEnergy - energyLost));
    
    // Update EPC scores with new energy level
    const updatedScores: EPCScores = {
      ...currentScores,
      energy: newEnergy
    };
    
    await storeEPCScores(updatedScores);
    
    // Store hourly burnout data for the current hour
    const currentHour = new Date().getHours();
    const currentBurnout = calculateBurnoutFromScores(updatedScores);
    await storeHourlyBurnoutData(currentHour, currentBurnout);
    
    console.log(`⚡ Energy decay applied: ${previousEnergy} → ${newEnergy} (lost ${energyLost})`);
    console.log(`📊 Decay details:`, {
      rate: decayInfo.decayRate,
      timeMultiplier: decayInfo.timeMultiplier,
      activityMultiplier: decayInfo.activityMultiplier,
      bufferActive: decayInfo.bufferActive,
    });
    console.log(`📊 Hourly burnout stored: ${currentHour}:00 = ${currentBurnout}%`);
    
    return {
      previousEnergy,
      energyLost,
      newEnergy,
      decayInfo
    };
    
  } catch (error) {
    console.error('Error applying energy decay:', error);
    throw error;
  }
}

/**
 * Check if energy decay is due and apply it
 */
export async function checkAndApplyEnergyDecay(): Promise<{
  decayApplied: boolean;
  energyLost: number;
  newEnergy: number;
}> {
  try {
    const lastDecayStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ENERGY_DECAY);
    const lastDecay = lastDecayStr ? new Date(lastDecayStr) : null;
    const now = new Date();
    
    // If no previous decay or more than 1 hour has passed, apply decay
    if (!lastDecay || (now.getTime() - lastDecay.getTime()) >= 60 * 60 * 1000) {
      const result = await applyEnergyDecay();
      if (result) {
        return {
          decayApplied: true,
          energyLost: result.energyLost,
          newEnergy: result.newEnergy,
        };
      } else {
        // No EPC scores to apply decay to
        return {
          decayApplied: false,
          energyLost: 0,
          newEnergy: 0,
        };
      }
    }
    
    return {
      decayApplied: false,
      energyLost: 0,
      newEnergy: 0,
    };
  } catch (error) {
    console.error('Error checking and applying energy decay:', error);
    return {
      decayApplied: false,
      energyLost: 0,
      newEnergy: 0,
    };
  }
}

/**
 * Get energy decay status and next decay time
 */
export async function getEnergyDecayStatus(): Promise<{
  lastDecay: string | null;
  nextDecay: string | null;
  isDecayDue: boolean;
  hoursUntilDecay: number;
  currentDecayRate: number;
  activityMultiplier: number;
  bufferActive: boolean;
}> {
  try {
    const lastDecayStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ENERGY_DECAY);
    const lastDecay = lastDecayStr ? new Date(lastDecayStr) : null;
    const now = new Date();
    
    if (!lastDecay) {
      return {
        lastDecay: null,
        nextDecay: null,
        isDecayDue: true,
        hoursUntilDecay: 0,
        currentDecayRate: 0,
        activityMultiplier: 1.0,
        bufferActive: false
      };
    }
    
    const hoursSinceLastDecay = (now.getTime() - lastDecay.getTime()) / (1000 * 60 * 60);
    const isDecayDue = hoursSinceLastDecay >= 1;
    const hoursUntilDecay = Math.max(0, 1 - hoursSinceLastDecay);
    
    // Get current decay rate info
    const activity = await getDailyActivity();
    const steps = activity?.steps || 0;
    const activityMultiplier = calculateActivityDecayMultiplier(steps);
    const timeMultiplier = calculateTimeBasedDecayRate(new Date().getHours()); // Pass current hour
    const buffer = await getEnergyBuffer();
    const bufferActive = !!buffer;
    
    let currentDecayRate = timeMultiplier * activityMultiplier;
    if (bufferActive && buffer?.multiplier) {
      currentDecayRate *= buffer.multiplier;
    }
    
    const nextDecay = new Date(lastDecay.getTime() + 60 * 60 * 1000);
    
    return {
      lastDecay: lastDecay.toISOString(),
      nextDecay: nextDecay.toISOString(),
      isDecayDue,
      hoursUntilDecay: Math.round(hoursUntilDecay * 100) / 100,
      currentDecayRate: Math.round(currentDecayRate * 100) / 100,
      activityMultiplier,
      bufferActive
    };
    
  } catch (error) {
    console.error('Error getting energy decay status:', error);
    return {
      lastDecay: null,
      nextDecay: null,
      isDecayDue: false,
      hoursUntilDecay: 0,
      currentDecayRate: 0,
      activityMultiplier: 1.0,
      bufferActive: false
    };
  }
} 

/**
 * Apply sleep quality adjustments to morning energy level
 * This affects starting energy, not decay rate
 */
export async function applySleepQualityAdjustment(sleepQuality: number, sleepHours: number): Promise<{
  previousEnergy: number;
  sleepBonus: number;
  newEnergy: number;
} | null> {
  try {
    const currentScores = await getEPCScores();
    if (!currentScores) {
      console.log('⚠️ No EPC scores found, skipping sleep adjustment (user likely hasn\'t completed onboarding)');
      return null;
    }
    
    const previousEnergy = currentScores.energy;
    
    // Calculate sleep bonus/penalty based on quality and duration
    let sleepBonus = 0;
    
    if (sleepQuality >= 4 && sleepHours >= 8) {
      sleepBonus = 15; // Excellent sleep
    } else if (sleepQuality >= 3 && sleepHours >= 7) {
      sleepBonus = 10; // Good sleep
    } else if (sleepQuality >= 2 && sleepHours >= 6) {
      sleepBonus = 5;  // Fair sleep
    } else if (sleepHours < 6) {
      sleepBonus = -15; // Sleep deprivation penalty
    } else if (sleepQuality <= 2) {
      sleepBonus = -10; // Poor sleep quality penalty
    }
    
    // Calculate new energy level
    const newEnergy = Math.max(0, Math.min(100, previousEnergy + sleepBonus));
    
    // Update EPC scores
    const updatedScores: EPCScores = {
      ...currentScores,
      energy: newEnergy
    };
    
    await storeEPCScores(updatedScores);
    
    console.log(`😴 Sleep adjustment applied: ${previousEnergy} → ${newEnergy} (${sleepBonus > 0 ? '+' : ''}${sleepBonus})`);
    
    return {
      previousEnergy,
      sleepBonus,
      newEnergy
    };
    
  } catch (error) {
    console.error('Error applying sleep quality adjustment:', error);
    throw error;
  }
} 

/**
 * Apply score tail effects over time (gradual fade of P/C scores)
 */
export async function applyScoreTailEffects(): Promise<{
  tailsApplied: number;
  totalPointsFaded: { P: number; C: number };
}> {
  try {
    const tails = await getScoreTails();
    let tailsApplied = 0;
    let totalPointsFaded = { P: 0, C: 0 };
    
    if (tails.activeTails.length === 0) {
      return { tailsApplied: 0, totalPointsFaded: { P: 0, C: 0 } };
    }
    
    const now = new Date();
    const updatedTails: ScoreTail[] = [];
    
    for (const tail of tails.activeTails) {
      const startTime = new Date(tail.startTime);
      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed >= tail.duration) {
        // Tail expired, remove it
        console.log(`⏰ Score tail from ${tail.source} has expired`);
        continue;
      }
      
      // Calculate remaining points based on time elapsed
      const progressRatio = hoursElapsed / tail.duration;
      const remainingPoints = {
        P: Math.max(0, Math.round(tail.initialPoints.P * (1 - progressRatio))),
        C: Math.max(0, Math.round(tail.initialPoints.C * (1 - progressRatio)))
      };
      
      // Calculate points faded this hour
      const pointsFaded = {
        P: tail.initialPoints.P - remainingPoints.P,
        C: tail.initialPoints.C - remainingPoints.C
      };
      
      totalPointsFaded.P += pointsFaded.P;
      totalPointsFaded.C += pointsFaded.C;
      tailsApplied++;
      
      // Update tail with remaining points
      const updatedTail: ScoreTail = {
        ...tail,
        initialPoints: remainingPoints
      };
      
      updatedTails.push(updatedTail);
      
      if (pointsFaded.P > 0 || pointsFaded.C > 0) {
        console.log(`🌊 Score tail from ${tail.source}: ${pointsFaded.P}P + ${pointsFaded.C}C faded, ${remainingPoints.P}P + ${remainingPoints.C}C remaining`);
      }
    }
    
    // Store updated tails
    await AsyncStorage.setItem(STORAGE_KEYS.SCORE_TAILS, JSON.stringify(updatedTails));
    
    // Apply faded points to current EPC scores
    if (totalPointsFaded.P > 0 || totalPointsFaded.C > 0) {
      const currentScores = await getEPCScores();
      if (currentScores) {
        const updatedScores: EPCScores = {
          ...currentScores,
          purpose: Math.max(0, Math.min(100, currentScores.purpose - totalPointsFaded.P)),
          connection: Math.max(0, Math.min(100, currentScores.connection - totalPointsFaded.C))
        };
        
        await storeEPCScores(updatedScores);
        console.log(`📊 Score tail effects applied: P -${totalPointsFaded.P}, C -${totalPointsFaded.C}`);
      }
    }
    
    return { tailsApplied, totalPointsFaded };
    
  } catch (error) {
    console.error('Error applying score tail effects:', error);
    return { tailsApplied: 0, totalPointsFaded: { P: 0, C: 0 } };
  }
} 

// Hourly burnout data storage
export async function storeHourlyBurnoutData(hour: number, burnoutPercentage: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const key = `${STORAGE_KEYS.HOURLY_BURNOUT}_${today}`;
    
    // Get existing hourly data for today
    const existingDataJson = await AsyncStorage.getItem(key);
    const existingData: Record<number, number> = existingDataJson ? JSON.parse(existingDataJson) : {};
    
    // Update the specific hour
    existingData[hour] = burnoutPercentage;
    
    // Store updated data
    await AsyncStorage.setItem(key, JSON.stringify(existingData));
    
    // console.log(`📊 Hourly burnout data stored: ${hour}:00 = ${burnoutPercentage}%`);
    
  } catch (error) {
    console.error('Error storing hourly burnout data:', error);
  }
}

export async function getHourlyBurnoutData(hour: number): Promise<number | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const key = `${STORAGE_KEYS.HOURLY_BURNOUT}_${today}`;
    
    const dataJson = await AsyncStorage.getItem(key);
    if (!dataJson) return null;
    
    const hourlyData: Record<number, number> = JSON.parse(dataJson);
    return hourlyData[hour] || null;
    
  } catch (error) {
    console.error('Error retrieving hourly burnout data:', error);
    return null;
  }
}

export async function getTodayHourlyBurnoutData(): Promise<Record<number, number>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${STORAGE_KEYS.HOURLY_BURNOUT}_${today}`;
    
    const dataJson = await AsyncStorage.getItem(key);
    if (!dataJson) return {};
    
    return JSON.parse(dataJson);
    
  } catch (error) {
    console.error('Error retrieving today\'s hourly burnout data:', error);
    return {};
  }
} 

// Minute-level burnout data storage
export async function storeMinuteBurnoutData(minute: number, burnoutPercentage: number): Promise<void> {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const hour = now.getHours();
    const key = `${STORAGE_KEYS.MINUTE_BURNOUT}_${today}_${hour}`;
    
    // Get existing minute data for this hour
    const existingDataJson = await AsyncStorage.getItem(key);
    const existingData: Record<number, number> = existingDataJson ? JSON.parse(existingDataJson) : {};
    
    // Update the specific minute
    existingData[minute] = burnoutPercentage;
    
    // Store updated data
    await AsyncStorage.setItem(key, JSON.stringify(existingData));
    
    // console.log(`📊 Minute burnout data stored: ${hour}:${minute.toString().padStart(2, '0')} = ${burnoutPercentage}%`);
    
  } catch (error) {
    console.error('Error storing minute burnout data:', error);
  }
}

export async function getMinuteBurnoutData(hour: number, minute: number): Promise<number | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const key = `${STORAGE_KEYS.MINUTE_BURNOUT}_${today}_${hour}`;
    
    const dataJson = await AsyncStorage.getItem(key);
    if (!dataJson) return null;
    
    const minuteData: Record<number, number> = JSON.parse(dataJson);
    return minuteData[minute] || null;
    
  } catch (error) {
    console.error('Error retrieving minute burnout data:', error);
    return null;
  }
}

export async function getHourlyMinuteData(hour: number): Promise<Record<number, number> | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${STORAGE_KEYS.MINUTE_BURNOUT}_${today}_${hour}`;
    
    const dataJson = await AsyncStorage.getItem(key);
    if (!dataJson) return null;
    
    return JSON.parse(dataJson);
    
  } catch (error) {
    console.error('Error retrieving hourly minute data:', error);
    return null;
  }
}

// Get all hourly burnout data for a specific day
export async function getHourlyBurnoutDataForDay(dateString: string): Promise<Record<number, number> | null> {
  try {
    const key = `${STORAGE_KEYS.HOURLY_BURNOUT}_${dateString}`;
    const existingDataJson = await AsyncStorage.getItem(key);
    return existingDataJson ? JSON.parse(existingDataJson) : null;
  } catch (error) {
    console.error(`Error getting hourly burnout data for day ${dateString}:`, error);
    return null;
  }
}

/**
 * Get all minute-level burnout data for the current day across all hours.
 * This function optimizes data fetching by making a single multiGet call.
 */
export async function getAllMinuteBurnoutDataForDay(): Promise<Record<number, Record<number, number>>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const keysToFetch: string[] = [];
    for (let h = 0; h < 24; h++) { // Iterate through all 24 hours of the day
      keysToFetch.push(`${STORAGE_KEYS.MINUTE_BURNOUT}_${today}_${h}`);
    }

    const rawData = await AsyncStorage.multiGet(keysToFetch); // Fetch all data in one go
    const allMinuteData: Record<number, Record<number, number>> = {};

    rawData.forEach(([key, value]) => {
      if (value) {
        // Extract hour from the key (e.g., 'minute_burnout_YYYY-MM-DD_H')
        const parts = key!.split('_');
        const hour = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(hour)) {
          allMinuteData[hour] = JSON.parse(value);
        }
      }
    });

    console.log('DEBUG: All Minute Data for Day fetched efficiently:', allMinuteData);
    return allMinuteData;
  } catch (error) {
    console.error('Error retrieving all minute burnout data for day:', error);
    return {};
  }
}

// Calculate daily average burnout from hourly data
export async function getDailyAverageBurnout(dateString: string): Promise<number | null> {
  try {
    const hourlyData = await getHourlyBurnoutDataForDay(dateString);
    if (!hourlyData) {
      return null;
    }

    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    let relevantHours = Object.keys(hourlyData).map(Number);

    // If it's the current day, only consider hours up to the current hour
    if (dateString === todayString) {
      const currentHour = now.getHours();
      relevantHours = relevantHours.filter(hour => hour <= currentHour);
    }

    if (relevantHours.length === 0) {
      return null; // No data for relevant hours
    }

    const totalBurnout = relevantHours.reduce((sum, hour) => sum + hourlyData[hour], 0);
    return Math.round(totalBurnout / relevantHours.length);

  } catch (error) {
    console.error(`Error calculating daily average burnout for ${dateString}:`, error);
    return null;
  }
} 
