import { Globe, Eye, Edit, Share2 } from "lucide-react";

export function WebsiteTab() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-[#fef9f3] to-[#fdf8f0] rounded-2xl p-6 border border-[#f0ebe4]">
        <h2 className="text-[#181511] text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Your Wedding Website
        </h2>
        <p className="text-[#887863] mb-6">
          Create a beautiful website for your guests with RSVP, details, and more.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e5e1dc] hover:bg-[#fafafa] transition-colors">
            <Edit className="w-5 h-5 text-[#e89830]" />
            <div className="text-left">
              <div className="font-medium text-[#181511]">Edit Website</div>
              <div className="text-sm text-[#887863]">Customize your site</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e5e1dc] hover:bg-[#fafafa] transition-colors">
            <Eye className="w-5 h-5 text-[#e89830]" />
            <div className="text-left">
              <div className="font-medium text-[#181511]">Preview</div>
              <div className="text-sm text-[#887863]">See how it looks</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e5e1dc] hover:bg-[#fafafa] transition-colors">
            <Share2 className="w-5 h-5 text-[#e89830]" />
            <div className="text-left">
              <div className="font-medium text-[#181511]">Share</div>
              <div className="text-sm text-[#887863]">Send to guests</div>
            </div>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-[#e5e1dc] p-6">
        <h3 className="font-semibold text-[#181511] mb-4">Website Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#e89830] rounded-full"></div>
            <span className="text-[#887863]">RSVP Management</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#e89830] rounded-full"></div>
            <span className="text-[#887863]">Photo Gallery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#e89830] rounded-full"></div>
            <span className="text-[#887863]">Event Timeline</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#e89830] rounded-full"></div>
            <span className="text-[#887863]">Registry Links</span>
          </div>
        </div>
      </div>
    </div>
  );
} 