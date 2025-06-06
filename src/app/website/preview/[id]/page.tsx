import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { WeddingDesign } from '@/types/design';

interface WeddingData {
  id: string;
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  photos: string[];
  design: WeddingDesign;
  contactemail: string;
  phone?: string;
}

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: wedding } = await supabase
    .from('wedding')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!wedding) {
    notFound();
  }

  const data = wedding as WeddingData;
  const { design } = data;

  if (!design) {
    // Generate design if it doesn't exist
    const response = await fetch(`/api/design`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weddingId: params.id }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate design');
    }

    const newDesign = await response.json();
    data.design = newDesign;
  }

  return (
    <div style={{
      '--primary-color': data.design.colors.primary,
      '--secondary-color': data.design.colors.secondary,
      '--accent-color': data.design.colors.accent,
      '--names-font': data.design.fonts.names,
      '--datetime-font': data.design.fonts.datetime,
      '--body-font': data.design.fonts.body,
    } as React.CSSProperties}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=${data.design.fonts.names.replace(' ', '+')}&family=${data.design.fonts.datetime.replace(' ', '+')}&family=${data.design.fonts.body.replace(' ', '+')}');
      `}</style>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative">
          {data.photos[0] && (
            <div className="absolute inset-0 z-0">
              <img
                src={data.photos[0]}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>
          )}
          <div className="relative z-10 text-center text-white">
            <h1 className="text-6xl mb-4" style={{ fontFamily: 'var(--names-font)' }}>
              {data.partner1name} & {data.partner2name}
            </h1>
            <p className="text-2xl" style={{ fontFamily: 'var(--datetime-font)' }}>
              {new Date(data.weddingdate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-xl mt-2" style={{ fontFamily: 'var(--datetime-font)' }}>
              {data.city}
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20" style={{ backgroundColor: 'var(--secondary-color)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl mb-10 text-center" style={{ 
              fontFamily: 'var(--names-font)',
              color: 'var(--primary-color)'
            }}>
              Our Story
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.photos.slice(1).map((photo, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={photo}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wedding Details Section */}
        <section className="py-20 px-4" style={{ backgroundColor: 'var(--primary-color)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl mb-10" style={{ 
              fontFamily: 'var(--names-font)',
              color: 'var(--accent-color)'
            }}>
              Wedding Details
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-2xl" style={{ 
                  fontFamily: 'var(--datetime-font)',
                  color: 'var(--accent-color)'
                }}>
                  Ceremony
                </h3>
                <p style={{ 
                  fontFamily: 'var(--body-font)',
                  color: 'var(--secondary-color)'
                }}>
                  {new Date(data.weddingdate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
                <p style={{ 
                  fontFamily: 'var(--body-font)',
                  color: 'var(--secondary-color)'
                }}>
                  {data.city}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl" style={{ 
                  fontFamily: 'var(--datetime-font)',
                  color: 'var(--accent-color)'
                }}>
                  Reception
                </h3>
                <p style={{ 
                  fontFamily: 'var(--body-font)',
                  color: 'var(--secondary-color)'
                }}>
                  Following the ceremony
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4" style={{ backgroundColor: 'var(--accent-color)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl mb-10" style={{ 
              fontFamily: 'var(--names-font)',
              color: 'var(--primary-color)'
            }}>
              Contact Us
            </h2>
            <div className="space-y-4">
              <p style={{ 
                fontFamily: 'var(--body-font)',
                color: 'var(--secondary-color)'
              }}>
                For any questions or concerns, please reach out to us:
              </p>
              <p style={{ 
                fontFamily: 'var(--datetime-font)',
                color: 'var(--primary-color)'
              }}>
                {data.contactemail}
              </p>
              {data.phone && (
                <p style={{ 
                  fontFamily: 'var(--datetime-font)',
                  color: 'var(--primary-color)'
                }}>
                  {data.phone}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 