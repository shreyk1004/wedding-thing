"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  theme: string;
}

export default function WebsitePreviewPage() {
  const searchParams = useSearchParams();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const weddingId = searchParams.get('id');
    if (!weddingId) {
      setError('No wedding ID provided');
      return;
    }

    async function fetchWeddingData() {
      const { data, error } = await supabase
        .from('wedding')
        .select('*')
        .eq('id', weddingId)
        .single();

      if (error) {
        setError('Failed to fetch wedding data');
        console.error('Error:', error);
        return;
      }

      setWeddingData(data);
    }

    fetchWeddingData();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!weddingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ color: 'black' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: 'black' }}>
          {weddingData.partner1name} & {weddingData.partner2name}
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-xl" style={{ color: 'black' }}>
            {new Date(weddingData.weddingdate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-lg mt-2" style={{ color: 'black' }}>{weddingData.city}</p>
        </div>

        {weddingData.photos && weddingData.photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddingData.photos.map((photoUrl, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-lg">
                <img
                  src={photoUrl}
                  alt={`Wedding photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 