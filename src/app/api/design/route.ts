import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { AVAILABLE_FONTS } from '@/types/design';
import type { WeddingDesign } from '@/types/design';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DesignRequestSchema = z.object({
  weddingId: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const { weddingId } = DesignRequestSchema.parse(body);

    // Get wedding details
    const { data: wedding, error } = await supabase
      .from('wedding')
      .select('*')
      .eq('id', weddingId)
      .single();

    if (error || !wedding) {
      return new NextResponse('Wedding not found', { status: 404 });
    }

    // Generate design using GPT
    const prompt = `
      Create a wedding website design for a ${wedding.theme} themed wedding.
      The couple's names are ${wedding.partner1name} and ${wedding.partner2name}.
      The wedding is in ${wedding.city}.
      
      Please provide:
      1. A color palette with exactly 3 colors (primary, secondary, accent) that match the ${wedding.theme} theme. Return only hex codes.
      2. Select appropriate fonts from these options:
         - For names (choose from): ${AVAILABLE_FONTS.names.join(', ')}
         - For date/time/venue (choose from): ${AVAILABLE_FONTS.datetime.join(', ')}
         - For body text (choose from): ${AVAILABLE_FONTS.body.join(', ')}
      
      Return the response in this exact JSON format:
      {
        "colors": {
          "primary": "#hex",
          "secondary": "#hex",
          "accent": "#hex"
        },
        "fonts": {
          "names": "font name",
          "datetime": "font name",
          "body": "font name"
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a wedding website designer. You will return only valid JSON in the exact format requested, with no additional text or explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const design = JSON.parse(content) as WeddingDesign;

    // Store the design in Supabase
    const { error: updateError } = await supabase
      .from('wedding')
      .update({
        design: design
      })
      .eq('id', weddingId);

    if (updateError) {
      return new NextResponse('Failed to save design', { status: 500 });
    }

    return NextResponse.json(design);

  } catch (error) {
    console.error('Error generating design:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 