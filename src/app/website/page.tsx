"use client";

import { Suspense } from 'react';
import { WebsiteTab } from "@/components/website-tab";

export default function WebsitePage() {
  return (
    <div className="min-h-screen w-full bg-white rounded-lg shadow-sm">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <WebsiteTab />
      </Suspense>
    </div>
  );
} 