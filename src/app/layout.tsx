import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { AuthProvider } from '@/components/auth-provider';
import { AuthGuard } from '@/components/auth-guard';
import { ChatProvider } from '@/components/chat-provider';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#fefefe] to-[#f9f8f6] overflow-x-hidden">
        <AuthProvider>
          <AuthGuard>
            <ChatProvider>
              <div className="flex h-full grow">
                <Sidebar />
                <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-[960px] p-4">
                    {children}
                  </div>
                </div>
              </div>
            </ChatProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
