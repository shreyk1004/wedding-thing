"use client";

import { WeddingHeader } from '@/components/wedding-header';
import { WebsiteTab } from '@/components/website-tab';

const weddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

export default function WebsitePage() {
  return (
    <div className="space-y-6">
      <WeddingHeader weddingInfo={weddingInfo} completionPercentage={0} />
      <WebsiteTab />
    </div>
  );
} 