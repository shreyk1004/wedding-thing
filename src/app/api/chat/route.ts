import { getChatCompletion } from '@/lib/openai';
import { ChatMessage } from '@/types/wedding';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  try {
    const reply = await getChatCompletion(messages as ChatMessage[]);
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500 }
    );
  }
} 