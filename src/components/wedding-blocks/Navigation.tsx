import React from 'react';

interface NavigationProps {
  palette: {
    bg: string;
    primary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: string[];
  partner1name: string;
  partner2name: string;
}

export function Navigation({ palette, fonts, layout, partner1name, partner2name }: NavigationProps) {
  // Force rebuild - professional three-column wedding navigation layout
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Map layout sections to display names and IDs
  const sectionMap: { [key: string]: { label: string; id: string } } = {
    hero: { label: 'Home', id: 'hero-section' },
    story: { label: 'Our Story', id: 'story-section' },
    gallery: { label: 'Gallery', id: 'gallery-section' },
    details: { label: 'Details', id: 'details-section' },
    rsvp: { label: 'RSVP', id: 'rsvp-section' }
  };

  // Filter out RSVP from main nav (it goes on the right)
  const leftNavSections = layout.filter(section => sectionMap[section] && section !== 'rsvp');
  const hasRSVP = layout.includes('rsvp');

  // Get couple's initials
  const getInitials = () => {
    const initial1 = partner1name ? partner1name.charAt(0).toUpperCase() : 'A';
    const initial2 = partner2name ? partner2name.charAt(0).toUpperCase() : 'B';
    return `${initial1} & ${initial2}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="w-full py-4">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-3 items-center w-full">
            
            {/* Left Navigation */}
            <div className="flex items-center space-x-6 justify-start pl-4">
              {leftNavSections.map((section) => {
                const sectionInfo = sectionMap[section];
                return (
                  <button
                    key={section}
                    onClick={() => scrollToSection(sectionInfo.id)}
                    className="relative group transition-all duration-300 hover:scale-105 bg-transparent border-0 outline-0 p-0"
                    style={{
                      fontFamily: fonts.body,
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 500,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                      letterSpacing: '0.5px',
                      background: 'none',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    {sectionInfo.label}
                    
                    {/* Hover underline effect */}
                    <span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Center - Couple Initials (perfectly centered within preview) */}
            <div className="flex justify-center">
              <button
                onClick={() => scrollToSection('hero-section')}
                className="transition-all duration-300 hover:scale-105 bg-transparent border-0 outline-0 p-0"
                style={{
                  fontFamily: fonts.heading,
                  color: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 400,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                  letterSpacing: '2px',
                  background: 'none',
                  border: 'none',
                  outline: 'none'
                }}
              >
                {getInitials()}
              </button>
            </div>

            {/* Right - RSVP Button */}
            <div className="flex items-center justify-end pr-4">
              {hasRSVP && (
                <button
                  onClick={() => scrollToSection('rsvp-section')}
                  className="px-4 py-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
                  style={{
                    fontFamily: fonts.body,
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                    border: '1.5px solid #ffffff',
                    borderRadius: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)';
                  }}
                >
                  RSVP!
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 