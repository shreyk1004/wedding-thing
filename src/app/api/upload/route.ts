import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key (bypasses ALL security)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const weddingId = formData.get('weddingId') as string;

    console.log('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      weddingId
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!weddingId) {
      return NextResponse.json({ error: 'No wedding ID provided' }, { status: 400 });
    }

    // Validate file size (50MB limit - for high-quality professional wedding photography)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 50MB)' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // Generate file path
    const timestamp = new Date().getTime();
    const filePath = `${weddingId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '_')}`;
    
    console.log('Uploading to path:', filePath);

    // Upload to Supabase storage using service role key (bypasses ALL RLS)
    const { error: uploadError, data } = await supabase.storage
      .from('couple-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file', 
        details: uploadError.message 
      }, { status: 500 });
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('couple-photos')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 