import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expires_at } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 });
    }

    // Verify the token with Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create response with session cookies
    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
    });

    // Set the auth cookies that the middleware expects
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: expires_at ? expires_at - Math.floor(Date.now() / 1000) : 60 * 60 * 24, // Use expires_at or 24 hours
      path: '/'
    };

    // Set multiple cookie formats to ensure compatibility
    response.cookies.set('sb-atwcovxfbxxdrecjsfyy-auth-token', JSON.stringify({
      access_token,
      refresh_token,
      expires_at,
      user
    }), cookieOptions);

    response.cookies.set('supabase-auth-token', access_token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Session sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 