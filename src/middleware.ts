import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Define API routes that don't require authentication
  const publicApiRoutes = ['/api/task-help', '/api/chat', '/api/wedding', '/api/agent'];
  const isPublicApiRoute = publicApiRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // If accessing API routes without authentication (except public routes)
  if (req.nextUrl.pathname.startsWith('/api/') && !session && !isPublicApiRoute) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 