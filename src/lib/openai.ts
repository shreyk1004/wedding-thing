import OpenAI from 'openai';
import { ChatMessage } from '@/types/wedding';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly and professional wedding planning assistant. Your goal is to help gather essential wedding details through a natural conversation. 
You should ask about:
1. Names of both partners
2. Wedding date
3. City/location
4. Theme or vibe they're going for
5. Estimated number of guests
6. Any special requirements (like dietary restrictions, entertainment, etc.)

Keep your responses concise and friendly. Ask one question at a time and acknowledge their answers. 
Once you have all the necessary information, summarize it back to them and confirm if everything is correct.`;

export async function getChatCompletion(messages: ChatMessage[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Could you please try again?';
} 