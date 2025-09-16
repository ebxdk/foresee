// Actionables Utility
// Provides targeted recovery suggestions based on EPC weaknesses

import { EPCScores, getWeakestPillar } from './epcScoreCalc';

export interface Actionable {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'purpose' | 'connection';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string; // e.g., "5 mins", "30 mins"
}

// Actionable suggestions organized by EPC category
const ENERGY_ACTIONABLES: Actionable[] = [
  {
    id: 'energy-1',
    title: 'Take a 10-minute walk',
    description: 'Fresh air and movement can boost energy levels naturally',
    category: 'energy',
    priority: 'high',
    estimatedTime: '10 mins'
  },
  {
    id: 'energy-2', 
    title: 'Do 5 minutes of deep breathing',
    description: 'Controlled breathing reduces stress and increases focus',
    category: 'energy',
    priority: 'high',
    estimatedTime: '5 mins'
  },
  {
    id: 'energy-3',
    title: 'Drink a glass of water',
    description: 'Dehydration is a common cause of fatigue',
    category: 'energy',
    priority: 'medium',
    estimatedTime: '1 min'
  },
  {
    id: 'energy-4',
    title: 'Stretch for 5 minutes',
    description: 'Release tension and improve circulation',
    category: 'energy',
    priority: 'medium',
    estimatedTime: '5 mins'
  },
  {
    id: 'energy-5',
    title: 'Check your posture',
    description: 'Poor posture can drain energy throughout the day',
    category: 'energy',
    priority: 'low',
    estimatedTime: '1 min'
  },
  {
    id: 'energy-6',
    title: 'Take a power nap',
    description: 'A 15-20 minute nap can restore alertness',
    category: 'energy',
    priority: 'medium',
    estimatedTime: '20 mins'
  }
];

const PURPOSE_ACTIONABLES: Actionable[] = [
  {
    id: 'purpose-1',
    title: 'Write down 3 things you accomplished today',
    description: 'Acknowledge your progress and build momentum',
    category: 'purpose',
    priority: 'high',
    estimatedTime: '3 mins'
  },
  {
    id: 'purpose-2',
    title: 'Set one meaningful goal for tomorrow',
    description: 'Having clear direction increases motivation',
    category: 'purpose',
    priority: 'high',
    estimatedTime: '5 mins'
  },
  {
    id: 'purpose-3',
    title: 'Review your long-term goals',
    description: 'Reconnect with your bigger picture and values',
    category: 'purpose',
    priority: 'medium',
    estimatedTime: '10 mins'
  },
  {
    id: 'purpose-4',
    title: 'Do something creative for 10 minutes',
    description: 'Creative activities can reignite passion and purpose',
    category: 'purpose',
    priority: 'medium',
    estimatedTime: '10 mins'
  },
  {
    id: 'purpose-5',
    title: 'Help someone today',
    description: 'Contributing to others creates meaning and fulfillment',
    category: 'purpose',
    priority: 'medium',
    estimatedTime: '15 mins'
  },
  {
    id: 'purpose-6',
    title: 'Journal about what matters to you',
    description: 'Clarify your values and what drives you',
    category: 'purpose',
    priority: 'low',
    estimatedTime: '10 mins'
  }
];

const CONNECTION_ACTIONABLES: Actionable[] = [
  {
    id: 'connection-1',
    title: 'Text or call a friend',
    description: 'Reach out to someone you care about',
    category: 'connection',
    priority: 'high',
    estimatedTime: '5 mins'
  },
  {
    id: 'connection-2',
    title: 'Have a meaningful conversation',
    description: 'Go deeper than small talk with someone today',
    category: 'connection',
    priority: 'high',
    estimatedTime: '15 mins'
  },
  {
    id: 'connection-3',
    title: 'Practice gratitude for someone',
    description: 'Think about someone who has helped you recently',
    category: 'connection',
    priority: 'medium',
    estimatedTime: '3 mins'
  },
  {
    id: 'connection-4',
    title: 'Join a group activity',
    description: 'Participate in something social or community-oriented',
    category: 'connection',
    priority: 'medium',
    estimatedTime: '30 mins'
  },
  {
    id: 'connection-5',
    title: 'Send an appreciation message',
    description: 'Let someone know you value them',
    category: 'connection',
    priority: 'medium',
    estimatedTime: '3 mins'
  },
  {
    id: 'connection-6',
    title: 'Schedule time with loved ones',
    description: 'Plan quality time with family or friends',
    category: 'connection',
    priority: 'low',
    estimatedTime: '5 mins'
  }
];

/**
 * Get actionables for the weakest EPC pillar
 */
export function getActionablesForWeakestPillar(
  scores: EPCScores,
  count: number = 3
): Actionable[] {
  const weakestPillar = getWeakestPillar(scores);
  
  let actionables: Actionable[];
  
  switch (weakestPillar) {
    case 'energy':
      actionables = ENERGY_ACTIONABLES;
      break;
    case 'purpose':
      actionables = PURPOSE_ACTIONABLES;
      break;
    case 'connection':
      actionables = CONNECTION_ACTIONABLES;
      break;
  }
  
  // Sort by priority (high first) and return requested count
  const sortedActionables = actionables.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return sortedActionables.slice(0, count);
}

/**
 * Get all actionables for a specific category
 */
export function getActionablesByCategory(
  category: 'energy' | 'purpose' | 'connection',
  count?: number
): Actionable[] {
  let actionables: Actionable[];
  
  switch (category) {
    case 'energy':
      actionables = ENERGY_ACTIONABLES;
      break;
    case 'purpose':
      actionables = PURPOSE_ACTIONABLES;
      break;
    case 'connection':
      actionables = CONNECTION_ACTIONABLES;
      break;
  }
  
  return count ? actionables.slice(0, count) : actionables;
}

/**
 * Get mixed actionables from all categories
 */
export function getMixedActionables(count: number = 6): Actionable[] {
  const allActionables = [
    ...ENERGY_ACTIONABLES,
    ...PURPOSE_ACTIONABLES, 
    ...CONNECTION_ACTIONABLES
  ];
  
  // Shuffle and return requested count
  const shuffled = allActionables.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
} 