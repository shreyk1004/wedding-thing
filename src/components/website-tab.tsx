"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface WebsiteFormData {
  bride: string;
  groom: string;
  date: string;
  venue: string;
  photos: string[];
  colorPalette: number;
  style: string;
  weddingId?: string;
}

const colorPalettes = [
  "#ffffff", // White
  "#f5f5f5", // Light gray
  "#e0e0e0", // Medium light gray
  "#d0d0d0", // Medium gray
  "#b0b0b0", // Darker gray
  "#a0a0a0", // Even darker gray
  "#808080", // Dark gray
  "#606060"  // Very dark gray
];

const styleOptions = [
  { id: "elegant", name: "Elegant", preview: "/elegant-preview.jpg" },
  { id: "modern", name: "Modern", preview: "/modern-preview.jpg" },
  { id: "rustic", name: "Rustic", preview: "/rustic-preview.jpg" }
];

export function WebsiteTab() {
  const [formData, setFormData] = useState<WebsiteFormData>({
    bride: "",
    groom: "",
    date: "",
    venue: "",
    photos: [],
    colorPalette: 0,
    style: "elegant",
    weddingId: undefined
  });
  const [showPreview, setShowPreview] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof WebsiteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !formData.weddingId) {
      setUploadError('Please ensure you have created a wedding entry first.');
      return;
    }

    const files = Array.from(e.target.files);
    const urls: string[] = [];
    setUploadError(null);
    setIsUploading(true);

    try {
      for (const file of files) {
        // Create a unique filename to avoid collisions
        const timestamp = new Date().getTime();
        const filePath = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '_')}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('couple-photos')
          .upload(filePath, file, { 
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('couple-photos')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      // Save photos to the database
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: [...formData.photos, ...urls],
          weddingId: formData.weddingId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save photos to database');
      }

      // Update local state with new photo URLs
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...urls]
      }));

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload one or more photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/photos?url=${encodeURIComponent(photoUrl)}&weddingId=${formData.weddingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Update local state to remove the deleted photo
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter(url => url !== photoUrl)
      }));
    } catch (error) {
      console.error('Error deleting photo:', error);
      setUploadError('Failed to delete photo. Please try again.');
    }
  };

  const handleGenerate = () => {
    setShowPreview(true);
  };

  return (
    <div className="w-full bg-white" style={{ backgroundColor: 'white' }}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold leading-tight" style={{ color: 'black' }}>
            Create your wedding website
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'black',  paddingBottom: '50px' }}>
            Your wedding website is the perfect place to share details with your guests. It's easy to create and customize.
          </p>
        </div>

        {/* Wedding Details Section */}
        <div className="space-y-8" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
          <h2 className="text-2xl font-semibold" style={{ color: 'black' }}>Wedding Details</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '5px', paddingBottom: '5px' }}>
                Bride's First Name
              </label>
              <input
                type="text"
                value={formData.bride}
                onChange={(e) => handleInputChange("bride", e.target.value)}
                className="w-full px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '90%' }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '5px', paddingBottom: '5px' }}>
                Groom's First Name
              </label>
              <input
                type="text"
                value={formData.groom}
                onChange={(e) => handleInputChange("groom", e.target.value)}
                className="w-full px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '90%' }}
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
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px' , height: '50px', width: '95%'}}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'black', paddingTop: '15px', paddingBottom: '5px' }}>
              Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              className="w-full max-w-md px-4 py-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '8px', height: '50px', width: '95%' }}
            />
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-6 rounded-lg p-6" style={{ border: '2px dashed #d1d5db', borderRadius: '8px', paddingTop: '5px', paddingBottom: '20px', marginTop: '40px', width: '90%', marginLeft: '32px'}}>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold" style={{ color: 'black' }}>Upload Photos</h3>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'black' }}>
              Add photos of you and your partner to personalize your website.
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
                style={{ color: 'black', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '5px', paddingRight: '5px', borderRadius: '8px' }}
              >
                {isUploading ? 'Uploading...' : 'Upload Photos'}
              </label>
            </div>
          </div>
          {/* Photo Preview */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
              {formData.photos.slice(0, 6).map((photoUrl, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={photoUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <button
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

        {/* Generate Website Button */}
        <div className="flex justify-center pt-10 pb-8">
          <a
            href={`/website/preview?id=${formData.weddingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-3 text-base bg-amber-200 rounded-full font-medium hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center"
            style={{ color: 'black', marginTop: '40px', textDecoration: 'none' }}
          >
            Generate Website
          </a>
        </div>

        {/* Interactive Preview Placeholder */}
        {showPreview && (
          <div className="mt-10 p-8 border border-gray-300 rounded-lg bg-gray-50 text-center" style={{ minHeight: '200px' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Interactive Website Preview</h3>
            <p style={{ color: 'black' }}>This is where your customizable wedding website preview will appear.</p>
          </div>
        )}
      </div>
    </div>
  );
} 