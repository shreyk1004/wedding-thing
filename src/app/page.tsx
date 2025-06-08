import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      redirect('/tasks');
    } else {
      redirect('/chat');
    }
  } catch (error) {
    console.error('Error getting session:', error);
    redirect('/chat');
  }
  
  return null;
}
