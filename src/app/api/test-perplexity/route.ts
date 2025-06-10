import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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
            content: 'You are a helpful assistant that provides concise information.'
          },
          {
            role: 'user',
            content: 'What are the top 3 wedding venues in San Francisco? Include pricing if available.'
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      content: data.choices[0]?.message?.content,
      citations: data.citations || data.choices[0]?.message?.citations || []
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!process.env.PERPLEXITY_API_KEY 
      },
      { status: 500 }
    );
  }
} 