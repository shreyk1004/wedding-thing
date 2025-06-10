import OpenAI from 'openai';
import { ChatMessage } from '@/types/wedding';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly and professional wedding planning assistant. 
Your goal is to gather all the required wedding details from the user, only asking one question at a time. 
Ask clarifying questions to understand the user's needs better. For example, if a user mentions a specific cultural wedding like "Indian wedding", you should ask follow-up questions about common elements like "religious components" to generate more relevant tasks.
Once you have all the necessary information, generate a list of initial tasks based on the conversation.
Finally, call the submit_wedding_details function with all the collected data, including the list of tasks.
Important: Do not mention the tasks you are creating in your conversational replies. The task generation should be a silent process for the user.
Do not summarize or end the conversation until you have called the function.`;

const schema = {
  type: 'object',
  properties: {
    partner1name: { type: 'string', description: 'First partner\'s name' },
    partner2name: { type: 'string', description: 'Second partner\'s name' },
    weddingdate: { type: 'string', description: 'Wedding date' },
    city: { type: 'string', description: 'Wedding city/location' },
    theme: { type: 'string', description: 'Wedding theme or vibe' },
    estimatedguestcount: { type: 'number', description: 'Estimated number of guests' },
    specialrequirements: { type: 'array', items: { type: 'string' }, description: 'Special requirements or needs' },
    contactemail: { type: 'string', description: 'Contact email address' },
    phone: { type: 'string', description: 'Phone number' },
    budget: { type: 'number', description: 'Wedding budget' },
    tasks: {
      type: 'array',
      description: 'A list of generated initial tasks for the user.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', description: 'Optional description for the task' }
        },
        required: ['title']
      }
    }
  },
  required: [
    'partner1name', 'partner2name', 'weddingdate', 'city', 'theme',
    'estimatedguestcount', 'contactemail', 'phone', 'budget', 'tasks'
  ]
};

const weddingDetailsTool = {
  type: 'function' as const,
  function: {
    name: 'submit_wedding_details',
    description: 'Collect all wedding details from the user',
    parameters: schema,
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