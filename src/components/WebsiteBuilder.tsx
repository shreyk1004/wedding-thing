"use client";

import React, { useEffect, useState } from 'react';
import { HeroOverlay } from './wedding-blocks/HeroOverlay';
import { HeroSplit } from './wedding-blocks/HeroSplit';
import { HeroSolid } from './wedding-blocks/HeroSolid';
import { StorySection } from './wedding-blocks/StorySection';
import { GallerySection } from './wedding-blocks/GallerySection';
import { DetailsSection } from './wedding-blocks/DetailsSection';
import { RSVPSection } from './wedding-blocks/RSVPSection';
import { Divider } from './wedding-blocks/Divider';
import { Navigation } from './wedding-blocks/Navigation';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  theme: string;
  design?: DesignRecipe;
}

interface DesignRecipe {
  palette: {
    bg: string;
    primary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  hero: {
    style: "photo-overlay" | "split" | "solid";
  };
  accent: {
    preset: "starfield" | "none" | "florals" | "geometric";
  };
  layout: ("hero" | "story" | "gallery" | "details" | "rsvp")[];
}

interface WebsiteBuilderProps {
  weddingData: WeddingData;
  isGenerating?: boolean;
  onRegenerateDesign?: () => void;
}

export function WebsiteBuilder({ weddingData, isGenerating = false, onRegenerateDesign }: WebsiteBuilderProps) {
  // Initialize with wedding design if it exists and is valid
  const getInitialDesign = (): DesignRecipe | null => {
    if (weddingData.design && 
        weddingData.design.palette && 
        weddingData.design.fonts && 
        weddingData.design.hero && 
        weddingData.design.accent && 
        weddingData.design.layout) {
      return weddingData.design;
    }
    return null;
  };

  const [designRecipe, setDesignRecipe] = useState<DesignRecipe | null>(getInitialDesign());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFallbackDesign = (): DesignRecipe => {
    return {
      palette: { bg: "#ffffff", primary: "#2d3748", accent: "#e89830" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      hero: { style: weddingData.photos?.length > 0 ? "photo-overlay" : "solid" },
      accent: { preset: "none" },
      layout: ["hero", "story", "gallery", "details", "rsvp"]
    };
  };

  // Validate and fix design recipe if needed
  useEffect(() => {
    if (designRecipe && (!designRecipe.palette || !designRecipe.fonts || !designRecipe.hero || !designRecipe.accent || !designRecipe.layout)) {
      console.error('Invalid design recipe detected, using fallback:', designRecipe);
      setDesignRecipe(createFallbackDesign());
    }
  }, [designRecipe]);

  // Generate design recipe if none exists
  useEffect(() => {
    if (!designRecipe && !isGenerating && !isLoading) {
      generateDesignRecipe();
    }
  }, [weddingData.id, designRecipe, isGenerating, isLoading]);

  // Load Google Fonts dynamically
  useEffect(() => {
    if (designRecipe?.fonts?.heading && designRecipe?.fonts?.body) {
      const loadFonts = () => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(designRecipe.fonts.heading)}:wght@400;700&family=${encodeURIComponent(designRecipe.fonts.body)}:wght@400;600&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      };

      loadFonts();
    }
  }, [designRecipe]);

