// Quote generation service using OpenAI
import { fetch as expoFetch } from 'expo/fetch';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface GeneratedQuote {
  text: string;
  keywords: string[];
  gradientColors: [string, string];
}

// Predefined gradient color combinations
const GRADIENT_COMBINATIONS: [string, string][] = [
  ['#FF6B6B', '#FF8E8E'], // Red
  ['#4ECDC4', '#6ED4D2'], // Teal
  ['#45B7D1', '#6BC5E0'], // Blue
  ['#9B59B6', '#B06AC1'], // Purple
  ['#F39C12', '#F7B32B'], // Orange
  ['#E74C3C', '#F1948A'], // Red-orange
  ['#8E44AD', '#BB8FCE'], // Purple-pink
  ['#3498DB', '#85C1E9'], // Light blue
  ['#E67E22', '#F5B041'], // Orange-yellow
  ['#1ABC9C', '#7DCEA0'], // Teal-green
  ['#E91E63', '#F48FB1'], // Pink
  ['#673AB7', '#9575CD'], // Deep purple
  ['#FF5722', '#FFAB91'], // Deep orange
  ['#795548', '#A1887F'], // Brown
  ['#607D8B', '#90A4AE'], // Blue-grey
  ['#3F51B5', '#7986CB'], // Indigo
  ['#009688', '#4DB6AC'], // Cyan
  ['#FF9800', '#FFB74D'], // Amber
  ['#9C27B0', '#BA68C8'], // Purple
  ['#F44336', '#EF5350'], // Red
  ['#4CAF50', '#81C784'], // Green
  ['#2196F3', '#64B5F6'], // Light blue
  ['#FFC107', '#FFD54F'], // Yellow
  ['#00BCD4', '#4DD0E1'], // Cyan
  ['#CDDC39', '#DCE775'], // Lime
  ['#FF5722', '#FF8A65'], // Orange-red
  ['#8E24AA', '#BA68C8'], // Purple-violet
  ['#00ACC1', '#4DD0E1'], // Cyan-blue
  ['#5D4037', '#8D6E63'], // Brown-tan
  ['#455A64', '#78909C'], // Blue-grey
  ['#E64A19', '#FF7043'], // Deep orange
  ['#7B1FA2', '#AB47BC'], // Purple-magenta
  ['#388E3C', '#66BB6A'], // Green
  ['#D32F2F', '#EF5350'], // Red
  ['#1976D2', '#42A5F5'], // Blue
  ['#F57C00', '#FFB74D'], // Orange
  ['#5E35B1', '#9575CD'], // Purple
  ['#00796B', '#4DB6AC'], // Teal
  ['#C2185B', '#F48FB1'], // Pink
  ['#303F9F', '#7986CB'], // Indigo
  ['#689F38', '#AED581'], // Light green
  ['#FF8F00', '#FFCC02'], // Amber
  ['#5D4037', '#8D6E63'], // Brown
  ['#455A64', '#78909C'], // Blue-grey
  ['#D32F2F', '#EF5350'], // Red
  ['#1976D2', '#42A5F5'], // Blue
  ['#388E3C', '#66BB6A'], // Green
  ['#F57C00', '#FFB74D'], // Orange
  ['#5E35B1', '#9575CD'], // Purple
  ['#00796B', '#4DB6AC'], // Teal
  ['#C2185B', '#F48FB1'], // Pink
  ['#303F9F', '#7986CB'], // Indigo
  ['#689F38', '#AED581'], // Light green
  ['#FF8F00', '#FFCC02'], // Amber
];

let usedGradients = new Set<string>();
let usedTexts = new Set<string>(); // Track used quote texts to prevent duplicates
let gradientIndex = 0; // Track current position in gradient array

/**
 * Get a unique gradient combination that cycles through all available colors
 */
function getUniqueGradient(): [string, string] {
  // Get the next gradient in sequence
  const gradient = GRADIENT_COMBINATIONS[gradientIndex % GRADIENT_COMBINATIONS.length];
  
  // Move to next gradient for next call
  gradientIndex++;
  
  // If we've cycled through all gradients, reset the used set
  if (gradientIndex >= GRADIENT_COMBINATIONS.length) {
    gradientIndex = 0;
    usedGradients.clear();
  }
  
  return gradient;
}

/**
 * Generate new quotes using OpenAI
 */
