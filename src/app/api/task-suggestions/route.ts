import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseClient } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Perplexity API client for getting current wedding planning trends
async function searchWeddingTrends(query: string): Promise<{ content: string; citations: string[] }> {
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
            content: 'You are a wedding planning expert. Provide current trends and essential tasks for wedding planning.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status);
      return { content: '', citations: [] };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Handle citations - they might be in different formats
    let citations: string[] = [];
    if (data.citations && Array.isArray(data.citations)) {
      citations = data.citations;
    } else if (data.choices[0]?.message?.citations && Array.isArray(data.choices[0].message.citations)) {
      citations = data.choices[0].message.citations;
    }

    return { content, citations };
  } catch (error) {
    console.error('Perplexity search error:', error);
    return { content: '', citations: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, title, existingTasks, weddingDetails } = await request.json();

    // Validate request
    if (!type || !['title_and_description', 'description_only'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    if (type === 'description_only' && !title) {
      return NextResponse.json({ error: 'Title required for description_only type' }, { status: 400 });
    }

    // Get current wedding planning trends from Perplexity (with timeout)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const season = currentDate.getMonth() >= 3 && currentDate.getMonth() <= 8 ? 'spring/summer' : 'fall/winter';
    
    const trendsQuery = `Current wedding planning trends and essential tasks for ${year} ${season} weddings, including modern must-have vendors and services`;
    
    // Add timeout to prevent hanging
    const trendsResult = await Promise.race([
      searchWeddingTrends(trendsQuery),
      new Promise<{ content: string; citations: string[] }>((_, reject) => 
        setTimeout(() => reject(new Error('Trends search timeout')), 10000)
      )
    ]).catch(err => {
      console.warn('Failed to get wedding trends:', err.message);
      return { content: '', citations: [] };
    });

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
` : 'No wedding details available.';

    // Create list of existing tasks to avoid duplicates
    const existingTasksList = existingTasks && existingTasks.length > 0 
      ? existingTasks.map((task: any) => `- ${task.title}: ${task.description || 'No description'}`).join('\n')
      : 'No existing tasks.';

    // Create system prompt based on request type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'title_and_description') {
      systemPrompt = `You are a helpful wedding planning assistant. Generate a single, specific wedding task suggestion with both title and description.

${weddingContext}

CURRENT WEDDING TRENDS & INSIGHTS:
${trendsResult.content}

EXISTING TASKS TO AVOID DUPLICATING:
${existingTasksList}

STANDARD WEDDING TASK CATEGORIES:
- Venue planning (booking, contracts, timeline coordination)
- Photo/videography (engagement shoots, wedding day coverage, editing)
- Food & catering (menu selection, tastings, dietary accommodations)
- Attire & accessories (dress, suit, shoes, jewelry, alterations)
- Music & entertainment (ceremony music, reception DJ/band, special performances)
- Flowers & decor (bouquets, centerpieces, ceremony arch, lighting)
- Invitations & stationery (save the dates, invitations, programs, thank you cards)
- Planning & admin (guest list, seating charts, vendor coordination, timeline)
- Transportation (getting to venue, guest shuttles, departure)
- Beauty & wellness (hair trial, makeup trial, spa treatments)
- Legal & financial (marriage license, name changes, insurance updates)
- Accommodations (guest hotel blocks, out-of-town visitor coordination)

REQUIREMENTS:
1. Suggest ONE specific, actionable task that fits the wedding details
2. Make sure it's NOT similar to any existing tasks
3. Use current trends and practical wedding planning needs
4. Be specific to their location, theme, and guest count when possible
5. Response format must be ONLY valid JSON with no additional text: {"title": "Task Title", "description": "Detailed description"}
6. Ensure all quotes inside the JSON values are properly escaped`;

      userPrompt = `Based on the wedding details and current trends, suggest a specific wedding planning task that hasn't been covered yet. Make it practical and actionable.`;

    } else { // description_only
      systemPrompt = `You are a helpful wedding planning assistant. Generate a detailed description for the given wedding task title.

${weddingContext}

CURRENT WEDDING TRENDS & INSIGHTS:
${trendsResult.content}

TASK TITLE TO DESCRIBE: "${title}"

REQUIREMENTS:
1. Create a detailed, actionable description for this specific task
2. Tailor it to the wedding details (location, theme, guest count, budget)
3. Include current trends and practical considerations
4. Make it specific and helpful for planning
5. Response format must be ONLY valid JSON with no additional text: {"description": "Detailed description"}
6. Ensure all quotes inside the JSON values are properly escaped`;

      userPrompt = `Create a detailed, actionable description for the task "${title}" that is tailored to this specific wedding.`;
    }

    // Get AI suggestion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // Try to parse JSON with better error handling
    let suggestion;
    try {
      suggestion = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response content:', responseContent);
      
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          suggestion = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Second JSON parse attempt failed:', secondParseError);
          // Fallback: create a response based on the type
          if (type === 'title_and_description') {
            suggestion = {
              title: "Plan wedding details",
              description: "Research and organize wedding planning tasks based on your specific needs and preferences."
            };
          } else {
            suggestion = {
              description: "Plan and organize this wedding task with attention to your specific requirements, timeline, and budget."
            };
          }
        }
      } else {
        // No JSON found, create fallback response
        if (type === 'title_and_description') {
          suggestion = {
            title: "Wedding planning task",
            description: responseContent.substring(0, 200) + "..."
          };
        } else {
          suggestion = {
            description: responseContent.substring(0, 300) + "..."
          };
        }
      }
    }

    // Validate the response format
    if (type === 'title_and_description') {
      if (!suggestion.title || !suggestion.description) {
        throw new Error('Invalid AI response format for title_and_description');
      }
    } else {
      if (!suggestion.description) {
        throw new Error('Invalid AI response format for description_only');
      }
    }

    return NextResponse.json({
      suggestion,
      trendsUsed: !!trendsResult.content,
      citations: trendsResult.citations
    });

  } catch (error) {
    console.error('Error in task-suggestions API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 