"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, Globe, Settings, MessageSquare, LogOut, X, User } from 'lucide-react';
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    return (
      <div className={cn(
        "fixed top-0 left-0 w-80 h-screen bg-white z-30 border-r border-gray-200",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} />
    );
  }
  
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 w-80 h-screen bg-white z-30 border-r border-gray-200 transition-transform transform",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-4">
              {user ? (
                // Logged in: Show Wedly + Email + User Icon in one line
                <div className="flex items-center w-full">
                  <h1 className="text-[#181511] text-base font-medium leading-normal flex-shrink-0">
                    Wedly
                  </h1>
                  <div className="w-[30%] flex-shrink-0"></div>
                  <div className="flex items-center flex-1 min-w-0 px-2 py-1 rounded-lg hover:bg-[#f9f8f6] transition-colors">
                    <p className="text-sm text-[#887863] truncate flex-1 min-w-0 mr-2">
                      {user.email}
                    </p>
                    <User className="h-5 w-5 text-[#887863] flex-shrink-0" />
                  </div>
                </div>
              ) : (
                // Not logged in: Just show Wedly
                <h1 className="text-[#181511] text-base font-medium leading-normal">
                  Wedly
                </h1>
              )}
              <button
                type="button"
                className="p-1 text-[#887863] hover:text-[#181511] lg:hidden"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose} // Close sidebar on mobile nav
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 