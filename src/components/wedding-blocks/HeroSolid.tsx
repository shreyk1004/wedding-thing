import React from 'react';
import { Block } from './Block';

interface HeroSolidProps {
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
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

export function HeroSolid({
  partner1name,
  partner2name,
  weddingdate,
  city,
  palette,
  fonts,
  accentPreset
}: HeroSolidProps) {
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
      className="h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: palette.bg }}
    >
      {/* Accent Decorations */}
      {accentPreset === 'starfield' && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-20 right-20 w-2 h-2 rounded-full opacity-30"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="absolute top-40 right-40 w-1 h-1 rounded-full opacity-40"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="absolute bottom-32 left-32 w-2 h-2 rounded-full opacity-25"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="absolute bottom-20 left-20 w-1 h-1 rounded-full opacity-35"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="absolute top-60 left-60 w-1 h-1 rounded-full opacity-20"
            style={{ backgroundColor: palette.accent }}
          />
        </div>
      )}

      {accentPreset === 'florals' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 text-6xl opacity-5" style={{ color: palette.accent }}>
            🌸
          </div>
          <div className="absolute top-20 right-20 text-4xl opacity-8" style={{ color: palette.accent }}>
            🌺
          </div>
          <div className="absolute bottom-20 left-1/4 text-5xl opacity-6" style={{ color: palette.accent }}>
            🌿
          </div>
          <div className="absolute bottom-16 right-16 text-3xl opacity-7" style={{ color: palette.accent }}>
            🌸
          </div>
        </div>
      )}

      {accentPreset === 'geometric' && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-20 right-20 w-32 h-32 border-2 rotate-45 opacity-8"
            style={{ borderColor: palette.accent }}
          />
          <div 
            className="absolute bottom-20 left-20 w-24 h-24 border-2 rotate-12 opacity-10"
            style={{ borderColor: palette.accent }}
          />
          <div 
            className="absolute top-1/2 left-10 w-16 h-16 border-2 rotate-45 opacity-6"
            style={{ borderColor: palette.accent }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto px-8 relative z-10">
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          style={{ 
            fontFamily: fonts.heading,
            color: palette.primary
          }}
        >
          {partner1name}
        </h1>
        
        <div 
          className="text-3xl md:text-4xl lg:text-5xl font-light mb-8"
          style={{ 
            fontFamily: fonts.heading,
            color: palette.accent
          }}
        >
          &
        </div>
        
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 leading-tight"
          style={{ 
            fontFamily: fonts.heading,
            color: palette.primary
          }}
        >
          {partner2name}
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center justify-center mb-8">
          <div 
            className="w-16 h-px"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="w-3 h-3 mx-4 rotate-45 border-2"
            style={{ borderColor: palette.accent }}
          />
          <div 
            className="w-16 h-px"
            style={{ backgroundColor: palette.accent }}
          />
        </div>
        
        <p 
          className="text-xl md:text-2xl lg:text-3xl mb-6"
          style={{ 
            fontFamily: fonts.body,
            color: palette.primary
          }}
        >
          {formatDate(weddingdate)}
        </p>
        
        <p 
          className="text-lg md:text-xl lg:text-2xl"
          style={{ 
            fontFamily: fonts.body,
            color: palette.primary,
            opacity: 0.8
          }}
        >
          {city}
        </p>
      </div>
    </Block>
  );
} 