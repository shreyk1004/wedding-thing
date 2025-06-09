import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout will be rendered inside the root layout
  // We can't override html/body tags in nested layouts
  return <>{children}</>;
} 