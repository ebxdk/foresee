import { EPCScores } from './epcScoreCalc';

interface TaskGenerationRequest {
  energyScore: number;
  purposeScore: number;
  connectionScore: number;
  userState: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued';
}

interface AITaskResponse {
  tasks: string[];
}

/**
 * Generate personalized wellness tasks using OpenAI based on EPC scores
 */
export async function generateWellnessTasks(
  scores: EPCScores, 
  userState: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued'
): Promise<string[]> {
  try {
    // Use Expo's Constants for environment variables
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || __DEV__ ? process.env.EXPO_PUBLIC_OPENAI_API_KEY : null;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback tasks');
      return getFallbackTasks(scores, userState);
    }

    const prompt = createTaskPrompt(scores, userState);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a wellness expert who creates micro-tasks for busy people. Always respond with exactly 5-8 tasks in a simple JSON array format: ["task1", "task2", "task3", "task4", "task5"]. Tasks should be 1-3 minutes maximum, extremely specific, and immediately actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.8, // Add some creativity for variety
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response - handle potential markdown formatting or extra text
    let cleanedContent = content.trim();
    
    // Remove markdown code block formatting if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Extract JSON array if there's extra text
    const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }
    
    console.log('Attempting to parse OpenAI response:', cleanedContent);
    
    const tasks = JSON.parse(cleanedContent);
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Invalid task format from AI');
    }

    return tasks.slice(0, 8); // Ensure max 8 tasks
    
  } catch (error) {
    console.error('Error generating AI tasks:', error);
    return getFallbackTasks(scores, userState);
  }
}

/**
 * Create a personalized prompt based on EPC scores and user state
 */
function createTaskPrompt(scores: EPCScores, userState: string): string {
  const { energy, purpose, connection } = scores;
  
  // Determine focus areas based on lowest scores
  const focusAreas = [];
  if (energy < 60) focusAreas.push('energy');
  if (purpose < 60) focusAreas.push('purpose'); 
  if (connection < 60) focusAreas.push('connection');
  
  // If no low scores, focus on maintaining high performance
  if (focusAreas.length === 0) {
    focusAreas.push('maintenance');
  }

  const stateDescriptions = {
    'Maximized': 'highly energized and productive',
    'Fatigued': 'tired and low on energy', 
    'Reserved': 'cautious and conserving energy',
    'Indulgent': 'seeking comfort and ease'
  };

  return `Create 5-8 micro wellness tasks for someone who is ${stateDescriptions[userState as keyof typeof stateDescriptions]} with these wellness scores:
- Energy: ${energy}/100 ${energy < 60 ? '(needs boost)' : '(good)'}
- Purpose: ${purpose}/100 ${purpose < 60 ? '(needs focus)' : '(good)'}  
- Connection: ${connection}/100 ${connection < 60 ? '(needs improvement)' : '(good)'}

Focus areas: ${focusAreas.join(', ')}

Requirements:
- Each task takes 1-3 minutes maximum
- More micro than "take a 10-minute walk" - think "do 5 jumping jacks" or "text one friend"
- Immediately actionable without prep
- Specific, not generic
- Mix physical, mental, and social micro-actions
- Consider their ${userState} state - ${userState === 'Fatigued' ? 'gentle, restorative tasks' : userState === 'Maximized' ? 'momentum-building tasks' : userState === 'Reserved' ? 'low-pressure, solo tasks' : 'comfort-focused, easy tasks'}

Return only a JSON array of task strings.`;
}

/**
 * Fallback tasks when AI generation fails
 */
function getFallbackTasks(scores: EPCScores, userState: string): string[] {
  const { energy, purpose, connection } = scores;
  
  const energyTasks = [
    "Do 10 deep breaths by a window",
    "Drink a full glass of water slowly", 
    "Do 5 jumping jacks",
    "Stretch your arms above your head for 30 seconds",
    "Step outside for 2 minutes"
  ];
  
  const purposeTasks = [
    "Write down one thing you're grateful for",
    "Set one tiny goal for the next hour",
    "Read one inspirational quote",
    "List 3 things going well today",
    "Reflect on why today matters"
  ];
  
  const connectionTasks = [
    "Send a quick 'thinking of you' text",
    "Give someone a genuine compliment", 
    "Make eye contact and smile at 3 people",
    "Call a family member for 2 minutes",
    "Share something positive on social media"
  ];
  
  const maintenanceTasks = [
    "Organize one small area of your space",
    "Delete 5 old photos from your phone",
    "Take 3 slow, mindful bites of your next meal",
    "Notice and name 5 things you can see right now",
    "Do a 1-minute body scan meditation"
  ];
  
  // Select tasks based on lowest scores
  let selectedTasks: string[] = [];
  
  if (energy < 60) selectedTasks.push(...energyTasks.slice(0, 2));
  if (purpose < 60) selectedTasks.push(...purposeTasks.slice(0, 2));
  if (connection < 60) selectedTasks.push(...connectionTasks.slice(0, 2));
  
  // Fill remaining slots
  const remaining = 6 - selectedTasks.length;
  if (remaining > 0) {
    selectedTasks.push(...maintenanceTasks.slice(0, remaining));
  }
  
  return selectedTasks.slice(0, 6); // Ensure we return 3-6 tasks
} 