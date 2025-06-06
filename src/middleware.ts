import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    const supabase = createMiddlewareClient({ req, res });

    // Try to get session with retries
    let session = null;
    let sessionError = null;
    
    for (let i = 0; i < 2; i++) {
      const { data, error } = await supabase.auth.getSession();
      session = data.session;
      sessionError = error;
      
      if (session || !error) break;
      
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 100));
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