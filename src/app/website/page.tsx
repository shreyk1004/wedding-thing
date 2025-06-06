"use client";

import { Suspense } from 'react';
import { WebsiteTab } from "@/components/website-tab";

export default function WebsitePage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p style={{ color: 'black' }}>Loading...</p>
          </div>
        </div>
      }>
        <WebsiteTab />
      </Suspense>
    </div>
  );
} 