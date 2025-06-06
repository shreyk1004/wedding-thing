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
  }
} 