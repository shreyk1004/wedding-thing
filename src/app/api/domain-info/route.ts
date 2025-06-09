import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const customDomain = process.env.APP_DOMAIN;
    
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    let baseDomain = customDomain;
    
    if (!baseDomain) {
      // Derive from Supabase URL
      const supabaseHost = new URL(supabaseUrl).hostname;
      const projectId = supabaseHost.split('.')[0];
      baseDomain = `weddyapp-${projectId}.vercel.app`;
    }

    return NextResponse.json({
      supabaseUrl,
      customDomain: customDomain || null,
      derivedDomain: baseDomain,
      exampleSubdomain: `john-sarah.${baseDomain}`,
      configuration: {
        usingCustomDomain: !!customDomain,
        supabaseProjectId: new URL(supabaseUrl).hostname.split('.')[0],
        instructions: customDomain 
          ? 'Using custom domain from APP_DOMAIN environment variable'
          : 'Using domain derived from Supabase project URL. To use a custom domain, set APP_DOMAIN in .env.local'
      },
      message: customDomain 
        ? 'Using custom domain from APP_DOMAIN environment variable'
        : 'Using domain derived from Supabase project URL'
    });

  } catch (error) {
    console.error('Domain info error:', error);
    return NextResponse.json({ error: 'Failed to get domain info' }, { status: 500 });
  }
} 