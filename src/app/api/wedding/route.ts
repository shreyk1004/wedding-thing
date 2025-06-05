import { weddingDetailsSchema } from '@/types/wedding';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Validate data
    const parsed = weddingDetailsSchema.safeParse(data);
    if (!parsed.success) {
      return new Response('Invalid data', { status: 400 });
    }
    // Convert keys to lowercase for Supabase
    const lowercasedData = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k.toLowerCase(), v])
    );
    // Save to Supabase
    const { error } = await supabase
      .from('weddings')
      .insert([lowercasedData]);
    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to save to Supabase: ' + error.message, { status: 500 });
    }
    return new Response('OK', { status: 200 });
  } catch (err) {
    return new Response('Failed to save', { status: 500 });
  }
} 