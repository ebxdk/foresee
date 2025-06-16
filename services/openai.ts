import { fetch as expoFetch } from 'expo/fetch';
import OpenAI from 'openai';

// Get API key from environment variables
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
}

// Create a fetch wrapper that's compatible with OpenAI client
const fetchWrapper = (url: string | URL | Request, init?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  return expoFetch(urlString, init as any);
};

// Initialize OpenAI client with expo/fetch for streaming support
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key', // Provide fallback to prevent initialization errors
  fetch: fetchWrapper as any, // Use expo/fetch wrapper for streaming support
  dangerouslyAllowBrowser: true, // Allow browser usage - be careful with API key exposure
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Custom AI Backend Configuration
const AI_BACKEND_URL = 'https://chatbotebad.org/chat';

// Interface for the custom backend request
interface BackendChatRequest {
  message: string;
  username: string;
  user_state: string;
  chat_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Interface for the custom backend response (assuming structure)
interface BackendChatResponse {
  response?: string;
  message?: string;
  reply?: string;
  content?: string;
}

// Function to estimate token count (rough approximation: 1 token ≈ 4 characters)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Function to preserve full chat history without token limits
function preserveFullChatHistory(messages: ChatMessage[]): ChatMessage[] {
  // Return all messages without any truncation
  console.log(`📊 Chat history preserved: ${messages.length} messages (${estimateTokenCount(JSON.stringify(messages))} estimated tokens)`);
  return messages;
}

// Function to get context from your custom backend
async function getBackgroundContext(userMessage: string, chatHistory: ChatMessage[]): Promise<string> {
  try {
    // Use full chat history without any limits
    const fullHistory = preserveFullChatHistory(chatHistory);
    
    // Convert ChatMessage format to backend format
    const formattedHistory = fullHistory
      .filter(msg => msg.role !== 'system') // Remove system messages
      .map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

    // Send all messages without limiting them
    const finalHistory = formattedHistory;

    const requestBody: BackendChatRequest = {
      message: userMessage,
      username: "JaneDoe",
      user_state: "Maximized",
      chat_history: finalHistory
    };

    console.log('🔄 Sending request to backend:', {
      url: AI_BACKEND_URL,
      body: {
        ...requestBody,
        chat_history: `${finalHistory.length} messages (${estimateTokenCount(JSON.stringify(finalHistory))} est. tokens)`
      }
    });

    const response = await expoFetch(AI_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Backend response status:', response.status);

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = 'Unknown error';
      try {
        const errorText = await response.text();
        console.log('❌ Backend error response:', errorText);
        errorDetails = errorText || `HTTP ${response.status}`;
      } catch (e) {
        console.log('❌ Could not read error response');
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
    }

    const data: BackendChatResponse = await response.json();
    console.log('✅ Backend response data:', data);
    
    // Try different possible response field names
    const contextResponse = data.response || data.message || data.reply || data.content;
    
    if (!contextResponse) {
      console.error('❌ Unexpected response format:', data);
      return "No background context available.";
    }

    console.log('🎯 Using context:', contextResponse.substring(0, 100) + '...');
    return contextResponse;
  } catch (error) {
    console.error('💥 Backend Context Error:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('context_length_exceeded') || error.message.includes('8192 tokens')) {
        console.log('🚨 Token Limit Error: Chat history too long, trying with no history');
        // Try with completely empty history as last resort
        if (chatHistory.length > 0) {
          return getBackgroundContext(userMessage, []); // No chat history at all
        }
        return "Backend context unavailable due to length constraints - using general knowledge only.";
      } else if (error.message.includes('500')) {
        console.log('🚨 Server Error (500): Backend server is having issues');
        return "Backend server temporarily unavailable - using general knowledge only.";
      } else if (error.message.includes('404')) {
        console.log('🚨 Not Found (404): Backend endpoint may be incorrect');
        return "Backend endpoint not found - using general knowledge only.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.log('🚨 Network Error: Connection issues');
        return "Network connection error - using general knowledge only.";
      } else if (error.message.includes('timeout')) {
        console.log('🚨 Timeout Error: Backend took too long to respond');
        return "Backend response timeout - using general knowledge only.";
      }
    }
    
    return "Unable to retrieve background context - using general knowledge only.";
  }
}

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    // Check if API key is available
    if (!apiKey) {
      return "I'm sorry, the AI service is not properly configured. Please check the API key setup.";
    }

    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    if (!latestUserMessage || latestUserMessage.role !== 'user') {
      return "I'm sorry, I couldn't process your request. Please try again.";
    }

