import React from 'react';

interface BlockProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export function Block({ children, className = '', style, id }: BlockProps) {
  return (
    <section
      id={id}
      className={`relative ${className}`}
      style={style}
    >
      {children}
    </section>
  );
} 