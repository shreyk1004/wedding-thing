import React from 'react';
import { Block } from './Block';

interface DetailsSectionProps {
  weddingdate: string;
  city: string;
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

export function DetailsSection({
  weddingdate,
  city,
  partner1name,
  partner2name,
  palette,
  fonts,
  accentPreset
}: DetailsSectionProps) {
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

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '4:00 PM';
    }
  };

  // Create alternating background for visual interest
  const bgColor = palette.bg === '#ffffff' ? '#f8f9fa' : palette.bg;

  return (
    <Block 
      className="py-16 md:py-24"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Accent Decorations */}
        {accentPreset === 'florals' && (
          <div className="absolute top-8 right-8 text-4xl opacity-8 pointer-events-none" style={{ color: palette.accent }}>
            🌿
          </div>
        )}
        
        {accentPreset === 'geometric' && (
          <div className="absolute bottom-8 left-8 w-24 h-24 border-2 rotate-45 opacity-6 pointer-events-none" style={{ borderColor: palette.accent }} />
        )}

        {accentPreset === 'starfield' && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-16 right-16 w-1 h-1 rounded-full opacity-20"
              style={{ backgroundColor: palette.accent }}
            />
            <div 
              className="absolute bottom-20 left-20 w-1 h-1 rounded-full opacity-25"
              style={{ backgroundColor: palette.accent }}
            />
          </div>
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
            Wedding Details
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
            Join us as we celebrate our love
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Ceremony Details */}
          <div className="text-center md:text-left">
            <div className="mb-8">
              <h3 
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ 
                  fontFamily: fonts.heading,
                  color: palette.accent
                }}
              >
                Ceremony
              </h3>
              
              <div 
                className="w-16 h-1 mx-auto md:mx-0 mb-6"
                style={{ backgroundColor: palette.accent }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Date
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  {formatDate(weddingdate)}
                </p>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Time
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  {formatTime(weddingdate)}
                </p>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Location
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  {city}
                </p>
              </div>
            </div>
          </div>

          {/* Reception Details */}
          <div className="text-center md:text-left">
            <div className="mb-8">
              <h3 
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ 
                  fontFamily: fonts.heading,
                  color: palette.accent
                }}
              >
                Reception
              </h3>
              
              <div 
                className="w-16 h-1 mx-auto md:mx-0 mb-6"
                style={{ backgroundColor: palette.accent }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Time
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  Following the ceremony
                </p>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Location
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  {city}
                </p>
              </div>

              <div>
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary
                  }}
                >
                  Celebration
                </h4>
                <p 
                  className="text-lg"
                  style={{ 
                    fontFamily: fonts.body,
                    color: palette.primary,
                    opacity: 0.9
                  }}
                >
                  Dinner, dancing, and joy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div 
            className="max-w-3xl mx-auto p-8 rounded-lg"
            style={{ backgroundColor: palette.accent, opacity: 0.05 }}
          >
            <h4 
              className="text-xl font-semibold mb-4"
              style={{ 
                fontFamily: fonts.heading,
                color: palette.primary
              }}
            >
              Additional Information
            </h4>
            
            <p 
              className="text-lg leading-relaxed"
              style={{ 
                fontFamily: fonts.body,
                color: palette.primary,
                opacity: 0.8
              }}
            >
              We request that our wedding be an unplugged ceremony. Please keep phones and cameras 
              turned off during the ceremony so that everyone can be fully present for this special moment.
            </p>
          </div>
        </div>

        {/* Decorative closing element */}
        <div className="flex items-center justify-center mt-16">
          <div 
            className="w-8 h-8 rotate-45 border-2"
            style={{ borderColor: palette.accent }}
          />
        </div>
      </div>
    </Block>
  );
} 