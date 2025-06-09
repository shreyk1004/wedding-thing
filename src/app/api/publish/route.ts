import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    console.log("--- PUBLISH API START ---");

    // Log all relevant environment variables
    console.log("Vercel ENV check:", {
      APP_DOMAIN: process.env.APP_DOMAIN || 'Not Set',
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID ? 'Set' : 'Not Set',
      VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN ? 'Set' : 'Not Set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
    });

    const { weddingId, subdomain } = await req.json();
    console.log("Received data:", { weddingId, subdomain });

    if (!weddingId || !subdomain) {
      return NextResponse.json({ error: 'Missing weddingId or subdomain' }, { status: 400 });
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
      return NextResponse.json({ error: 'Invalid subdomain format. Use only letters, numbers, and hyphens.' }, { status: 400 });
    }

    // Check if subdomain is already taken
    const { data: existingWedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingWedding) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
    }

    // Get wedding data to verify it exists
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id, partner1name, partner2name')
      .eq('id', weddingId)
      .single();

    if (weddingError || !wedding) {
      console.error("Wedding not found in DB:", { weddingId, weddingError });
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }
    console.log("Found wedding:", wedding.id);

    // Derive base domain from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set in environment.");
      return NextResponse.json({ error: 'Supabase configuration not found' }, { status: 500 });
    }
    
    // Extract the base domain from Supabase URL (e.g., atwcovxfbxxdrecjsfyy.supabase.co -> weddyapp.com)
    // For development, we'll use the configured APP_DOMAIN or derive from Supabase
    let baseDomain = process.env.APP_DOMAIN;
    console.log(`Initial baseDomain from APP_DOMAIN: ${baseDomain}`);
    
    if (!baseDomain) {
      // If no APP_DOMAIN is set, derive it from Supabase URL for development
      console.log("APP_DOMAIN not set, deriving from Supabase URL...");
      const supabaseHost = new URL(supabaseUrl).hostname;
      // For production, you'd want to use your actual domain
      // For development, we'll create a domain based on your Supabase project
      baseDomain = `weddyapp-${supabaseHost.split('.')[0]}.vercel.app`;
      console.log(`Derived baseDomain: ${baseDomain}`);
    }

    const fullDomain = `${subdomain}.${baseDomain}`;
    console.log(`Attempting to register full domain: ${fullDomain}`);

    // Add domain to Vercel project
    if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_API_TOKEN) {
      console.log(`Adding domain to Vercel project: ${process.env.VERCEL_PROJECT_ID}`);
      const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullDomain }),
      });

      const vercelData = await vercelResponse.json();
      console.log("Vercel API response:", { status: vercelResponse.status, data: vercelData });

      // Only fail if it's a real error (not if domain already exists)
      if (!vercelResponse.ok && vercelData.error?.code !== 'domain_already_exists') {
        console.error('Vercel API Error:', vercelData);
        return NextResponse.json({ 
          error: 'Failed to configure domain with Vercel', 
          details: vercelData.error 
        }, { status: 500 });
      }
    } else {
      console.warn("Vercel environment variables not set. Skipping domain registration with Vercel API.");
    }

    // Update database with subdomain
    console.log(`Updating wedding ${weddingId} with subdomain ${subdomain}`);
    const { error: updateError } = await supabase
      .from('weddings')
      .update({ subdomain })
      .eq('id', weddingId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to save subdomain' }, { status: 500 });
    }

    console.log("--- PUBLISH API SUCCESS ---");
    return NextResponse.json({ 
      message: 'Website published successfully!', 
      url: `https://${fullDomain}`,
      subdomain 
    });

  } catch (error) {
    console.error('--- PUBLISH API CRITICAL ERROR ---', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 