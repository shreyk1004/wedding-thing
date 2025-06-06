export interface WeddingDesign {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    names: string;     // Font for partner names
    datetime: string;  // Font for date, time, and venue
    body: string;      // Font for general text
  };
}

export const AVAILABLE_FONTS = {
  names: [
    'Playfair Display',
    'Cormorant Garamond',
    'Libre Baskerville',
    'Cinzel',
    'Italiana',
    'Gilda Display',
    'Marcellus',
    'Spectral',
    'Crimson Text',
    'Bodoni Moda'
  ],
  datetime: [
    'Montserrat',
    'Lato',
    'Open Sans',
    'Raleway',
    'Nunito Sans',
    'Source Sans Pro',
    'Work Sans',
    'Quicksand',
    'DM Sans',
    'Inter'
  ],
  body: [
    'Karla',
    'Mulish',
    'Roboto',
    'Poppins',
    'Manrope',
    'Outfit',
    'Plus Jakarta Sans',
    'Albert Sans',
    'Sora',
    'Urbanist'
  ]
} as const; 