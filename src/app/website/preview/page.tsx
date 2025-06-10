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
  regenerateKey?: number;
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
    
    console.log('🎨 Triggering design regeneration...');
    setIsRegenerating(true);
    
    // Force a re-render by updating the wedding data timestamp
    // This will trigger WebsiteBuilder to regenerate the design
    setWeddingData({
      ...weddingData,
      regenerateKey: Date.now() // Add a key to force regeneration
    });
    
    // Reset the regenerating state after a short delay
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1000);
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