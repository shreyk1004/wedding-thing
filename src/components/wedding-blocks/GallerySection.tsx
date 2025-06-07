import React from 'react';
import Image from 'next/image';
import { Block } from './Block';

interface GallerySectionProps {
  photos: string[];
  partner1name: string;
  partner2name: string;
  palette: {
    bg: string;
    primary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  accentPreset: string;
}

export function GallerySection({
  photos,
  partner1name,
  partner2name,
  palette,
  fonts,
  accentPreset
}: GallerySectionProps) {
  // Smart photo selection for gallery:
  // - Skip photos already used in hero (first photo) and story (photos 2-4)
  // - Show remaining photos in gallery
  // - If we have 5+ photos, start from photo 5
  // - If we have fewer photos, show a message about adding more
  const getGalleryPhotos = () => {
    if (photos.length <= 4) {
      // Not enough photos for a separate gallery after hero and story
      return [];
    }
    return photos.slice(4); // Start from photo 5 onwards
  };

  const galleryPhotos = getGalleryPhotos();

  // Guard-rail: Don't render if no unique photos for gallery
  if (galleryPhotos.length === 0) {
    return (
      <Block 
        className="py-16 md:py-24"
        style={{ backgroundColor: palette.bg }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ 
              fontFamily: fonts.heading,
              color: palette.primary
            }}
          >
            Photo Gallery
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto mb-8"
            style={{ backgroundColor: palette.accent }}
          />
          
          <div 
            className="max-w-lg mx-auto p-8 rounded-lg"
            style={{ backgroundColor: palette.accent, opacity: 0.05 }}
          >
            <div className="text-6xl mb-4">📸</div>
            <p 
              className="text-lg mb-4"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.8
              }}
            >
              Upload more photos to create a beautiful gallery section!
            </p>
            <p 
              className="text-sm"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.6
              }}
            >
              We need at least 5 photos total to show additional images in the gallery.
            </p>
          </div>
        </div>
      </Block>
    );
  }

  return (
    <Block 
      className="py-16 md:py-24"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Accent Decorations */}
        {accentPreset === 'florals' && (
          <div className="absolute top-8 left-8 text-3xl opacity-8 pointer-events-none" style={{ color: palette.accent }}>
            🌺
          </div>
        )}
        
        {accentPreset === 'geometric' && (
          <div className="absolute top-12 right-12 w-16 h-16 border-2 rotate-45 opacity-6 pointer-events-none" style={{ borderColor: palette.accent }} />
        )}

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ 
              fontFamily: fonts.heading,
              color: palette.primary
            }}
          >
            More Memories
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto mb-6"
            style={{ backgroundColor: palette.accent }}
          />
          
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ 
              fontFamily: fonts.body,
              color: palette.primary,
              opacity: 0.8
            }}
          >
            Celebrating our journey together
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {galleryPhotos.map((photo, index) => {
            // Create varied aspect ratios for visual interest
            const aspectVariations = [
              'aspect-square',
              'aspect-[4/5]',
              'aspect-[3/4]',
              'aspect-[5/4]'
            ];
            const aspectClass = aspectVariations[index % aspectVariations.length];
            
            return (
              <div 
                key={index} 
                className={`${aspectClass} overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative group cursor-pointer`}
              >
                <Image
                  src={photo}
                  alt={`${partner1name} & ${partner2name} - Gallery ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Hover overlay with number */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{ borderColor: palette.accent }}
                  >
                    <span 
                      className="text-sm font-bold"
                      style={{ color: palette.accent }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Photos Notice */}
        {galleryPhotos.length > 8 && (
          <div className="text-center mt-12">
            <p 
              className="text-lg"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.7
              }}
            >
              And {galleryPhotos.length - 8} more beautiful moments...
            </p>
          </div>
        )}

        {/* Decorative bottom element */}
        <div className="flex items-center justify-center mt-16">
          <div 
            className="w-20 h-px"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="w-3 h-3 mx-4 rotate-45"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="w-20 h-px"
            style={{ backgroundColor: palette.accent }}
          />
        </div>
      </div>
    </Block>
  );
} 