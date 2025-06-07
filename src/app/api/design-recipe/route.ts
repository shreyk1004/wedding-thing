import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { z } from 'zod';

// Create Supabase client with anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DesignRecipeRequestSchema = z.object({
  weddingId: z.string().uuid(),
});

// Design Recipe Schema - matches your specification
const DesignRecipeSchema = z.object({
  palette: z.object({
    bg: z.string(),
    primary: z.string(),
    accent: z.string()
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string()
  }),
  hero: z.object({
    style: z.enum(["photo-overlay", "split", "solid"])
  }),
  accent: z.object({
    preset: z.enum(["starfield", "none", "florals", "geometric"])
  }),
  layout: z.array(z.enum(["hero", "story", "gallery", "details", "rsvp"]))
});

type DesignRecipe = z.infer<typeof DesignRecipeSchema>;

export async function POST(request: NextRequest) {
  try {
    console.log('=== Design Recipe API Called ===');
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('- Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');
    
    const body = await request.json();
    const { weddingId } = DesignRecipeRequestSchema.parse(body);
    console.log('Wedding ID:', weddingId);

    // Fetch wedding data from Supabase
    const { data: wedding, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', weddingId)
      .single();

    if (error || !wedding) {
      console.error('Wedding fetch error:', error);
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    console.log('Wedding data:', {
      partners: `${wedding.partner1name} & ${wedding.partner2name}`,
      theme: wedding.theme,
      photos: wedding.photos?.length || 0
    });

    // Create AI prompt based on wedding data
    const prompt = `You are a professional wedding website designer. Create a comprehensive design recipe for a wedding website.

Wedding Details:
- Partners: ${wedding.partner1name} & ${wedding.partner2name}
- Date: ${wedding.weddingdate}
- Location: ${wedding.city}
- Theme/Vibe: "${wedding.theme}"
- Photos Available: ${wedding.photos?.length || 0}
- Guest Count: ${wedding.estimatedguestcount || 'Not specified'}

Based on the theme "${wedding.theme}", create a design recipe that includes:

1. COLOR PALETTE: Choose colors that match the theme. Use hex codes.
   - bg: Background color (usually light/neutral)
   - primary: Main text color (usually dark for readability) 
   - accent: Highlight color that matches the theme

2. FONTS: Choose fonts that match the theme and mood
   - heading: For couple names and section titles (elegant/decorative fonts)
   - body: For body text and details (readable fonts)

3. HERO STYLE: Choose based on available photos and theme
   - "photo-overlay": If photos available and want dramatic look (PREFERRED when photos exist)
   - "split": If want modern/clean layout (secondary choice)
   - "solid": If minimal photos or elegant/simple theme (only when no photos)

4. ACCENT PRESET: Choose decorative elements that match theme
   - "starfield": For elegant/night/cosmic themes
   - "florals": For garden/romantic/spring themes  
   - "geometric": For modern/minimalist themes
   - "none": For ultra-clean designs

5. LAYOUT: Order sections based on what's most important for this wedding
   Standard order: ["hero", "story", "gallery", "details", "rsvp"]
   But adjust based on theme and content available.

Return ONLY valid JSON in this exact format:
{
  "palette": {
    "bg": "#ffffff",
    "primary": "#333333", 
    "accent": "#e89830"
  },
  "fonts": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "hero": {
    "style": "photo-overlay"
  },
  "accent": {
    "preset": "florals"
  },
  "layout": ["hero", "story", "gallery", "details", "rsvp"]
}`;

    console.log('About to call OpenAI API...');
    console.log('Prompt length:', prompt.length);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional wedding website designer. Return only valid JSON with no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('OpenAI API call successful');
    console.log('Response usage:', completion.usage);

    const response = completion.choices[0].message.content;
    if (!response) {
      console.error('OpenAI returned empty response');
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', response);

    // Parse and validate the AI response
    let designRecipe: DesignRecipe;
    try {
      const parsed = JSON.parse(response);
      console.log('Parsed JSON:', parsed);
      designRecipe = DesignRecipeSchema.parse(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response was:', response);
      // Fallback to safe default based on theme
      designRecipe = createFallbackDesign(wedding.theme || 'modern', wedding.photos?.length || 0);
    }

    // Apply guard-rails and validate design
    const validatedRecipe = applyGuardRails(designRecipe, wedding);

    // Save the design recipe to the wedding record
    const { error: updateError } = await supabase
      .from('weddings')
      .update({ design: validatedRecipe })
      .eq('id', weddingId);

    if (updateError) {
      console.error('Failed to save design recipe:', updateError);
      return NextResponse.json({ error: 'Failed to save design recipe' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      designRecipe: validatedRecipe 
    });

  } catch (error) {
    console.error('Error generating design recipe:', error);
    return NextResponse.json({ error: 'Failed to generate design recipe' }, { status: 500 });
  }
}

function createFallbackDesign(theme: string, photoCount: number): DesignRecipe {
  // Safe fallback designs based on theme keywords
  const themeKey = theme.toLowerCase();
  
  if (themeKey.includes('modern') || themeKey.includes('minimalist')) {
    return {
      palette: { bg: "#ffffff", primary: "#2d3748", accent: "#4299e1" },
      fonts: { heading: "Inter", body: "Inter" },
      hero: { style: photoCount > 0 ? "photo-overlay" : "solid" },
      accent: { preset: "geometric" },
      layout: ["hero", "story", "details", "gallery", "rsvp"]
    };
  } else if (themeKey.includes('romantic') || themeKey.includes('garden') || themeKey.includes('floral')) {
    return {
      palette: { bg: "#faf5f5", primary: "#2d3748", accent: "#e53e3e" },
      fonts: { heading: "Playfair Display", body: "Source Sans Pro" },
      hero: { style: photoCount > 0 ? "photo-overlay" : "solid" },
      accent: { preset: "florals" },
      layout: ["hero", "story", "gallery", "details", "rsvp"]
    };
  } else if (themeKey.includes('elegant') || themeKey.includes('classic')) {
    return {
      palette: { bg: "#f7fafc", primary: "#1a202c", accent: "#d69e2e" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      hero: { style: photoCount > 0 ? "photo-overlay" : "solid" },
      accent: { preset: "starfield" },
      layout: ["hero", "story", "gallery", "details", "rsvp"]
    };
  }
  
  // Default safe fallback - always prefer photo-overlay when photos exist
  return {
    palette: { bg: "#ffffff", primary: "#2d3748", accent: "#e89830" },
    fonts: { heading: "Playfair Display", body: "Inter" },
    hero: { style: photoCount > 0 ? "photo-overlay" : "solid" },
    accent: { preset: "none" },
    layout: ["hero", "story", "gallery", "details", "rsvp"]
  };
}

function applyGuardRails(recipe: DesignRecipe, wedding: any): DesignRecipe {
  // Guard-rail 1: Check color contrast
  const contrastratio = calculateContrastRatio(recipe.palette.primary, recipe.palette.bg);
  if (contrastratio < 4.5) {
    // Darken primary color by 15%
    recipe.palette.primary = darkenColor(recipe.palette.primary, 0.15);
  }

  // Guard-rail 2: If no photos, don't use photo-overlay hero
  if ((!wedding.photos || wedding.photos.length === 0) && recipe.hero.style === "photo-overlay") {
    recipe.hero.style = "solid";
  }

  // Guard-rail 3: If no photos, hide gallery section or move it to end
  if (!wedding.photos || wedding.photos.length === 0) {
    recipe.layout = recipe.layout.filter(section => section !== "gallery");
  }

  // Guard-rail 4: Ensure required sections are present
  if (!recipe.layout.includes("hero")) {
    recipe.layout.unshift("hero");
  }
  if (!recipe.layout.includes("details")) {
    recipe.layout.push("details");
  }

  return recipe;
}

// Helper functions for guard-rails
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const darkenedRgb = {
    r: Math.round(rgb.r * (1 - amount)),
    g: Math.round(rgb.g * (1 - amount)),
    b: Math.round(rgb.b * (1 - amount))
  };
  
  return `#${darkenedRgb.r.toString(16).padStart(2, '0')}${darkenedRgb.g.toString(16).padStart(2, '0')}${darkenedRgb.b.toString(16).padStart(2, '0')}`;
} 