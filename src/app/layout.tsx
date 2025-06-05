import './globals.css';
import { Sidebar } from '@/components/sidebar';
import type { ReactNode } from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weddy - AI Wedding Planning Tool",
  description: "A modern, elegant wedding planning tool to help you organize your perfect day.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#fefefe] to-[#f9f8f6] overflow-x-hidden">
        <div className="flex h-full grow">
          <Sidebar />
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[960px] p-4">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
