"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PreviewContent } from './PreviewContent';
import type { WeddingDesign } from '@/types/design';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  design: WeddingDesign;
  contactemail: string;
  phone?: string;
}

// Generate a default design based on wedding data
function generateDefaultDesign(): WeddingDesign {
  return {
    colors: {
      primary: '#e89830',
      secondary: '#f5f5f5', 
      accent: '#d88a29'
    },
    fonts: {
      names: 'Playfair Display',
      datetime: 'Montserrat',
      body: 'Karla'
    }
  };
}

export function PreviewPageClient({ weddingId }: { weddingId: string }) {
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWedding() {
      try {
        const supabase = createClientComponentClient();
        
        const { data, error: fetchError } = await supabase
          .from('weddings')
          .select('*')
          .eq('id', weddingId)
          .single();

        if (fetchError) {
          throw new Error('Wedding not found');
        }

        let weddingData = data as WeddingData;
        
        // Generate design if it doesn't exist
        if (!weddingData.design) {
          const defaultDesign = generateDefaultDesign();
          
          // Update the wedding with the default design
          const { error: updateError } = await supabase
            .from('weddings')
            .update({ design: defaultDesign })
            .eq('id', weddingId);

          if (updateError) {
            console.error('Failed to update design:', updateError);
          }
          
          weddingData.design = defaultDesign;
        }

        setWedding(weddingData);
      } catch (err) {
        console.error('Error fetching wedding:', err);
        setError('Failed to load wedding data');
      } finally {
        setLoading(false);
      }
    }

    fetchWedding();
  }, [weddingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wedding website...</p>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wedding Not Found</h1>
          <p className="text-gray-600">{error || 'The wedding you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return <PreviewContent data={wedding} />;
} 