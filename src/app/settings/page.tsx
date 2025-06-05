"use client";

import { WeddingHeader } from '@/components/wedding-header';
import { SettingsTab } from '@/components/settings-tab';

const weddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <WeddingHeader weddingInfo={weddingInfo} completionPercentage={0} />
      <SettingsTab />
    </div>
  );
} 