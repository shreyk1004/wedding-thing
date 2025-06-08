"use client";

import { useEffect, useState, Suspense } from 'react';
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
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchUserWeddingData();
  }, []);

  const fetchUserWeddingData = async () => {
    try {
      console.log('Fetching authenticated user wedding data for preview...');
      
      // Use the secure API endpoint that gets the user's wedding data
      const response = await fetch('/api/wedding', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your wedding website');
          return;
        }
        throw new Error('Failed to fetch wedding data');
      }

      const result = await response.json();
      console.log('Fetched user wedding data for preview:', result);

      if (!result.data) {
        setError('No wedding data found. Please create your wedding website first.');
        return;
      }

      setWeddingData(result.data);
    } catch (err) {
      setError('Failed to fetch wedding data');
      console.error('Error:', err);
    }
  };

  const handleRegenerateDesign = async () => {
    if (!weddingData) return;
    
    console.log('🎨 Starting design regeneration for wedding:', weddingData.id);
    setIsRegenerating(true);
    
    try {
      // Generate a new design using the wedding ID
      console.log('🔄 Calling design-recipe API...');
      const response = await fetch('/api/design-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingData.id
        }),
      });

      console.log('📡 Design API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Design regenerated successfully:', result);
        
        // Refetch wedding data to get the new design
        console.log('🔄 Refetching wedding data...');
        await fetchUserWeddingData();
        console.log('✅ Wedding data refetched successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to regenerate design:', response.status, errorText);
      }
    } catch (err) {
      console.error('❌ Error regenerating design:', err);
    } finally {
      setIsRegenerating(false);
      console.log('🏁 Regeneration process completed');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/website'}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Wedding Website
          </button>
        </div>
      </div>
    );
  }

  if (!weddingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ color: 'black' }}>Loading your wedding website...</p>
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