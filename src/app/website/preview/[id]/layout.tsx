import type { ReactNode } from 'react';

export default function PreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
} 