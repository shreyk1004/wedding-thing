import { getSupabaseClient } from './supabase';

export async function syncSessionToServer() {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.error('No session to sync.');
    return false;
  }

  try {
    const response = await fetch('/api/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync session to server');
      return false;
    }
    
    console.log('Session synced to server successfully');
    return true;
  } catch (error) {
    console.error('Error syncing session:', error);
    return false;
  }
} 