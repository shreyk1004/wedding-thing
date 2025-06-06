"use client";

import { WeddingHeader } from '@/components/wedding-header';
import { MessageSquare, Send } from "lucide-react";
import { WeddingInfo } from "@/types";

const weddingInfo: WeddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

// Mock completion percentage for header
const completionPercentage = 37.5;

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <WeddingHeader 
        weddingInfo={weddingInfo} 
        completionPercentage={completionPercentage} 
      />
      
      <div className="bg-white rounded-xl border border-[#e5e1dc] p-6 min-h-[500px] flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#e5e1dc]">
          <MessageSquare className="w-5 h-5 text-[#e89830]" />
          <h2 className="text-[#181511] text-xl font-bold">AI Wedding Assistant</h2>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col gap-4 mb-4">
          <div className="bg-[#f9f8f6] rounded-lg p-4 max-w-[80%]">
            <p className="text-[#181511] text-sm">
              👋 Hi Sarah & Alex! I&apos;m your AI wedding planning assistant. I can help you with:
            </p>
            <ul className="text-[#887863] text-sm mt-2 space-y-1">
              <li>• Finding and booking vendors</li>
              <li>• Creating timelines and schedules</li>
              <li>• Budget planning and tracking</li>
              <li>• Guest list management</li>
              <li>• Wedding etiquette questions</li>
            </ul>
            <p className="text-[#181511] text-sm mt-2">
              What would you like help with today?
            </p>
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask me anything about wedding planning..."
            className="flex-1 px-4 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
          />
          <button className="px-4 py-2 bg-[#e89830] text-[#181511] rounded-lg hover:bg-[#d88a29] transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        
        <p className="text-xs text-[#887863] mt-2 text-center">
          AI Assistant coming soon! This feature is currently in development.
        </p>
      </div>
    </div>
  );
} 