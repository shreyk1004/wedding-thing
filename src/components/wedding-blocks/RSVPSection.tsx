import React from 'react';
import { Block } from './Block';

interface RSVPSectionProps {
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

export function RSVPSection({
  partner1name,
  partner2name,
  palette,
  fonts,
  accentPreset
}: RSVPSectionProps) {
  return (
    <Block 
      className="py-16 md:py-24"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center relative">
        {/* Accent Decorations */}
        {accentPreset === 'florals' && (
          <div className="absolute top-8 left-8 text-5xl opacity-8 pointer-events-none" style={{ color: palette.accent }}>
            💌
          </div>
        )}
        
        {accentPreset === 'geometric' && (
          <div className="absolute top-8 right-8 w-20 h-20 border-2 rotate-45 opacity-8 pointer-events-none" style={{ borderColor: palette.accent }} />
        )}

        {accentPreset === 'starfield' && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-12 left-12 w-1 h-1 rounded-full opacity-30"
              style={{ backgroundColor: palette.accent }}
            />
            <div 
              className="absolute top-20 right-20 w-1 h-1 rounded-full opacity-25"
              style={{ backgroundColor: palette.accent }}
            />
            <div 
              className="absolute bottom-12 left-1/3 w-1 h-1 rounded-full opacity-20"
              style={{ backgroundColor: palette.accent }}
            />
          </div>
        )}

        {/* Section Header */}
        <div className="mb-12">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: fonts.heading,
              color: palette.primary
            }}
          >
            RSVP
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto mb-8"
            style={{ backgroundColor: palette.accent }}
          />
          
          <p 
            className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: fonts.body,
              color: palette.primary,
              opacity: 0.9
            }}
          >
            We can't wait to celebrate with you! Please let us know if you'll be joining us for our special day.
          </p>
        </div>

        {/* RSVP Card */}
        <div 
          className="max-w-2xl mx-auto p-8 md:p-12 rounded-lg shadow-lg"
          style={{ 
            backgroundColor: palette.accent,
            opacity: 0.05
          }}
        >
          <h3 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ 
              fontFamily: fonts.heading,
              color: palette.primary
            }}
          >
            Répondez S'il Vous Plaît
          </h3>

          {/* RSVP Details */}
          <div className="space-y-6 mb-8">
            <div>
              <h4 
                className="text-lg font-semibold mb-2"
                style={{ 
                  fontFamily: fonts.body,
                  color: palette.primary
                }}
              >
                Wedding of {partner1name} & {partner2name}
              </h4>
              <p 
                className="text-base"
                style={{ 
                  fontFamily: fonts.body,
                  color: palette.primary,
                  opacity: 0.8
                }}
              >
                Please respond by two weeks before the wedding date
              </p>
            </div>

            <div>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: fonts.body,
                  color: palette.primary,
                  opacity: 0.9
                }}
              >
                Kindly RSVP by clicking the button below or contacting us directly.
              </p>
            </div>
          </div>

          {/* RSVP Button */}
          <button 
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border-2"
            style={{ 
              backgroundColor: palette.accent,
              color: 'white',
              borderColor: palette.accent,
              fontFamily: fonts.body
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = palette.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = palette.accent;
              e.currentTarget.style.color = 'white';
            }}
          >
            RSVP Here
          </button>

          {/* Additional Contact Info */}
          <div className="mt-8 text-center">
            <p 
              className="text-sm"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.7
              }}
            >
              Questions? Feel free to reach out to us directly.
            </p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-12">
          <p 
            className="text-lg md:text-xl max-w-xl mx-auto"
            style={{ 
              fontFamily: fonts.body,
              color: palette.primary,
              opacity: 0.8,
              fontStyle: 'italic'
            }}
          >
            Thank you for being such an important part of our lives. We're so excited to share this moment with you!
          </p>
        </div>

        {/* Decorative closing */}
        <div className="flex items-center justify-center mt-12">
          <div 
            className="w-16 h-px"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="w-4 h-4 mx-4 rotate-45"
            style={{ backgroundColor: palette.accent }}
          />
          <div 
            className="w-16 h-px"
            style={{ backgroundColor: palette.accent }}
          />
        </div>
      </div>
    </Block>
  );
} 