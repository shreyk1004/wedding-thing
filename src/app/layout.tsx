import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from "next";
import { Sidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Wedding Website Generator',
  description: 'Create your perfect wedding website with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Cinzel:wght@400;700&family=Italiana&family=Gilda+Display&family=Marcellus&family=Spectral:wght@400;700&family=Crimson+Text:wght@400;700&family=Bodoni+Moda:wght@400;700&family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Raleway:wght@300;400;500;600;700&family=Nunito+Sans:wght@300;400;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Work+Sans:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=Karla:wght@300;400;500;600;700&family=Mulish:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Albert+Sans:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Urbanist:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#fafafa] min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 bg-[#fafafa]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