    // Step 1: Get background context from your custom backend
    const backgroundContext = await getBackgroundContext(latestUserMessage.content, messages.slice(0, -1));

    // Step 2: Create enhanced prompt with context for GPT
    const enhancedMessages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful capacity coach assistant. You help users optimize their energy, productivity, and well-being. 

You have access to background context about the user's current state and relevant information. Use this context along with your knowledge to provide personalized, actionable advice in a friendly and supportive tone.

BACKGROUND CONTEXT:
${backgroundContext}

Instructions:
- Use the background context to inform your response
- Provide structured, actionable advice
- Be concise but comprehensive
- Maintain a supportive coaching tone
- If the context suggests specific actions, incorporate them into your recommendations`
      },
      ...messages.slice(0, -1), // Previous conversation history
      latestUserMessage // Current user message
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the latest efficient model
      messages: enhancedMessages,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle different types of errors gracefully
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        return "I'm sorry, there's an authentication issue with the AI service. Please check the API key configuration.";
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        return "I'm temporarily unavailable due to usage limits. Please try again later.";
      } else if (error.message.includes('rate limit')) {
        return "I'm getting too many requests right now. Please wait a moment and try again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      }
    }
    
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}

// Updated streaming function that combines backend context with GPT streaming
export async function* getChatCompletionStream(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
  try {
    // Check if API key is available
    if (!apiKey) {
      yield "I'm sorry, the AI service is not properly configured. Please check the API key setup.";
      return;
    }

    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    if (!latestUserMessage || latestUserMessage.role !== 'user') {
      yield "I'm sorry, I couldn't process your request. Please try again.";
      return;
    }

    // Step 1: Get background context from your custom backend
    const backgroundContext = await getBackgroundContext(latestUserMessage.content, messages.slice(0, -1));

    // Step 2: Create enhanced prompt with context for GPT
    const enhancedMessages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful capacity coach assistant. You help users optimize their energy, productivity, and well-being. 

You have access to background context about the user's current state and relevant information. Use this context along with your knowledge to provide personalized, actionable advice in a friendly and supportive tone.

BACKGROUND CONTEXT:
${backgroundContext}

Instructions:
- Use the background context to inform your response
- Provide structured, actionable advice
- Be concise but comprehensive
- Maintain a supportive coaching tone
- If the context suggests specific actions, incorporate them into your recommendations`
      },
      ...messages.slice(0, -1), // Previous conversation history
      latestUserMessage // Current user message
    ];

    // Step 3: Stream response from GPT
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: enhancedMessages,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Hybrid AI Streaming Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        yield "I'm sorry, there's an authentication issue with the AI service. Please check the API key configuration.";
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        yield "I'm temporarily unavailable due to usage limits. Please try again later.";
      } else if (error.message.includes('rate limit')) {
        yield "I'm getting too many requests right now. Please wait a moment and try again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        yield "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      } else {
        yield "I'm sorry, I encountered an error while processing your request. Please try again.";
      }
    } else {
      yield "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
}

// Legacy function for backwards compatibility (now uses custom backend only)
export async function getCustomChatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    // Convert ChatMessage format to backend format
    const chatHistory = messages
      .filter(msg => msg.role !== 'system') // Remove system messages
      .map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]?.content || '';

    const requestBody: BackendChatRequest = {
      message: latestMessage,
      username: "JaneDoe",
      user_state: "Maximized",
      chat_history: chatHistory.slice(0, -1) // Exclude the current message from history
    };

    const response = await expoFetch(AI_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BackendChatResponse = await response.json();
    
    // Try different possible response field names
    const aiResponse = data.response || data.message || data.reply || data.content;
    
    if (!aiResponse) {
      console.error('Unexpected response format:', data);
      return "I'm sorry, I received an unexpected response format. Please try again.";
    }

    return aiResponse;
  } catch (error) {
    console.error('Custom AI Backend Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      } else if (error.message.includes('HTTP error')) {
        return "I'm experiencing service issues right now. Please try again in a moment.";
      }
    }
    
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}

// Helper function to convert our app messages to OpenAI format
export function convertToOpenAIMessages(appMessages: Array<{text: string, isUser: boolean}>): ChatMessage[] {
  return appMessages.map(msg => ({
    role: msg.isUser ? 'user' : 'assistant',
    content: msg.text
  }));
} 