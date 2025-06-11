import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Create Supabase client with service role key for server-side operations with RLS
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

// Validation schema for the request body
const PhotosUpdateSchema = z.object({
  photos: z.array(z.string().url()),
  weddingId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json();
    const validatedData = PhotosUpdateSchema.parse(body);

    // Update the wedding record with new photos
    const { error } = await supabase
      .from('weddings')
      .update({ 
        photos: validatedData.photos 
      })
      .eq('id', validatedData.weddingId);

    if (error) {
      console.error('Database error:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return new NextResponse('Photos updated successfully', { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error handling photo update:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get('url');
    const weddingId = searchParams.get('weddingId');

    if (!photoUrl || !weddingId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Get current photos
    const { data: wedding } = await supabase
      .from('weddings')
      .select('photos')
      .eq('id', weddingId)
      .single();

    if (!wedding) {
      return new NextResponse('Wedding not found', { status: 404 });
    }

    // Remove the photo URL from the array
    const updatedPhotos = wedding.photos.filter((p: string) => p !== photoUrl);

    // Update the wedding record
    const { error } = await supabase
      .from('weddings')
      .update({ photos: updatedPhotos })
      .eq('id', weddingId);

    if (error) {
      console.error('Database error:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Extract filename from URL and delete from storage
    const filename = photoUrl.split('/').pop();
    if (filename) {
      await supabase.storage
        .from('couple-photos')
        .remove([filename]);
    }

    return new NextResponse('Photo deleted successfully', { status: 200 });

  } catch (error) {
    console.error('Error handling photo deletion:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 