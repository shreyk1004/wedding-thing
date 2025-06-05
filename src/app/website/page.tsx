"use client";

import { WeddingHeader } from '@/components/wedding-header';
import { WebsiteTab } from '@/components/website-tab';
import { WeddingInfo } from "@/types";

const weddingInfo: WeddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

// Mock completion percentage for header
const completionPercentage = 37.5;

export default function WebsitePage() {
  return (
    <div className="space-y-6">
      <WeddingHeader 
        weddingInfo={weddingInfo} 
        completionPercentage={completionPercentage} 
      />
      <WebsiteTab />
    </div>
  );
} 