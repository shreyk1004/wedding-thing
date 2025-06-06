"use client";

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      const storedSession = localStorage.getItem('sb-atwcovxfbxxdrecjsfyy-auth-token');
      
      setSessionInfo({
        hasSession: !!session,
        user: session?.user?.email || null,
        expires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        hasLocalStorage: !!storedSession,
        error: error?.message || null
      });
    };

    checkSession();
  }, []);

  if (!sessionInfo) return <div>Loading session info...</div>;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">🔍 Session Debug</div>
      <div>Has Session: {sessionInfo.hasSession ? '✅ YES' : '❌ NO'}</div>
      <div>User: {sessionInfo.user || 'None'}</div>
      <div>LocalStorage: {sessionInfo.hasLocalStorage ? '✅ YES' : '❌ NO'}</div>
      <div>Expires: {sessionInfo.expires || 'N/A'}</div>
      {sessionInfo.error && <div className="text-red-300">Error: {sessionInfo.error}</div>}
    </div>
  );
} 