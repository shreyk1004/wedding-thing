"use client";

import Image from 'next/image';
import type { WeddingDesign } from '@/types/design';
import styles from './preview.module.css';

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

export function PreviewContent({ data }: { data: WeddingData }) {
  console.log('=== PHOTO DEBUG ===');
  console.log('Wedding data:', data);
  console.log('Photos array:', data.photos);
  console.log('Photos array length:', data.photos?.length);
  console.log('First photo URL:', data.photos?.[0]);
  console.log('Second photo URL:', data.photos?.[1]);
  console.log('All photos for gallery:', data.photos);
  console.log('Should show Our Story gallery:', data.photos && data.photos.length > 0);
  console.log('===================');

  return (
    <div className={styles.previewContainer} style={{
      '--primary-color': data.design.colors.primary,
      '--secondary-color': data.design.colors.secondary,
      '--accent-color': data.design.colors.accent,
      '--names-font': data.design.fonts.names,
      '--datetime-font': data.design.fonts.datetime,
      '--body-font': data.design.fonts.body,
    } as React.CSSProperties}>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {data.photos && data.photos.length > 0 && data.photos[0] ? (
            <>
              <div className="absolute inset-0 z-0">
                <Image
                  src={data.photos[0]}
                  alt="Hero"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  style={{ objectFit: 'cover' }}
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => console.error('Image failed to load:', e)}
                />
              </div>
              <div className={styles.heroOverlay} />
            </>
          ) : (
            <div className="absolute inset-0 z-0 bg-gray-300 flex items-center justify-center">
              <p className="text-gray-600">No photo uploaded</p>
            </div>
          )}
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {data.partner1name} & {data.partner2name}
            </h1>
            <p className={styles.heroDate}>
              {new Date(data.weddingdate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className={styles.heroLocation}>{data.city}</p>
            
            {/* Debug info */}
            <div className="mt-8 text-sm opacity-75">
              <p>Photos count: {data.photos?.length || 0}</p>
              <p>Gallery should show: {data.photos && data.photos.length > 0 ? 'YES' : 'NO'}</p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className={styles.storySection}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className={styles.storyTitle}>Our Story</h2>
            {data.photos && data.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.photos.map((photo, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg relative">
                    <Image
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Add photos to showcase your story</p>
                <p className="text-xs text-gray-400 mt-2">
                  Current photos: {data.photos?.length || 0}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Wedding Details Section */}
        <section className={styles.detailsSection}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={styles.detailsTitle}>Wedding Details</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className={styles.detailsSubtitle}>Ceremony</h3>
                <p className={styles.detailsText}>
                  {new Date(data.weddingdate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
                <p className={styles.detailsText}>{data.city}</p>
              </div>
              <div className="space-y-4">
                <h3 className={styles.detailsSubtitle}>Reception</h3>
                <p className={styles.detailsText}>Following the ceremony</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contactSection}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={styles.contactTitle}>Contact Us</h2>
            <div className="space-y-4">
              <p className={styles.contactText}>
                For any questions or concerns, please reach out to us:
              </p>
              <p className={styles.contactInfo}>{data.contactemail}</p>
              {data.phone && (
                <p className={styles.contactInfo}>{data.phone}</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 