import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host');
  const url = request.nextUrl;
  
  const appDomain = process.env.APP_DOMAIN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Auto-derive domain if no custom domain
  let derivedDomain = null;
  if (!appDomain && supabaseUrl) {
    try {
      const supabaseHost = new URL(supabaseUrl).hostname;
      const projectId = supabaseHost.split('.')[0];
      derivedDomain = `weddyapp-${projectId}.vercel.app`;
    } catch (error) {
      // ignore
    }
  }
  
  const isSubdomain = appDomain ? 
    (hostname?.endsWith(`.${appDomain}`) && hostname !== appDomain) :
    (derivedDomain && hostname?.endsWith(`.${derivedDomain}`) && hostname !== derivedDomain);
  
  const subdomain = isSubdomain ? hostname?.split('.')[0] : null;
  
  return NextResponse.json({
    hostname,
    pathname: url.pathname,
    appDomain,
    derivedDomain,
    isSubdomain,
    subdomain,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
} 