import { getChatCompletion } from '@/lib/openai';
import { ChatMessage } from '@/types/wedding';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  try {
    const result = await getChatCompletion(messages as ChatMessage[]);
    
    // The result can either be a conversational reply or a function call with details.
    if (result.functionCall && result.details) {
      // If it's a function call, send back the structured details.
      // The `details` object now contains everything, including tasks.
      return new Response(JSON.stringify({ 
        details: result.details, 
        functionCall: true 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // If it's a regular message, send back the content for the chat.
      return new Response(JSON.stringify({ 
        reply: result.content, 
        functionCall: false 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500 }
    );
  }
} 