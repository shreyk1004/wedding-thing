import React from 'react';
import Image from 'next/image';
import { Block } from './Block';

interface HeroSplitProps {
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

export function HeroSplit({
  partner1name,
  partner2name,
  weddingdate,
  city,
  heroPhoto,
  palette,
  fonts,
  accentPreset
}: HeroSplitProps) {
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
    <Block 
      className="min-h-screen flex items-center"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Content Side */}
        <div className="flex items-center justify-center px-8 py-16 lg:py-0 relative">
          {/* Accent Decorations */}
          {accentPreset === 'geometric' && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute top-10 left-10 w-16 h-16 border-2 rotate-45 opacity-10"
                style={{ borderColor: palette.accent }}
              />
              <div 
                className="absolute bottom-20 right-10 w-12 h-12 border-2 rotate-12 opacity-15"
                style={{ borderColor: palette.accent }}
              />
            </div>
          )}

          {accentPreset === 'florals' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-16 right-16 text-3xl opacity-10" style={{ color: palette.accent }}>
                🌸
              </div>
              <div className="absolute bottom-16 left-16 text-2xl opacity-15" style={{ color: palette.accent }}>
                🌺
              </div>
            </div>
          )}

          <div className="text-center lg:text-left max-w-lg">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ 
                fontFamily: fonts.heading,
                color: palette.primary
              }}
            >
              {partner1name}
              <span className="block" style={{ color: palette.accent }}>
                &
              </span>
              {partner2name}
            </h1>
            
            <p 
              className="text-lg md:text-xl lg:text-2xl mb-4"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary
              }}
            >
              {formatDate(weddingdate)}
            </p>
            
            <p 
              className="text-base md:text-lg lg:text-xl"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.8
              }}
            >
              {city}
            </p>

            {/* Decorative line */}
            <div 
              className="w-20 h-1 mt-8 mx-auto lg:mx-0"
              style={{ backgroundColor: palette.accent }}
            />
          </div>
        </div>

        {/* Photo Side */}
        <div className="relative min-h-96 lg:min-h-screen">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt="Wedding Photo"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: palette.accent, opacity: 0.1 }}
            >
              <p 
                className="text-center text-lg"
                style={{ color: palette.primary, opacity: 0.5 }}
              >
                Add your beautiful photo here
              </p>
            </div>
          )}
          
          {/* Gradient overlay on photo edge for better text contrast */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/20 to-transparent lg:block hidden" />
        </div>
      </div>
    </Block>
  );
} 