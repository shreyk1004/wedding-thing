import React from 'react';
import Image from 'next/image';
import { Block } from './Block';

interface HeroOverlayProps {
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  heroPhoto?: string;
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

export function HeroOverlay({
  partner1name,
  partner2name,
  weddingdate,
  city,
  heroPhoto,
  palette,
  fonts,
  accentPreset
}: HeroOverlayProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      {heroPhoto ? (
        <>
          <Image
            src={heroPhoto}
            alt="Wedding Hero"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Enhanced dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40 z-10" />
          {/* Additional center overlay for text area */}
          <div className="absolute inset-0 bg-radial-gradient z-10" />
        </>
      ) : (
        <div 
          className="absolute inset-0 z-0"
          style={{ backgroundColor: palette.bg }}
        />
      )}

      {/* Accent Decorations */}
      {accentPreset === 'starfield' && (
        <div className="absolute inset-0 z-20">
          <div className="absolute top-10 right-10 w-1 h-1 bg-white rounded-full opacity-80" />
          <div className="absolute top-32 right-32 w-1 h-1 bg-white rounded-full opacity-60" />
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full opacity-70" />
          <div className="absolute bottom-40 left-40 w-1 h-1 bg-white rounded-full opacity-50" />
        </div>
      )}

      {accentPreset === 'florals' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-4xl opacity-30" style={{ color: '#ffffff' }}>
            🌸
          </div>
          <div className="absolute bottom-10 right-10 text-3xl opacity-25" style={{ color: '#ffffff' }}>
            🌺
          </div>
        </div>
      )}

      {accentPreset === 'geometric' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div 
            className="absolute top-20 right-20 w-20 h-20 border-2 rotate-45 opacity-30"
            style={{ borderColor: '#ffffff' }}
          />
          <div 
            className="absolute bottom-20 left-20 w-16 h-16 border-2 rotate-12 opacity-25"
            style={{ borderColor: '#ffffff' }}
          />
        </div>
      )}

      {/* Content with enhanced visibility */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="text-center max-w-3xl mx-auto px-6">
          {/* Main heading with enhanced shadows and backdrop */}
          <div className="relative mb-6">
            {/* Background blur for text */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -m-6 p-6" />
            
            <h1 
              className="relative text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ 
                fontFamily: fonts.heading,
                color: heroPhoto ? '#ffffff' : palette.primary,
                textShadow: heroPhoto ? '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                letterSpacing: '0.02em'
              }}
            >
              {partner1name}
            </h1>
            
            {/* Centered ampersand */}
            <div 
              className="text-2xl md:text-3xl lg:text-4xl font-light my-3"
              style={{ 
                fontFamily: fonts.heading,
                color: heroPhoto ? palette.accent : palette.accent,
                textShadow: heroPhoto ? '3px 3px 6px rgba(0,0,0,0.8)' : 'none'
              }}
            >
              &
            </div>
            
            <h1 
              className="relative text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ 
                fontFamily: fonts.heading,
                color: heroPhoto ? '#ffffff' : palette.primary,
                textShadow: heroPhoto ? '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                letterSpacing: '0.02em'
              }}
            >
              {partner2name}
            </h1>
          </div>
          
          <p 
            className="text-lg md:text-xl lg:text-2xl mb-4 font-medium"
            style={{ 
              fontFamily: fonts.body,
              color: heroPhoto ? '#ffffff' : palette.primary,
              textShadow: heroPhoto ? '3px 3px 6px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)' : 'none'
            }}
          >
            {formatDate(weddingdate)}
          </p>
          
          <p 
            className="text-base md:text-lg lg:text-xl font-light"
            style={{ 
              fontFamily: fonts.body,
              color: heroPhoto ? '#ffffff' : palette.primary,
              textShadow: heroPhoto ? '3px 3px 6px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)' : 'none',
              opacity: 0.95
            }}
          >
            {city}
          </p>

          {/* Decorative line */}
          <div 
            className="w-24 h-0.5 mx-auto mt-6 rounded-full"
            style={{ 
              backgroundColor: heroPhoto ? '#ffffff' : palette.accent,
              boxShadow: heroPhoto ? '0 0 10px rgba(255,255,255,0.6)' : 'none'
            }}
          />
        </div>
      </div>
    </section>
  );
} 