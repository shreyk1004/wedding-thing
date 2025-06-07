import React from 'react';
import { Block } from './Block';

interface DividerProps {
  palette: {
    bg: string;
    primary: string;
    accent: string;
  };
  accentPreset: string;
}

export function Divider({ palette, accentPreset }: DividerProps) {
  return (
    <Block 
      className="py-8 md:py-12"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center">
          {accentPreset === 'geometric' ? (
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-px"
                style={{ backgroundColor: palette.accent }}
              />
              <div 
                className="w-3 h-3 rotate-45 border-2"
                style={{ borderColor: palette.accent }}
              />
              <div 
                className="w-16 h-px"
                style={{ backgroundColor: palette.accent }}
              />
            </div>
          ) : accentPreset === 'florals' ? (
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-px"
                style={{ backgroundColor: palette.accent }}
              />
              <div className="text-2xl" style={{ color: palette.accent }}>
                🌸
              </div>
              <div 
                className="w-12 h-px"
                style={{ backgroundColor: palette.accent }}
              />
            </div>
          ) : accentPreset === 'starfield' ? (
            <div className="flex items-center space-x-2">
              <div 
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />
              <div 
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />
            </div>
          ) : (
            <div 
              className="w-32 h-px"
              style={{ backgroundColor: palette.accent }}
            />
          )}
        </div>
      </div>
    </Block>
  );
} 