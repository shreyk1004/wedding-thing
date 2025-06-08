"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

interface WeddingFormData {
  bride: string;
  groom: string;
  date: string;
  venue: string;
  theme: string;
  photos: string[];
  weddingId?: string;
}

export function WebsiteTab() {
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState<WeddingFormData>({
    bride: "",
    groom: "",
    date: "",
    venue: "",
    theme: "",
    photos: [],
    weddingId: undefined
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    async function fetchUserWeddingData() {
      try {
        console.log('Fetching authenticated user wedding data...');
        
        // Use the secure API endpoint that gets the user's wedding data
        const response = await fetch('/api/wedding', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('User not authenticated');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch wedding data');
        }

        const result = await response.json();
        console.log('Fetched user wedding data:', result);

        if (result.data) {
          const data = result.data;
          setFormData({
            bride: data.partner1name || "",
            groom: data.partner2name || "",
            date: data.weddingdate || "",
            venue: data.city || "",
            theme: data.theme || "",
            photos: (data.photos || []).filter(url => url && typeof url === 'string' && url.trim() !== ''),
            weddingId: data.id
          });
        }
      } catch (err) {
        console.error('Error fetching wedding data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserWeddingData();
  }, []);

  const handleInputChange = (field: keyof WeddingFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const urls: string[] = [];
      
      // Create wedding record first if it doesn't exist
      let currentWeddingId = formData.weddingId;
      
      if (!currentWeddingId) {
        const response = await fetch('/api/wedding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partner1name: formData.bride || 'Partner 1',
            partner2name: formData.groom || 'Partner 2',
            weddingdate: formData.date || new Date().toISOString(),
            city: formData.venue || 'To be determined',
            theme: formData.theme || 'modern',
            photos: [],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create wedding record');
        }

        const data = await response.json();
        currentWeddingId = data.id;
        setFormData(prev => ({ ...prev, weddingId: data.id }));
      }

      // Upload each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('weddingId', currentWeddingId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || `Failed to upload ${file.name}`);
        }

        const { url } = responseData;
        // Validate the URL before adding it
        if (url && typeof url === 'string' && url.trim() !== '') {
          urls.push(url);
          console.log(`Successfully uploaded: ${file.name} -> ${url}`);
        } else {
          console.error('Invalid URL returned from upload:', responseData);
          throw new Error(`Invalid URL returned for ${file.name}`);
        }
      }

      // Only proceed if we have valid URLs
      if (urls.length === 0) {
        throw new Error('No valid photo URLs generated');
      }

      // Get current photos from database to avoid race conditions
      const { data: currentWedding, error: fetchError } = await supabase
        .from('weddings')
        .select('photos')
        .eq('id', currentWeddingId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch current photos');
      }

      const currentPhotos = (currentWedding.photos || []).filter(url => url && url.trim() !== '');
      const validNewUrls = urls.filter(url => url && url.trim() !== '');
      const updatedPhotos = [...currentPhotos, ...validNewUrls];

      // Save photos to the database using the current wedding ID
      const { error: updateError } = await supabase
        .from('weddings')
        .update({ 
          photos: updatedPhotos
        })
        .eq('id', currentWeddingId);

      if (updateError) {
        throw new Error('Failed to save photos to database');
      }

      // Update local state with new photo URLs
      setFormData(prev => ({
        ...prev,
        photos: updatedPhotos
      }));

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload one or more photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFileUpload(Array.from(files));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      setUploadError('Please drop only image files.');
      return;
    }

    await handleFileUpload(files);
  };

  const handlePhotoDelete = async (photoUrl: string) => {
    try {
      // Validate photoUrl before processing
      if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
        throw new Error('Invalid photo URL');
      }

      // Extract the filename from the URL
      const urlParts = photoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const weddingIdToUse = formData.weddingId;
      
      if (!weddingIdToUse) {
        throw new Error('No wedding ID available');
      }

      const filePath = `${weddingIdToUse}/${filename}`;

      // Delete the photo from storage first
      const { error: storageError } = await supabase.storage
        .from('couple-photos')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        throw new Error('Failed to delete photo from storage');
      }

      // Update the wedding record to remove the photo URL
      const { error: dbError } = await supabase
        .from('weddings')
        .update({ 
          photos: formData.photos.filter(url => url !== photoUrl)
        })
        .eq('id', formData.weddingId);

      if (dbError) {
        console.error('Database update error:', dbError);
        throw new Error('Failed to update wedding record');
      }

      // Update local state
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter(url => url !== photoUrl)
      }));
    } catch (error) {
      console.error('Error deleting photo:', error);
      setUploadError('Failed to delete photo. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    try {
      const endpoint = '/api/wedding'; // Always use the same endpoint - method determines behavior
      const method = formData.weddingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner1name: formData.bride,
          partner2name: formData.groom,
          weddingdate: formData.date,
          city: formData.venue,
          theme: formData.theme,
          photos: formData.photos,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save wedding details');
      }

      const data = await response.json();
      console.log('Wedding API response:', data); // Debug log
      
      // Get the wedding ID from the response
      const weddingId = data.data?.id;
      if (!weddingId) {
        console.error('No wedding ID in response:', data);
        throw new Error('No wedding ID returned from API');
      }
      
      // Generate a new design based on the updated wedding data
      console.log('🎨 Generating new design after saving wedding details...');
      const designResponse = await fetch('/api/design-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingId
        }),
      });

      if (designResponse.ok) {
        console.log('✅ New design generated successfully');
      } else {
        console.warn('⚠️ Design generation failed, but wedding was saved');
      }
      
      // Small delay to ensure design generation completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to secure preview page (no ID needed - uses authenticated user)
      window.location.href = `/website/preview`;
    } catch (error) {
      console.error('Error saving wedding:', error);
      setUploadError('Failed to save wedding details. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p style={{ color: 'black' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white" style={{ backgroundColor: 'white' }}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold leading-tight" style={{ color: 'black' }}>
            {formData.weddingId ? 'Edit your wedding website' : 'Create your wedding website'}
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'black', paddingBottom: '50px' }}>
            Your wedding website is the perfect place to share details with your guests. Our AI will create a beautiful, personalized design based on your style.
          </p>
        </div>

        <div className="space-y-8" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
          <h2 className="text-2xl font-semibold" style={{ color: 'black' }}>Wedding Details</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '5px', paddingBottom: '5px' }}>
                Bride&apos;s First Name
              </label>
              <input
                type="text"
                value={formData.bride}
                onChange={(e) => handleInputChange("bride", e.target.value)}
                className="w-full px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '90%' }}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '5px', paddingBottom: '5px' }}>
                Groom&apos;s First Name
              </label>
              <input
                type="text"
                value={formData.groom}
                onChange={(e) => handleInputChange("groom", e.target.value)}
                className="w-full px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '90%' }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '15px', paddingBottom: '5px' }}>
              Wedding Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full max-w-md px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '95%' }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '15px', paddingBottom: '5px' }}>
              Venue / Location
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="e.g., Los Angeles, CA"
              className="w-full max-w-md px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '95%' }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '15px', paddingBottom: '5px' }}>
              Wedding Theme / Vibe ✨
            </label>
            <input
              type="text"
              value={formData.theme}
              onChange={(e) => handleInputChange("theme", e.target.value)}
              placeholder="e.g., romantic garden party, modern minimalist, rustic barn, elegant beachside..."
              className="w-full px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '60px', width: '95%' }}
              required
            />
            <p className="text-xs text-gray-600 mt-2">
              Describe your wedding style - our AI will use this to create a personalized design with matching colors, fonts, and layout!
            </p>
          </div>
        </div>

        <div 
          className={`space-y-6 rounded-lg p-6 transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          style={{ 
            border: isDragging ? '2px solid #3b82f6' : '2px dashed #d1d5db', 
            borderRadius: '8px', 
            paddingTop: '20px', 
            paddingBottom: '20px', 
            marginTop: '40px', 
            width: '90%', 
            marginLeft: '32px'
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold" style={{ color: 'black' }}>Upload Photos</h3>
            <div className={`text-4xl transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
              {isDragging ? '📤' : '📸'}
            </div>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'black' }}>
              {isDragging 
                ? 'Drop your photos here!' 
                : 'Add photos of you and your partner to personalize your website. The first photo will be used as your hero image!'
              }
            </p>
            <p className="text-xs max-w-xl mx-auto" style={{ color: '#666' }}>
              Drag and drop images here, or click the button below to browse
            </p>
            {uploadError && (
              <p className="text-red-500 text-sm">{uploadError}</p>
            )}
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="photo-upload"
                className={`inline-block px-8 py-3 text-sm bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors font-medium border border-gray-300 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ color: 'black', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px' }}
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </label>
            </div>
          </div>
          {formData.photos && formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto mt-6">
              {formData.photos
                .filter(photoUrl => photoUrl && photoUrl.trim() !== '') // Filter out empty/invalid URLs
                .map((photoUrl, index) => (
                <div key={`photo-${index}-${photoUrl}`} className="relative aspect-square group">
                  <Image
                    src={photoUrl}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={index < 2} // Only prioritize first 2 images
                    onError={(e) => {
                      console.error('Image failed to load:', photoUrl);
                      // Remove broken image from state
                      setFormData(prev => ({
                        ...prev,
                        photos: prev.photos.filter(url => url !== photoUrl)
                      }));
                    }}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Hero Image
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePhotoDelete(photoUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isUploading || !formData.bride || !formData.groom || !formData.date || !formData.venue || !formData.theme}
            className="px-8 py-4 bg-[#e89830] text-white rounded-lg hover:bg-[#d88a29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {isUploading ? 'Saving...' : (formData.weddingId ? '🎨 Update & Generate Website' : '🎨 Create AI Wedding Website')}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>✨ Our AI will analyze your theme and create a beautiful, personalized website design just for you!</p>
        </div>
      </form>
    </div>
  );
} 