import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create Supabase client with service role key for server-side operations with RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const idSchema = z.object({ id: z.string().uuid() });

const WeddingUpdateSchema = z.object({
  partner1name: z.string().optional(),
  partner2name: z.string().optional(),
  weddingdate: z.string().optional(),
  city: z.string().optional(),
  theme: z.string().optional(),
  photos: z.array(z.string()).optional(),
  design: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  
  // Await the params promise
  const { id } = await params;

  const parse = idSchema.safeParse({ id });

  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  
  // Await the params promise
  const { id } = await params;

  const idParse = idSchema.safeParse({ id });

  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = WeddingUpdateSchema.parse(body);

    // Update the wedding
    const { data, error } = await supabase
      .from('weddings')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update wedding' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
} 