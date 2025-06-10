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
  regenerateKey?: number;
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
  mode?: 'preview' | 'fullsite';
}

export function WebsiteBuilder({ weddingData, isGenerating = false, onRegenerateDesign, mode = 'preview' }: WebsiteBuilderProps) {
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
  
  // Save Design System
  const [previewDesign, setPreviewDesign] = useState<DesignRecipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saveMessageOpacity, setSaveMessageOpacity] = useState(1);
  
  // Check if there's an unsaved preview design
  const hasUnsavedPreview = previewDesign !== null;

  // Auto-fade save message
  useEffect(() => {
    if (saveMessage) {
      setSaveMessageOpacity(1); // Ensure it starts visible
      const timer = setTimeout(() => {
        // Use requestAnimationFrame to ensure the opacity change happens in the next frame
        requestAnimationFrame(() => {
          setSaveMessageOpacity(0); // Start fade out
          // Remove the message after fade completes
          setTimeout(() => {
            setSaveMessage(null);
            setSaveMessageOpacity(1); // Reset for next message
          }, 500); // Wait for transition duration
        });
      }, 3000); // Start fade after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

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

  // Trigger regeneration when regenerateKey changes
  useEffect(() => {
    if (weddingData.regenerateKey && !isGenerating && !isLoading) {
      console.log('🔄 Regenerating design due to regenerateKey change');
      generateDesignRecipe();
    }
  }, [weddingData.regenerateKey]);

  // When page loads with saved design, create a preview copy so save button appears
  useEffect(() => {
    if (designRecipe && !previewDesign && mode === 'preview') {
      console.log('📋 Creating preview copy of saved design');
      setPreviewDesign({ ...designRecipe });
    }
  }, [designRecipe, previewDesign, mode]);

  // Add navigation warning for unsaved preview designs
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedPreview && mode === 'preview') {
        e.preventDefault();
        e.returnValue = 'You have an unsaved design preview. It will be discarded if you leave. Save your design first?';
        return 'You have an unsaved design preview. It will be discarded if you leave. Save your design first?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedPreview, mode]);

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
    setSaveMessage(null); // Clear any previous save messages
    
    try {
      const response = await fetch('/api/design-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingData.id,
          saveToDatabase: false // Never save automatically - always store as preview
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design recipe');
      }

      const data = await response.json();
      if (data.designRecipe && typeof data.designRecipe === 'object' && data.designRecipe.palette) {
        // Store as preview design (not saved)
        setPreviewDesign(data.designRecipe);
        console.log('🎨 Design generated as preview (not saved)');
      } else {
        console.error('Invalid API response:', data);
        throw new Error('Invalid design recipe returned from API');
      }
    } catch (err) {
      console.error('Error generating design recipe:', err);
      setError('Failed to generate design. Using fallback.');
      // Use fallback design as preview
      setPreviewDesign(createFallbackDesign());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!previewDesign) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Save the preview design to the database
      const response = await fetch('/api/wedding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: weddingData.id,
          design: previewDesign
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save design');
      }

      // Update the saved design and clear preview
      setDesignRecipe(previewDesign);
      setPreviewDesign(null);
      setSaveMessage({ type: 'success', text: 'Design saved successfully!' });
      
      console.log('✅ Design saved to database');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save design:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save design. Please try again.' });
    } finally {
      setIsSaving(false);
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
  if (error && !designRecipe && !previewDesign) {
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
  if (!designRecipe && !previewDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading your wedding website...</p>
        </div>
      </div>
    );
  }

  // Use preview design if available, otherwise use saved design
  const currentDesign = previewDesign || designRecipe;
  if (!currentDesign) {
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
    if (!currentDesign?.palette || !currentDesign?.fonts || !currentDesign?.accent) {
      return null;
    }

    const commonProps = {
      partner1name: weddingData.partner1name,
      partner2name: weddingData.partner2name,
      palette: currentDesign.palette,
      fonts: currentDesign.fonts,
      accentPreset: currentDesign.accent.preset
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
        switch (currentDesign.hero.style) {
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
    <div 
      className={mode === 'preview' ? "min-h-screen flex justify-center p-4" : "min-h-screen"} 
      style={{ backgroundColor: mode === 'preview' ? '#f5f5f5' : (currentDesign?.palette?.bg || '#ffffff') }}
    >
      {/* Website container - full width for fullsite mode, constrained for preview */}
      <div 
        className={mode === 'preview' ? "w-full max-w-[1200px] relative bg-white shadow-lg overflow-hidden" : "w-full relative overflow-hidden"}
        style={{ 
          backgroundColor: currentDesign?.palette?.bg || '#ffffff',
          minHeight: mode === 'preview' ? '90vh' : '100vh',
          borderRadius: mode === 'preview' ? '8px' : '0'
        }}
      >
        {/* Universal Navigation Toolbar - positioned relative to container */}
        <Navigation 
          palette={currentDesign.palette}
          fonts={currentDesign.fonts}
          layout={currentDesign.layout}
          partner1name={weddingData.partner1name}
          partner2name={weddingData.partner2name}
        />

        {/* Render sections based on layout */}
        {currentDesign.layout?.map((sectionType, index) => {
          const section = renderSection(sectionType, index);
          
          // Add dividers between sections (except for the last one)
          if (section && index < currentDesign.layout.length - 1) {
            return (
              <React.Fragment key={`section-${index}`}>
                {section}
                <Divider 
                  palette={currentDesign.palette}
                  accentPreset={currentDesign.accent.preset}
                />
              </React.Fragment>
            );
          }
          
          return section;
        })}

        {/* Wedly Branding Footer */}
        <div className="text-center py-6 border-t border-gray-100">
          <p 
            className="text-sm opacity-60 hover:opacity-80 transition-opacity"
            style={{ 
              color: currentDesign.palette.primary,
              fontFamily: currentDesign.fonts.body 
            }}
          >
            built with{' '}
            <a 
              href="https://gowedly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Wedly
            </a>{' '}
            ❤️
          </p>
        </div>
      </div>

      {/* Floating Design Action Buttons - Only show in preview mode */}
      {mode === 'preview' && (
        <div 
          className="fixed z-50"
          style={{ 
            top: '24px', 
            right: '24px',
            position: 'fixed'
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Regenerate Button */}
            {onRegenerateDesign && (
              <button
                onClick={onRegenerateDesign}
                className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110 flex items-center justify-center text-lg"
                title="Refresh design"
              >
                🔄
              </button>
            )}

            {/* Save Button - only show when there's a preview */}
            {hasUnsavedPreview && (
              <button
                onClick={handleSaveDesign}
                disabled={isSaving}
                className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 flex items-center justify-center text-lg"
                title="Save design"
              >
                {isSaving ? '⏳' : '💾'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Message - Completely separate container */}
      {mode === 'preview' && saveMessage && (
        <div 
          className="fixed z-50"
          style={{ 
            top: '140px', 
            right: '24px',
            position: 'fixed'
          }}
        >
          <div 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity duration-500 shadow-lg max-w-xs ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
            style={{ opacity: saveMessageOpacity }}
          >
            <div className="flex items-start justify-between">
              <span className="flex-1">{saveMessage.text}</span>
              <button
                onClick={() => setSaveMessage(null)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close message"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 