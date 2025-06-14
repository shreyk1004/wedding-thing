"use client";

import { useState, Suspense } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

function ResponsiveShellContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Check if this is a subdomain request
  const subdomain = searchParams.get('subdomain');

  // For landing page, return children directly without any wrapper (full-screen experience)
  if (pathname === '/') {
    return <>{children}</>;
  }

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

  // For subdomain routes, return children directly without any shell
  if (subdomain || pathname.startsWith('/site/')) {
    return <>{children}</>;
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
            Wedly
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

export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[960px] p-4">
          {children}
        </div>
      </div>
    }>
      <ResponsiveShellContent>{children}</ResponsiveShellContent>
    </Suspense>
  );
} 