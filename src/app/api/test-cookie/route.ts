import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  
  // Try to read any existing test cookie
  const testCookie = cookieStore.get('test-cookie');
  
  // Create response and set a test cookie
  const response = NextResponse.json({
    message: 'Cookie test',
    existingCookie: testCookie?.value || 'none',
    allCookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
  });
  
  // Set a test cookie
  response.cookies.set('test-cookie', 'test-value-' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return response;
} 