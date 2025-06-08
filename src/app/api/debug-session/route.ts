import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  
  return NextResponse.json({
    session: session ? {
      user: session.user,
      expires_at: session.expires_at
    } : null,
    error: error?.message || null
  });
} 