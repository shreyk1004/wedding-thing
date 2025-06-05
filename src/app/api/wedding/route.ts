import { weddingDetailsSchema } from '@/types/wedding';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Validate data
    const parsed = weddingDetailsSchema.safeParse(data);
    if (!parsed.success) {
      return new Response('Invalid data', { status: 400 });
    }
    // TODO: Save to Supabase here
    console.log('Received wedding details:', parsed.data);
    return new Response('OK', { status: 200 });
  } catch (err) {
    return new Response('Failed to save', { status: 500 });
  }
} 