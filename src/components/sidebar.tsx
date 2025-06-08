"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, Globe, Settings, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from './auth-provider';

const allNavItems = [
  {
    id: 'chat',
    label: 'Chat Assistant',
    icon: MessageSquare,
    href: '/chat',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/tasks',
  },
  {
    id: 'website',
    label: 'Website',
    icon: Globe,
    href: '/website',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Try to sign out from Supabase, but don't let it fail the logout process
      try {
        await supabase.auth.signOut();
        console.log('✅ Supabase signout successful');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase signout failed, but continuing with local cleanup:', supabaseError);
      }
      
      // Clear local session data
      localStorage.removeItem('sb-atwcovxfbxxdrecjsfyy-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('weddingDetails');
      
      // Clear any auth cookies by making a request to clear them
      try {
        await fetch('/api/clear-session', { method: 'POST', credentials: 'include' });
      } catch (clearError) {
        console.warn('⚠️ Failed to clear server session, but continuing:', clearError);
      }
      
      console.log('✅ Logout complete, redirecting...');
      
      // Force a full page refresh to ensure all state is cleared
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/login';
    }
  };

  const navItems = user
    ? allNavItems.filter((item) => item.id !== 'chat')
    : allNavItems.filter((item) => item.id === 'chat');

  if (loading) {
    // You might want a skeleton loader here
    return (
        <div className="fixed top-0 left-0 w-80 h-screen bg-white z-10 border-r border-gray-200" />
    );
  }

  return (
    <div className="fixed top-0 left-0 w-80 h-screen bg-white z-10 border-r border-gray-200">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#181511] text-base font-medium leading-normal">
            Weddy
          </h1>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                    isActive
                      ? 'bg-[#f4f3f0] text-[#181511]'
                      : 'text-[#887863] hover:bg-[#f9f8f6] hover:text-[#181511]'
                  )}
                >
                  <Icon size={24} />
                  <p className="text-sm font-medium leading-normal">
                    {item.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {user && (
            <>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#887863] hover:bg-[#f9f8f6] hover:text-[#181511] transition-colors"
              >
                <LogOut size={24} />
                <p className="text-sm font-medium leading-normal">
                  Sign Out
                </p>
              </button>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e89830] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d88a29] transition-colors">
                <span className="truncate">Preview Website</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 