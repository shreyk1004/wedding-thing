import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const WeddingSchema = z.object({
  partner1name: z.string(),
  partner2name: z.string(),
  weddingdate: z.string(),
  city: z.string(),
  theme: z.string().optional(),
  photos: z.array(z.string()).optional(),
  design: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Validate request body
    const body = await request.json();
    const validatedData = WeddingSchema.parse(body);

    // Insert into database
    const { data, error } = await supabase
      .from('weddings')
      .insert([{
        ...validatedData,
        contactemail: '',
        estimatedguestcount: 0,
        specialrequirements: [],
        theme: validatedData.theme || 'modern',
        photos: validatedData.photos || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create wedding' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
} 