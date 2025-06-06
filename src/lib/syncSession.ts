import { supabase } from './supabase';

export async function syncSessionToServer() {
  try {
    // Get the current session from localStorage
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session || error) {
      console.log('No session to sync:', error?.message);
      return false;
    }

    // Make a request to sync the session with the server
    const response = await fetch('/api/sync-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }),
      credentials: 'include'
    });

    if (response.ok) {
      console.log('✅ Session synced to server');
      return true;
    } else {
      console.log('❌ Failed to sync session to server');
      return false;
    }
  } catch (error) {
    console.error('Session sync error:', error);
    return false;
  }
} 