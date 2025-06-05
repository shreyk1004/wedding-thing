"use client";

import { WeddingHeader } from '@/components/wedding-header';
import { WeddingChat } from '@/components/WeddingChat';

const weddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <WeddingHeader weddingInfo={weddingInfo} completionPercentage={0} />
      <WeddingChat />
    </div>
  );
} 