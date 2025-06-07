import React from 'react';
import Image from 'next/image';
import { Block } from './Block';

interface StorySectionProps {
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

export function StorySection({
  photos,
  partner1name,
  partner2name,
  palette,
  fonts,
  accentPreset
}: StorySectionProps) {
  // Smart photo selection for story section:
  // - Skip the first photo (used in hero)
  // - Use photos 2-4 for story (or fewer if not available)
  // - Leave remaining photos for gallery
  const getStoryPhotos = () => {
    if (photos.length <= 1) return []; // No story photos if only hero photo
    if (photos.length <= 4) return photos.slice(1, 3); // Use 1-2 photos for story
    return photos.slice(1, 4); // Use photos 2-4 for story section
  };

  const storyPhotos = getStoryPhotos();

  return (
    <Block 
      className="py-16 md:py-24"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Accent Decorations */}
        {accentPreset === 'florals' && (
          <div className="absolute top-10 right-10 text-4xl opacity-10 pointer-events-none" style={{ color: palette.accent }}>
            🌸
          </div>
        )}
        
        {accentPreset === 'geometric' && (
          <div className="absolute top-16 left-16 w-20 h-20 border-2 rotate-45 opacity-8 pointer-events-none" style={{ borderColor: palette.accent }} />
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
            Our Story
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto"
            style={{ backgroundColor: palette.accent }}
          />
        </div>

        {/* Story Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Text */}
          <div className="order-2 lg:order-1">
            <p 
              className="text-lg md:text-xl leading-relaxed mb-6"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.9
              }}
            >
              Every love story is beautiful, but ours is our favorite. From the moment we first met, 
              we knew there was something special between us.
            </p>
            
            <p 
              className="text-lg md:text-xl leading-relaxed mb-8"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.9
              }}
            >
              As we embark on this new chapter together, we're excited to celebrate with our 
              closest family and friends. Thank you for being part of our journey.
            </p>

            {/* Decorative element */}
            <div className="flex items-center justify-start">
              <div 
                className="w-12 h-px"
                style={{ backgroundColor: palette.accent }}
              />
              <div 
                className="w-2 h-2 mx-3 rotate-45 border-2"
                style={{ borderColor: palette.accent }}
              />
              <div 
                className="w-12 h-px"
                style={{ backgroundColor: palette.accent }}
              />
            </div>
          </div>

          {/* Story Photos */}
          <div className="order-1 lg:order-2">
            {storyPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {storyPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className={`${index === 0 ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative group`}
                  >
                    <Image
                      src={photo}
                      alt={`${partner1name} & ${partner2name} - Story ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Subtle overlay on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div 
                  className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: palette.accent, opacity: 0.1 }}
                >
                  <span className="text-4xl">📸</span>
                </div>
                <p 
                  className="text-lg max-w-md mx-auto"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.6
                  }}
                >
                  Share your beautiful moments together by uploading photos to showcase your love story.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Block>
  );
} 