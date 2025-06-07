"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { WebsiteBuilder } from '@/components/WebsiteBuilder';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  theme: string;
  design?: any;
}

function WebsitePreviewContent() {
  const searchParams = useSearchParams();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const weddingId = searchParams.get('id');
    if (!weddingId) {
      setError('No wedding ID provided');
      return;
    }

    fetchWeddingData(weddingId);
  }, [searchParams]);

  const fetchWeddingData = async (weddingId: string) => {
    try {
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
    } catch (err) {
      setError('Failed to fetch wedding data');
      console.error('Error:', err);
    }
  };

  const handleRegenerateDesign = async () => {
    if (!weddingData) return;
    
    setIsRegenerating(true);
    
    try {
      // First, clear the existing design from the database to force regeneration
      const { error: clearError } = await supabase
        .from('weddings')
        .update({ design: null })
        .eq('id', weddingData.id);

      if (clearError) {
        console.error('Error clearing design:', clearError);
      }

      // Now generate a new design
      const response = await fetch('/api/design-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingData.id
        }),
      });

      if (response.ok) {
        // Refetch wedding data to get the new design
        await fetchWeddingData(weddingData.id);
      } else {
        console.error('Failed to regenerate design:', response.statusText);
      }
    } catch (err) {
      console.error('Error regenerating design:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

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
    <WebsiteBuilder 
      weddingData={weddingData}
      isGenerating={isRegenerating}
      onRegenerateDesign={handleRegenerateDesign}
    />
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