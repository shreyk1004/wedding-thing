import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { AuthProvider } from '@/components/auth-provider';
import { ChatProvider } from '@/components/chat-provider';
import type { ReactNode } from 'react';
import type { Metadata } from "next";

// Import all the fonts we'll use
const fontFamilies = [
  'Playfair+Display',
  'Cormorant+Garamond',
  'Libre+Baskerville',
  'Cinzel',
  'Italiana',
  'Gilda+Display',
  'Marcellus',
  'Spectral',
  'Crimson+Text',
  'Bodoni+Moda',
  'Montserrat',
  'Lato',
  'Open+Sans',
  'Raleway',
  'Nunito+Sans',
  'Source+Sans+Pro',
  'Work+Sans',
  'Quicksand',
  'DM+Sans',
  'Inter',
  'Karla',
  'Mulish',
  'Roboto',
  'Poppins',
  'Manrope',
  'Outfit',
  'Plus+Jakarta+Sans',
  'Albert+Sans',
  'Sora',
  'Urbanist'
].join('&family=');

export const metadata: Metadata = {
  title: "Weddy - AI Wedding Planning Tool",
  description: "A modern, elegant wedding planning tool to help you organize your perfect day.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href={`https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#fefefe] to-[#f9f8f6] overflow-x-hidden">
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
