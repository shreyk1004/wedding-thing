import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper function to extract auth token from cookies
function getAuthToken(request: NextRequest): string | null {
  const cookies = request.cookies;
  
  // Try different possible cookie names
  const possibleCookieNames = [
    'sb-atwcovxfbxxdrecjsfyy-auth-token',
    'supabase-auth-token',
    'supabase.auth.token',
    'sb-auth-token'
  ];
  
  for (const cookieName of possibleCookieNames) {
    const cookie = cookies.get(cookieName);
    if (cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        return parsed.access_token || parsed;
      } catch {
        return cookie.value;
      }
    }
  }
  
  return null;
}

// Helper function to verify JWT token
async function verifySession(token: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return null;
    
    return {
      user,
      expires_at: Date.now() / 1000 + 3600 // Assume 1 hour expiry
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Skip middleware for browser internal requests and static assets
  const pathname = req.nextUrl.pathname;
  const shouldSkip = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.') && !pathname.startsWith('/api/'); // Static files
  
  if (shouldSkip) {
    return res;
  }
  
  try {
    // Get auth token from cookies
    const authToken = getAuthToken(req);
    let session = null;
    let sessionError = null;
    
    if (authToken) {
      session = await verifySession(authToken);
      if (!session) {
        sessionError = { message: 'Invalid or expired token' };
      }
    } else {
      sessionError = { message: 'No auth token found' };
    }
    
    // Debug logging (only for app routes)
    console.log(`\n=== MIDDLEWARE DEBUG ===`);
    console.log(`Path: ${pathname}`);
    console.log(`Method: ${req.method}`);
    console.log(`Session exists: ${session ? 'YES' : 'NO'}`);
    
    if (session) {
      console.log(`User ID: ${session.user?.id}`);
      console.log(`User email: ${session.user?.email}`);
      console.log(`Expires at: ${new Date(session.expires_at! * 1000).toISOString()}`);
    } else {
      console.log(`Session error: ${sessionError?.message || 'No session found'}`);
      
      // Check for auth cookies with different possible names
      const cookies = req.headers.get('cookie') || '';
      console.log(`All cookies: ${cookies}`);
      
      const possibleAuthCookies = [
        'sb-atwcovxfbxxdrecjsfyy-auth-token',
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-auth-token'
      ];
      
      const foundCookies = possibleAuthCookies.filter(cookieName => 
        cookies.includes(cookieName)
      );
      
      console.log(`Auth cookies found: ${foundCookies.length > 0 ? foundCookies.join(', ') : 'NONE'}`);
      
      if (foundCookies.length > 0) {
        console.log(`⚠️  Auth cookies exist but session parsing failed`);
      }
    }
    console.log(`========================\n`);

    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/chat', '/setup-password', '/login'];
    const publicApiRoutes = ['/api/task-help', '/api/chat', '/api/agent', '/api/debug-session', '/api/test-cookie', '/api/sync-session', '/api/clear-session'];
    
    const isPublicRoute = publicRoutes.includes(pathname);
    const isPublicApiRoute = publicApiRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Special handling for /api/wedding - POST is public (onboarding), GET requires auth
    const isWeddingApiRoute = pathname === '/api/wedding';
    const isWeddingApiPublic = isWeddingApiRoute && req.method === 'POST';

    // If accessing API routes without authentication (except public routes)
    if (pathname.startsWith('/api/') && !session && !isPublicApiRoute && !isWeddingApiPublic) {
      console.log(`🚫 BLOCKING API: ${pathname} - No session`);
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If accessing protected pages without authentication
    if (!isPublicRoute && !pathname.startsWith('/api/') && !session) {
      console.log(`🚫 REDIRECTING: ${pathname} → /chat - No session`);
      const redirectUrl = new URL('/chat', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // For API routes with valid session, add user ID header to avoid cookies issue
    if (pathname.startsWith('/api/') && session?.user?.id) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', session.user.id);
      console.log(`✅ ALLOWING: ${pathname} - Added user ID header`);
      return response;
    }

    console.log(`✅ ALLOWING: ${pathname}`);
    return res;
  } catch (error) {
    console.error('❌ MIDDLEWARE ERROR:', error);
    // On error, allow the request to continue but log it
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (browser internal requests)
     * - any file with extension except API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\..*).*)',
    '/api/:path*',
  ],
}; 