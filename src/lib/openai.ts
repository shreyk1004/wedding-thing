import OpenAI from 'openai';
import { ChatMessage } from '@/types/wedding';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly and professional wedding planning assistant. Your goal is to gather all the required wedding details from the user. When you have all the information, call the submit_wedding_details function with the collected data. Do not summarize or end the conversation until you have called the function.`;

const weddingDetailsTool = {
  type: 'function' as const,
  function: {
    name: 'submit_wedding_details',
    description: 'Collect all wedding details from the user',
    parameters: {
      type: 'object',
      properties: {
        partner1Name: { type: 'string', description: 'Name of the first partner' },
        partner2Name: { type: 'string', description: 'Name of the second partner' },
        weddingDate: { type: 'string', description: 'Date of the wedding' },
        city: { type: 'string', description: 'City or location of the wedding' },
        theme: { type: 'string', description: 'Theme or vibe of the wedding' },
        estimatedGuestCount: { type: 'number', description: 'Estimated number of guests' },
        specialRequirements: { type: 'array', items: { type: 'string' }, description: 'Special requirements (e.g. dietary, entertainment)' },
        contactEmail: { type: 'string', description: 'Contact email address' },
        phone: { type: 'string', description: 'Contact phone number' },
        budget: { type: 'number', description: 'Estimated budget' },
      },
      required: [
        'partner1Name', 'partner2Name', 'weddingDate', 'city', 'theme',
        'estimatedGuestCount', 'contactEmail', 'phone', 'budget'
      ],
    },
  },
};

export async function getChatCompletion(messages: ChatMessage[]) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 300,
      tools: [weddingDetailsTool],
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.[0]) {
      // The model called the function with structured arguments
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function) {
        const args = JSON.parse(toolCall.function.arguments || '{}');
        return { functionCall: true, details: args };
      }
    }

    return { functionCall: false, content: choice.message?.content || 'I apologize, but I encountered an error. Could you please try again?' };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
} 