import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Session cleared' });

    // Clear all possible auth cookies
    const cookiesToClear = [
      'sb-atwcovxfbxxdrecjsfyy-auth-token',
      'supabase-auth-token',
      'supabase.auth.token',
      'sb-auth-token',
      'test-cookie'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/'
      });
    });

    return response;
  } catch (error) {
    console.error('Clear session error:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
} 