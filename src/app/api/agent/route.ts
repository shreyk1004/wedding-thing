import OpenAI from 'openai';
import { getSupabaseClient } from '@/lib/supabase';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Helper function to get user from middleware header
function getUserFromMiddleware(request: NextRequest) {
  const userHeader = request.headers.get('x-user-id');
  if (!userHeader) return null;
  
  return { id: userHeader };
}

export async function POST(req: NextRequest) {
  const { task, extraInfo, messages } = await req.json();

  // Get user ID from middleware header
  const user = getUserFromMiddleware(req);
  if (!user) {
    return new Response(
      JSON.stringify({ reply: 'Please log in to access AI assistance.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build context for classification
  const userText = (messages && messages.length > 0 && messages[messages.length - 1]?.content) || '';
  const intentText = userText || `${task?.title || ''} ${task?.description || ''}`;
  
  // Fetch wedding details for this specific user
  const supabaseAdmin = getSupabaseClient(true);
  const { data: weddingRows, error: weddingError } = await supabaseAdmin
    .from('weddings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);
  
  console.log('Wedding rows for user:', weddingRows, 'Error:', weddingError);
  
  const latestWeddingDetails = weddingRows && weddingRows.length > 0 ? weddingRows[0] : null;
  if (!latestWeddingDetails) {
    return new Response(
      JSON.stringify({ reply: 'No wedding details found for your account. Please complete the wedding setup first.' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const city = latestWeddingDetails.city || '';
  const date = latestWeddingDetails.weddingdate || '';
  const guestCount = latestWeddingDetails.estimatedguestcount || '';
  const theme = latestWeddingDetails.theme || '';
  const budget = latestWeddingDetails.budget || '';
  const contextString = `Wedding Details: Location: ${city}, Date: ${date}, Guests: ${guestCount}, Theme: ${theme}, Budget: ${budget}`;

  // Ask OpenAI how to handle this task
  const classifyPrompt = `
You are an expert wedding planning agent. Given the following task and context, decide if you should (a) provide real-world options (like venues, vendors, etc.), (b) give planning advice, or (c) something else.

If (a), provide a list of real-world options with names, descriptions, and links (if possible).
If (b), provide a step-by-step plan.
If (c), explain.

Examples:
Task: Book a wedding venue in Miami. Context: Wedding Details: Location: Miami, Date: 2024-09-15, Guests: 120, Theme: Beach, Budget: 20000
Response: { "action": "research", "options": [ { "name": "Venue Name", "description": "...", "link": "..." }, ... ] }

Task: Choose a photographer. Context: Wedding Details: Location: Naples, Date: 2024-10-10, Guests: 80, Theme: Rustic, Budget: 15000
Response: { "action": "research", "options": [ { "name": "Photographer Name", "description": "...", "link": "..." }, ... ] }

Task: Plan the wedding timeline. Context: Wedding Details: Location: Naples, Date: 2024-10-10, Guests: 80, Theme: Rustic, Budget: 15000
Response: { "action": "advice", "plan": "Step 1: ..." }

Task: ${intentText}
${contextString}

Respond in this JSON format: { "action": "research" | "advice" | "other", "options"?: any[], "plan"?: string, "explanation"?: string }
`;

  const classifyRes = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are a helpful wedding planning agent.' },
      { role: 'user', content: classifyPrompt },
    ],
    temperature: 0.2,
    max_tokens: 800,
  });
  
  let action = 'advice';
  let options = [];
  let plan = '';
  let explanation = '';
  
  try {
    const parsed = JSON.parse(classifyRes.choices[0]?.message?.content || '{}');
    action = parsed.action || 'advice';
    options = parsed.options || [];
    plan = parsed.plan || '';
    explanation = parsed.explanation || '';
  } catch (e) {
    // fallback to advice
  }

  if (action === 'research' && options.length > 0) {
    // Generate images for each option using DALL-E
    const optionsWithImages = await Promise.all(
      options.map(async (option: any) => {
        try {
          const imagePrompt = `A beautiful, high-quality photo of the wedding venue or vendor ${option.name} in ${city}`;
          const imageRes = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '512x512',
          });
          const imageUrl = imageRes.data && imageRes.data[0] ? imageRes.data[0].url : '';
          return { ...option, imageUrl };
        } catch (e) {
          return { ...option, imageUrl: '' };
        }
      })
    );
    
    return new Response(
      JSON.stringify({ venues: optionsWithImages }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } else if (action === 'advice') {
    // Build a robust details string only with present fields
    const details = [
      city && `Location: ${city}`,
      date && `Date: ${date}`,
      guestCount && `Guests: ${guestCount}`,
      theme && `Theme: ${theme}`,
      budget && `Budget: ${budget}`
    ].filter(Boolean).join(', ');

    const advicePrompt = details
      ? `Given these wedding details: ${details}, provide a step-by-step plan for: ${intentText}`
      : `Provide a step-by-step plan for: ${intentText}`;

    const adviceRes = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful wedding planning agent.' },
        { role: 'user', content: advicePrompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    
    const plan = adviceRes.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return new Response(
      JSON.stringify({ reply: plan }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } else if (action === 'other' && explanation) {
    return new Response(
      JSON.stringify({ reply: explanation }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ reply: 'I apologize, but I could not process your request.' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
} 