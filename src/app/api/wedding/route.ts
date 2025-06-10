import { NextRequest, NextResponse } from 'next/server';
import { weddingDetailsSchema } from '@/types/wedding';
import { getSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';

const WeddingCreateSchema = z.object({
  partner1name: z.string(),
  partner2name: z.string(),
  weddingdate: z.string(),
  city: z.string(),
  photos: z.array(z.string()).optional().default([]),
  theme: z.string().optional().default('modern'),
  estimatedguestcount: z.number().optional().default(0),
  specialrequirements: z.array(z.string()).optional().default([]),
  contactemail: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  budget: z.number().optional().default(0),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
});

const WeddingUpdateSchema = z.object({
  partner1name: z.string().optional(),
  partner2name: z.string().optional(),
  weddingdate: z.string().optional(),
  city: z.string().optional(),
  theme: z.string().optional(),
  estimatedguestcount: z.number().optional(),
  specialrequirements: z.array(z.string()).optional(),
  contactemail: z.string().optional(),
  phone: z.string().optional(),
  budget: z.number().optional(),
});

// Helper function to get user from authorization header
async function getUserFromAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const supabaseAdmin = getSupabaseClient(true);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// Helper function to get user from middleware (more reliable)
async function getUserFromMiddleware(request: NextRequest) {
  const userHeader = request.headers.get('x-user-id');
  if (!userHeader) return null;
  
  return { id: userHeader };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/wedding - Request body:', body);

    const user = await getUserFromMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Separate tasks from the rest of the data
    const { tasks, ...weddingData } = body;

    // Validate the input data
    const validatedData = WeddingCreateSchema.omit({ tasks: true }).parse(weddingData);

    const supabaseAdmin = getSupabaseClient(true);

    const { data: wedding, error: weddingError } = await supabaseAdmin
      .from('weddings')
      .insert([{ ...validatedData, user_id: user.id }])
      .select()
      .single();

    if (weddingError) {
      console.error('Supabase wedding insert error:', weddingError);
      return NextResponse.json({ error: weddingError.message }, { status: 500 });
    }

    // If there are tasks, insert them
    if (tasks && tasks.length > 0) {
      const tasksToInsert = tasks.map((task: any) => ({
        title: task.title,
        description: task.description || '',
        user_id: user.id,
        status: 'todo',
      }));

      const { error: tasksError } = await supabaseAdmin
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Supabase tasks insert error:', tasksError);
        // Note: In a real app, you might want to handle this more gracefully,
        // maybe by deleting the created wedding entry (transactional approach)
        return NextResponse.json({ error: 'Failed to save tasks.' }, { status: 500 });
      }
    }

    console.log('POST /api/wedding - Inserted data:', wedding);
    return NextResponse.json({ data: wedding });
  } catch (error) {
    console.error('Error in POST /api/wedding:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware header
    const user = await getUserFromMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseClient(true);
    const { data, error } = await supabaseAdmin
      .from('weddings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data?.[0] || null });
  } catch (error) {
    console.error('Error in GET /api/wedding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PUT /api/wedding - Request body:', body);

    // Validate the input data
    const validatedData = WeddingUpdateSchema.parse(body);

    // Get user ID from middleware header
    const user = await getUserFromMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseClient(true);
    
    // Update the user's most recent wedding
    const { data, error } = await supabaseAdmin
      .from('weddings')
      .update(validatedData)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('PUT /api/wedding - Updated data:', data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/wedding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 