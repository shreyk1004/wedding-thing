"use client";

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Hide the shell for auth-related pages
  if (['/login', '/setup-password', '/forgot-password'].includes(pathname)) {
    return (
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[960px] p-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-80">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-center text-sm font-semibold leading-6 text-gray-900">
            Weddy
          </div>
        </header>

        <main className="flex-1 flex justify-center">
            <div className="w-full max-w-[960px] p-4">
                {children}
            </div>
        </main>
      </div>
    </>
  );
} 