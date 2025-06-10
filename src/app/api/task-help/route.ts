import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseClient } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Perplexity API client
async function searchWithPerplexity(query: string): Promise<{ content: string; citations: string[] }> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful wedding planning assistant. Provide specific, actionable information with current pricing, contact details, and links when possible. Focus on practical recommendations.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Perplexity response:', JSON.stringify(data, null, 2));
    const content = data.choices[0]?.message?.content || 'No information found.';
    
    // Handle citations - they might be in different formats
    let citations: string[] = [];
    if (data.citations && Array.isArray(data.citations)) {
      citations = data.citations;
    } else if (data.choices[0]?.message?.citations && Array.isArray(data.choices[0].message.citations)) {
      citations = data.choices[0].message.citations;
    } else if (data.choices[0]?.citations && Array.isArray(data.choices[0].citations)) {
      citations = data.choices[0].citations;
    }

    return { content, citations };
  } catch (error) {
    console.error('Perplexity search error:', error);
    return { 
      content: 'Unable to search for current information at the moment. Please try again later.', 
      citations: [] 
    };
  }
}

// Function to create search queries based on task and wedding details
function createSearchQuery(task: any, weddingDetails: any, userMessage?: string): string {
  const location = weddingDetails?.city || '';
  const budget = weddingDetails?.budget ? `budget $${weddingDetails.budget}` : '';
  const guestCount = weddingDetails?.estimatedguestcount ? `${weddingDetails.estimatedguestcount} guests` : '';
  const theme = weddingDetails?.theme || '';
  const weddingDate = weddingDetails?.weddingdate ? new Date(weddingDetails.weddingdate).getFullYear() : '';

  // If user has asked a specific question, combine it with task context
  if (userMessage && userMessage.trim()) {
    return `${userMessage} for wedding task: ${task.title} ${task.description ? `(${task.description})` : ''} in ${location} ${guestCount} ${budget} ${theme} ${weddingDate}`.trim();
  }

  // Generate query based on task title and description
  const taskLower = task.title.toLowerCase();
  let baseQuery = '';

  if (taskLower.includes('venue') || taskLower.includes('location')) {
    baseQuery = `wedding venues in ${location} ${guestCount} ${budget} ${theme} 2024 2025 pricing contact information`;
  } else if (taskLower.includes('photographer') || taskLower.includes('photography')) {
    baseQuery = `wedding photographers in ${location} ${budget} ${theme} 2024 2025 pricing portfolio contact information`;
  } else if (taskLower.includes('dj') || taskLower.includes('music') || taskLower.includes('band')) {
    baseQuery = `wedding DJ music bands in ${location} ${budget} ${theme} 2024 2025 pricing contact information`;
  } else if (taskLower.includes('flower') || taskLower.includes('florist') || taskLower.includes('bouquet')) {
    baseQuery = `wedding florists flowers bouquets in ${location} ${budget} ${theme} 2024 2025 pricing contact information`;
  } else if (taskLower.includes('catering') || taskLower.includes('food') || taskLower.includes('menu')) {
    baseQuery = `wedding catering food menu in ${location} ${guestCount} ${budget} 2024 2025 pricing contact information`;
  } else if (taskLower.includes('invitation') || taskLower.includes('stationery')) {
    baseQuery = `wedding invitations stationery ${theme} ${guestCount} 2024 2025 pricing online printing services`;
  } else if (taskLower.includes('dress') || taskLower.includes('attire') || taskLower.includes('suit')) {
    baseQuery = `wedding dress attire suits in ${location} ${budget} ${theme} 2024 2025 pricing boutiques stores`;
  } else if (taskLower.includes('cake') || taskLower.includes('dessert')) {
    baseQuery = `wedding cakes desserts bakeries in ${location} ${guestCount} ${budget} 2024 2025 pricing contact information`;
  } else if (taskLower.includes('transport') || taskLower.includes('car') || taskLower.includes('limo')) {
    baseQuery = `wedding transportation cars limos in ${location} ${budget} 2024 2025 pricing rental services`;
  } else if (taskLower.includes('hotel') || taskLower.includes('accommodation')) {
    baseQuery = `wedding guest accommodation hotels in ${location} ${guestCount} 2024 2025 group rates contact information`;
  } else if (taskLower.includes('makeup') || taskLower.includes('hair') || taskLower.includes('beauty')) {
    baseQuery = `wedding makeup hair beauty services in ${location} ${budget} 2024 2025 pricing contact information`;
  } else {
    // Generic wedding task query
    baseQuery = `wedding ${task.title} ${task.description || ''} in ${location} ${budget} 2024 2025 services providers pricing contact information`;
  }

  return baseQuery.replace(/\s+/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  try {
    const { task, message, chatHistory, weddingDetails } = await request.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Use wedding details from frontend if available, otherwise fetch from Supabase as fallback
    let wedding = weddingDetails;
    
    if (!wedding) {
      console.log('No wedding details provided from frontend, fetching from Supabase as fallback...');
      const supabase = getSupabaseClient(true);
      const { data: weddingData, error: supabaseError } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }

      wedding = weddingData && weddingData.length > 0 ? weddingData[0] : null;
    }

    console.log('Using wedding data:', wedding);

    // Create search query for Perplexity
    const searchQuery = createSearchQuery(task, wedding, message);
    console.log('Generated search query:', searchQuery);

    // Search with Perplexity
    const searchResult = await searchWithPerplexity(searchQuery);

    // Create context with wedding details
    const weddingContext = wedding ? `
Wedding Details:
- Partners: ${wedding.partner1name || 'N/A'} & ${wedding.partner2name || 'N/A'}
- Date: ${wedding.weddingdate || 'N/A'}
- Location: ${wedding.city || 'N/A'}
- Theme: ${wedding.theme || 'N/A'}
- Guest Count: ${wedding.estimatedguestcount || 'N/A'}
- Budget: $${wedding.budget ? wedding.budget.toLocaleString() : 'N/A'}
- Special Requirements: ${wedding.specialrequirements?.join(', ') || 'None'}
- Contact: ${wedding.contactemail || 'N/A'}
- Phone: ${wedding.phone || 'N/A'}
` : 'No wedding details available.';

    // Create messages array for conversation
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful wedding planning assistant. You have access to current, real-time information about wedding services, vendors, and recommendations.

${weddingContext}

Current Task: "${task.title}"
Task Description: "${task.description || 'No description provided'}"

SEARCH RESULTS FROM WEB:
${searchResult.content}

${searchResult.citations.length > 0 ? `
SOURCES:
${searchResult.citations.map((citation, index) => `${index + 1}. ${citation}`).join('\n')}
` : ''}

INSTRUCTIONS:
1. Use the search results above to provide specific, actionable advice for this wedding task
2. Include real vendor names, contact information, and pricing when available
3. Mention the sources/links from the search results when relevant
4. Tailor your response to the specific wedding details provided
5. Be conversational and helpful while being informative
6. If pricing or contact info is available in the search results, include it
7. Suggest next steps or follow-up actions

Remember to be specific and practical, using the real information from the search results rather than generic advice.`
      }
    ];

    // Add chat history if available (last 6 messages to keep context reasonable)
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-6);
      for (const historyMessage of recentHistory) {
        messages.push({
          role: historyMessage.type === 'user' ? 'user' : 'assistant',
          content: historyMessage.content
        });
      }
    }

    // Add current user message if provided
    if (message && message.trim()) {
      messages.push({
        role: "user",
        content: message
      });
    } else {
      // If no message, ask for general help with the task
      messages.push({
        role: "user",
        content: `I need help with this wedding task: "${task.title}". ${task.description ? `Description: ${task.description}` : ''} Can you provide specific recommendations and next steps?`
      });
    }

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const advice = completion.choices[0]?.message?.content || 'I apologize, but I could not generate advice for this task.';

    console.log('Generated advice:', advice);

    return NextResponse.json({ 
      advice,
      searchQuery: searchQuery,
      citations: searchResult.citations,
      content: advice // For backwards compatibility
    });

  } catch (error) {
    console.error('Error in task-help API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 