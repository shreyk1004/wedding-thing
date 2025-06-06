import { NextRequest, NextResponse } from 'next/server';
import { weddingDetailsSchema } from '@/types/wedding';
import { getSupabaseClient } from '@/lib/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/wedding - Request body:', body);

    const supabase = getSupabaseClient(true);

    const { data, error } = await supabase
      .from('weddings')
      .insert([body])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('POST /api/wedding - Inserted data:', data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/wedding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get the authenticated user
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseClient(true);
    const { data, error } = await supabaseAdmin
      .from('weddings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data?.[0] || null });
  } catch (error) {
    console.error('Error in GET /api/wedding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
=======
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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