  const generateDesignRecipe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/design-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingData.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design recipe');
      }

      const data = await response.json();
      if (data.designRecipe && typeof data.designRecipe === 'object' && data.designRecipe.palette) {
        setDesignRecipe(data.designRecipe);
      } else {
        console.error('Invalid API response:', data);
        throw new Error('Invalid design recipe returned from API');
      }
    } catch (err) {
      console.error('Error generating design recipe:', err);
      setError('Failed to generate design. Using fallback.');
      // Use fallback design
      setDesignRecipe(createFallbackDesign());
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Creating your beautiful wedding website...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !designRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={generateDesignRecipe}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no design recipe yet
  if (!designRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading your wedding website...</p>
        </div>
      </div>
    );
  }

  const renderSection = (sectionType: string, index: number) => {
    // Double-check designRecipe is valid before using it
    if (!designRecipe?.palette || !designRecipe?.fonts || !designRecipe?.accent) {
      return null;
    }

    const commonProps = {
      partner1name: weddingData.partner1name,
      partner2name: weddingData.partner2name,
      palette: designRecipe.palette,
      fonts: designRecipe.fonts,
      accentPreset: designRecipe.accent.preset
    };

    // Get section ID for navigation
    const sectionId = `${sectionType}-section`;

    switch (sectionType) {
      case 'hero':
        const heroPhoto = weddingData.photos?.[0];
        
        // Always use HeroOverlay when we have a photo for text overlay effect
        // Only use other styles when no photo is available
        if (heroPhoto) {
          return (
            <div key={`hero-${index}`} id={sectionId}>
              <HeroOverlay
                {...commonProps}
                weddingdate={weddingData.weddingdate}
                city={weddingData.city}
                heroPhoto={heroPhoto}
              />
            </div>
          );
        }
        
        // Fallback to design recipe choice only when no photo
        switch (designRecipe.hero.style) {
          case 'photo-overlay':
            return (
              <div key={`hero-${index}`} id={sectionId}>
                <HeroOverlay
                  {...commonProps}
                  weddingdate={weddingData.weddingdate}
                  city={weddingData.city}
                  heroPhoto={heroPhoto}
                />
              </div>
            );
          case 'split':
            return (
              <div key={`hero-${index}`} id={sectionId}>
                <HeroSplit
                  {...commonProps}
                  weddingdate={weddingData.weddingdate}
                  city={weddingData.city}
                  heroPhoto={heroPhoto}
                />
              </div>
            );
          case 'solid':
            return (
              <div key={`hero-${index}`} id={sectionId}>
                <HeroSolid
                  {...commonProps}
                  weddingdate={weddingData.weddingdate}
                  city={weddingData.city}
                />
              </div>
            );
          default:
            return (
              <div key={`hero-${index}`} id={sectionId}>
                <HeroSolid
                  {...commonProps}
                  weddingdate={weddingData.weddingdate}
                  city={weddingData.city}
                />
              </div>
            );
        }
      
      case 'story':
        return (
          <div key={`story-${index}`} id={sectionId}>
            <StorySection
              {...commonProps}
              photos={weddingData.photos || []}
            />
          </div>
        );
      
      case 'gallery':
        // GallerySection has its own guard-rail for no photos
        return (
          <div key={`gallery-${index}`} id={sectionId}>
            <GallerySection
              {...commonProps}
              photos={weddingData.photos || []}
            />
          </div>
        );
      
      case 'details':
        return (
          <div key={`details-${index}`} id={sectionId}>
            <DetailsSection
              {...commonProps}
              weddingdate={weddingData.weddingdate}
              city={weddingData.city}
            />
          </div>
        );
      
      case 'rsvp':
        return (
          <div key={`rsvp-${index}`} id={sectionId}>
            <RSVPSection
              {...commonProps}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Self-contained preview container - acts like its own webpage */}
      <div 
        className="w-full max-w-[1200px] relative bg-white shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: designRecipe?.palette?.bg || '#ffffff',
          minHeight: '90vh',
          borderRadius: '8px'
        }}
      >
        {/* Universal Navigation Toolbar - positioned relative to preview container */}
        <Navigation 
          palette={designRecipe.palette}
          fonts={designRecipe.fonts}
          layout={designRecipe.layout}
          partner1name={weddingData.partner1name}
          partner2name={weddingData.partner2name}
        />

        {/* Render sections based on layout */}
        {designRecipe.layout?.map((sectionType, index) => {
          const section = renderSection(sectionType, index);
          
          // Add dividers between sections (except for the last one)
          if (section && index < designRecipe.layout.length - 1) {
            return (
              <React.Fragment key={`section-${index}`}>
                {section}
                <Divider 
                  palette={designRecipe.palette}
                  accentPreset={designRecipe.accent.preset}
                />
              </React.Fragment>
            );
          }
          
          return section;
        })}
      </div>

      {/* Floating Regenerate Design Button - Fixed position */}
      {onRegenerateDesign && (
        <div 
          className="fixed z-50"
          style={{ 
            top: '24px', 
            right: '24px',
            position: 'fixed'
          }}
        >
          <button
            onClick={onRegenerateDesign}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm font-medium"
            style={{ minWidth: '140px' }}
          >
            <span className="text-lg">🎨</span>
            <span>Regenerate<br/>Design</span>
          </button>
        </div>
      )}

      {/* Debug Info - Fixed to bottom right of viewport */}
      {process.env.NODE_ENV === 'development' && designRecipe && (
        <div 
          className="fixed z-50"
          style={{ 
            bottom: '16px', 
            right: '16px',
            position: 'fixed',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '320px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ade80' }}>
            Design Recipe:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><span style={{ color: '#93c5fd' }}>Hero:</span> {designRecipe.hero?.style}</div>
            <div><span style={{ color: '#93c5fd' }}>Accent:</span> {designRecipe.accent?.preset}</div>
            <div><span style={{ color: '#93c5fd' }}>Layout:</span> {designRecipe.layout?.join(' → ')}</div>
            <div><span style={{ color: '#93c5fd' }}>Colors:</span> {designRecipe.palette?.primary}</div>
          </div>
          
          {weddingData.photos && weddingData.photos.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #4b5563' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#4ade80' }}>
                Photo Distribution:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• Hero: Photo 1</div>
                {weddingData.photos.length > 1 && (
                  <div>• Story: Photos {weddingData.photos.length > 4 ? '2-4' : `2-${Math.min(4, weddingData.photos.length)}`}</div>
                )}
                {weddingData.photos.length > 4 && (
                  <div>• Gallery: Photos 5-{weddingData.photos.length}</div>
                )}
                <div style={{ color: '#d1d5db', marginTop: '4px' }}>
                  Total: {weddingData.photos.length} photos
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 