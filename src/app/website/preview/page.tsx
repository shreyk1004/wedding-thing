"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  theme: string;
}

function WebsitePreviewContent() {
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
        .from('weddings')
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
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        {weddingData.photos && weddingData.photos.length > 0 && weddingData.photos[0] ? (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={weddingData.photos[0]}
                alt="Hero"
                fill
                className="object-cover"
                sizes="100vw"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 z-1"></div>
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-gray-300 flex items-center justify-center">
            <p className="text-gray-600">No photo uploaded</p>
          </div>
        )}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
            {weddingData.partner1name} & {weddingData.partner2name}
          </h1>
          <p className="text-2xl mb-2" style={{ fontFamily: 'Montserrat' }}>
            {new Date(weddingData.weddingdate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-xl" style={{ fontFamily: 'Karla' }}>{weddingData.city}</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#e89830', fontFamily: 'Playfair Display' }}>Our Story</h2>
          {weddingData.photos && weddingData.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddingData.photos.map((photo, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg relative">
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Add photos to showcase your story</p>
            </div>
          )}
        </div>
      </section>

      {/* Wedding Details Section */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-12" style={{ color: '#e89830', fontFamily: 'Playfair Display' }}>Wedding Details</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold" style={{ color: '#d88a29', fontFamily: 'Montserrat' }}>Ceremony</h3>
              <p className="text-lg" style={{ color: 'black', fontFamily: 'Karla' }}>
                {new Date(weddingData.weddingdate).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-lg" style={{ color: 'black', fontFamily: 'Karla' }}>{weddingData.city}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold" style={{ color: '#d88a29', fontFamily: 'Montserrat' }}>Reception</h3>
              <p className="text-lg" style={{ color: 'black', fontFamily: 'Karla' }}>Following the ceremony</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function WebsitePreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ color: 'black' }}>Loading...</p>
        </div>
      </div>
    }>
      <WebsitePreviewContent />
    </Suspense>
  );
} 