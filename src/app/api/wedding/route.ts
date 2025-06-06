import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { weddingDetailsSchema } from '@/types/wedding';
import { getSupabaseClient } from '@/lib/supabase';

// Create Supabase client with anon key (RLS is disabled so this works)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const WeddingCreateSchema = z.object({
  partner1name: z.string(),
  partner2name: z.string(),
  weddingdate: z.string(),
  city: z.string(),
  photos: z.array(z.string()).optional().default([]),
  theme: z.string().optional().default('modern'),
  estimatedguestcount: z.number().optional().default(0),
  specialrequirements: z.array(z.string()).optional().default([]),
  contactemail: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  budget: z.number().optional().default(0),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const validatedData = WeddingCreateSchema.parse(body);

    // Save to Supabase using anon key (RLS disabled)
    const { data, error } = await supabase
    // Convert keys to lowercase for Supabase
    const lowercasedData = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k.toLowerCase(), v])
    );
    // Save to Supabase using admin client to bypass RLS
    const supabase = getSupabaseClient(true);
    const { error } = await supabase
      .from('weddings')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create wedding' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
} 