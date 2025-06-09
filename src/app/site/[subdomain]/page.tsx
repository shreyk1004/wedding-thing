import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { WebsiteBuilder } from '@/components/WebsiteBuilder';

type SitePageProps = {
  params: Promise<{
    subdomain: string;
  }>;
};

// Revalidate every 5 minutes to show updated content
export const revalidate = 300;

export default async function SitePage({ params }: SitePageProps) {
  const { subdomain } = await params;

  // Fetch wedding data for this subdomain
  const { data: weddingData, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('subdomain', subdomain)
    .single();

  if (error || !weddingData) {
    console.error('Site not found for subdomain:', subdomain, error);
    notFound();
  }

  // Render the website using the WebsiteBuilder component
  return (
    <div className="min-h-screen">
      <WebsiteBuilder 
        weddingData={weddingData} 
        isGenerating={false}
        mode="fullsite"
      />
    </div>
  );
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: SitePageProps) {
  const { subdomain } = await params;
  
  const { data: weddingData } = await supabase
    .from('weddings')
    .select('partner1name, partner2name, weddingdate')
    .eq('subdomain', subdomain)
    .single();

  if (!weddingData) {
    return {
      title: 'Wedding Website',
    };
  }

  const weddingDate = weddingData.weddingdate 
    ? new Date(weddingData.weddingdate).toLocaleDateString() 
    : '';

  return {
    title: `${weddingData.partner1name} & ${weddingData.partner2name}${weddingDate ? ` - ${weddingDate}` : ''}`,
    description: `Join us for the wedding of ${weddingData.partner1name} and ${weddingData.partner2name}`,
  };
} 