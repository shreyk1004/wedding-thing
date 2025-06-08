"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { SettingsTab } from '@/components/settings-tab';
import { WeddingInfo } from "@/types";

export default function SettingsPage() {
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWedding() {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching wedding data from API...');
        
        const response = await fetch('/api/wedding');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch wedding details');
        }
        
        console.log('API response:', result);
        
        if (result.data) {
          setWeddingDetails(result.data);
        } else {
          setError('No wedding details found for your account. Please complete the wedding setup first.');
        }
      } catch (err) {
        console.error('Error fetching wedding details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch wedding details. Please check your authentication.');
        setWeddingDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWedding();
  }, []);

  // Map Supabase fields to WeddingHeader fields
  const weddingInfo: WeddingInfo | null = weddingDetails ? {
    bride: weddingDetails.partner1name || 'Partner 1',
    groom: weddingDetails.partner2name || 'Partner 2',
    date: weddingDetails.weddingdate || new Date().toISOString().split('T')[0],
    venue: weddingDetails.city || 'Venue',
    theme: weddingDetails.theme || 'Not specified'
  } : null;

  // Mock completion percentage for header
  const completionPercentage = 37.5;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-500">Loading wedding details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
          {error.includes('No wedding details found') && (
            <p className="text-yellow-600 text-sm mt-1">
              Visit the <a href="/chat" className="underline">wedding setup chat</a> to add your details.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weddingInfo && (
        <WeddingHeader 
          weddingInfo={weddingInfo} 
          completionPercentage={completionPercentage} 
        />
      )}
      <SettingsTab weddingDetails={weddingDetails} />
    </div>
  );
} 