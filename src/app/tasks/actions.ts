'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function addTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('User is not authenticated');
    return;
  }

  const { error } = await supabase.from('tasks').insert([
    {
      title,
      description,
      user_id: user.id,
      status: 'todo',
    },
  ]);

  if (error) {
    console.error('Error inserting task:', error);
    return;
  }

  revalidatePath('/tasks');
} 