import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const idSchema = z.object({ id: z.string().uuid() });

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });

  const parse = idSchema.safeParse({ id: params.id });
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('wedding')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data);
} 