export async function generateQuotes(count: number = 5): Promise<GeneratedQuote[]> {
  try {
    if (!apiKey) {
      console.warn('OpenAI API key not found, using fallback quotes');
      return getFallbackQuotes(count);
    }

    const prompt = `Generate ${count} short, empowering quotes about self-care, mental health, boundaries, and personal growth. Each quote should be:
- EXACTLY 6-12 words long (no more, no less)
- Positive and empowering
- Focus on themes like rest, boundaries, self-worth, healing, energy, recovery, or personal growth
- Include 1-2 key words that should be highlighted
- Be inspirational but realistic
- NO special characters like asterisks (*), quotes ("), or other symbols
- Use only letters, spaces, commas, and periods
- Keep it simple and clean

Format your response as a JSON array where each quote is an object with:
{
  "text": "The quote text here",
  "keywords": ["keyword1", "keyword2"]
}

Example format:
[
  {
    "text": "You are enough exactly as you are",
    "keywords": ["enough"]
  },
  {
    "text": "Rest is not luxury it is necessity",
    "keywords": ["Rest", "necessity"]
  }
]

Generate exactly ${count} quotes in this format.`;

    const response = await expoFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a wellness coach who creates inspiring, short quotes about self-care and personal growth. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8,
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

    // Parse the JSON response
    let cleanedContent = content.trim();
    
    // Remove markdown code block formatting if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const quotes = JSON.parse(cleanedContent);
    
    if (!Array.isArray(quotes)) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Clean and validate quotes
    const cleanedQuotes = quotes.map((quote: any) => {
      let text = quote.text || '';
      
      // Remove special characters except letters, spaces, commas, and periods
      text = text.replace(/[^a-zA-Z\s,.]/g, '');
      
      // Remove extra spaces
      text = text.replace(/\s+/g, ' ').trim();
      
      // Ensure proper length (6-12 words)
      const words = text.split(' ');
      if (words.length > 12) {
        text = words.slice(0, 12).join(' ');
      } else if (words.length < 6) {
        // If too short, pad with a simple word
        text = text + ' today';
      }
      
      // Check for duplicates and add timestamp if needed
      let finalText = text;
      if (usedTexts.has(text.toLowerCase())) {
        finalText = text + ' always';
        usedTexts.add(finalText.toLowerCase());
      } else {
        usedTexts.add(text.toLowerCase());
      }
      
      return {
        text: finalText,
        keywords: (quote.keywords || []).filter((kw: string) => 
          typeof kw === 'string' && kw.length > 0
        ),
        gradientColors: getUniqueGradient()
      };
    });

    return cleanedQuotes;

  } catch (error) {
    console.error('Error generating quotes:', error);
    return getFallbackQuotes(count);
  }
}

/**
 * Fallback quotes when AI generation fails
 */
function getFallbackQuotes(count: number): GeneratedQuote[] {
  const fallbackQuotes: GeneratedQuote[] = [
    {
      text: "You are worthy of your own love",
      keywords: ["worthy", "love"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Healing happens at your own pace",
      keywords: ["Healing", "pace"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Your feelings are valid and important",
      keywords: ["feelings", "valid"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "It is okay to not be okay",
      keywords: ["okay"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "You deserve to take up space",
      keywords: ["deserve", "space"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Your mental health matters most",
      keywords: ["mental", "health"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Rest is productive not lazy",
      keywords: ["Rest", "productive"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "You are not your worst day",
      keywords: ["worst", "day"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Growth happens outside comfort zone",
      keywords: ["Growth", "comfort"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Your journey is uniquely yours",
      keywords: ["journey", "uniquely"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "You are enough exactly as you are",
      keywords: ["enough"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Rest is not luxury it is necessity",
      keywords: ["Rest", "necessity"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "Your energy is sacred protect it",
      keywords: ["energy", "sacred"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "No is complete sentence always",
      keywords: ["No", "complete"],
      gradientColors: getUniqueGradient()
    },
    {
      text: "You deserve rest not just sleep",
      keywords: ["deserve", "rest"],
      gradientColors: getUniqueGradient()
    }
  ];

  // Filter out duplicates and return unique quotes
  const uniqueQuotes = fallbackQuotes.filter(quote => {
    const textKey = quote.text.toLowerCase();
    if (usedTexts.has(textKey)) {
      return false;
    }
    usedTexts.add(textKey);
    return true;
  });

  return uniqueQuotes.slice(0, count);
}
