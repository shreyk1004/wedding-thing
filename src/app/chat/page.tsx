"use client";

import { WeddingChat } from '@/components/WeddingChat';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/tasks');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        {!user && (
          <Link href="/login" className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Login
          </Link>
        )}
        <WeddingChat />
      </div>
    </div>
  );
} 