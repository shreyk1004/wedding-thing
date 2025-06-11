import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { weddingId, subdomain } = await req.json();

    if (!weddingId || !subdomain) {
      return NextResponse.json({ error: 'Missing weddingId or subdomain' }, { status: 400 });
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
      return NextResponse.json({ error: 'Invalid subdomain format. Use only letters, numbers, and hyphens.' }, { status: 400 });
    }

    // Use admin client for server-side operations with RLS
    const supabaseAdmin = getSupabaseClient(true);

    // Check if subdomain is already taken
    const { data: existingWedding } = await supabaseAdmin
      .from('weddings')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingWedding) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
    }

    // Get wedding data to verify it exists
    const { data: wedding, error: weddingError } = await supabaseAdmin
      .from('weddings')
      .select('id, partner1name, partner2name')
      .eq('id', weddingId)
      .single();

    if (weddingError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Derive base domain from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase configuration not found' }, { status: 500 });
    }
    
    // Extract the base domain from Supabase URL (e.g., atwcovxfbxxdrecjsfyy.supabase.co -> weddyapp.com)
    // For development, we'll use the configured APP_DOMAIN or derive from Supabase
    let baseDomain = process.env.APP_DOMAIN;
    
    if (!baseDomain) {
      // If no APP_DOMAIN is set, derive it from Supabase URL for development
      const supabaseHost = new URL(supabaseUrl).hostname;
      // For production, you'd want to use your actual domain
      // For development, we'll create a domain based on your Supabase project
      baseDomain = `weddyapp-${supabaseHost.split('.')[0]}.vercel.app`;
    }

    const fullDomain = `${subdomain}.${baseDomain}`;

    // Add domain to Vercel project
    if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_API_TOKEN) {
      const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullDomain }),
      });

      const vercelData = await vercelResponse.json();

      // Only fail if it's a real error (not if domain already exists)
      if (!vercelResponse.ok && vercelData.error?.code !== 'domain_already_exists') {
        console.error('Vercel API Error:', vercelData);
        return NextResponse.json({ 
          error: 'Failed to configure domain with Vercel', 
          details: vercelData.error 
        }, { status: 500 });
      }
    }

    // Update database with subdomain
    const { error: updateError } = await supabaseAdmin
      .from('weddings')
      .update({ subdomain })
      .eq('id', weddingId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to save subdomain' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Website published successfully!', 
      url: `https://${fullDomain}`,
      subdomain 
    });

  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 