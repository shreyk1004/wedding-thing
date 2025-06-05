import { Heart, Calendar, MapPin, User } from "lucide-react";

export function SettingsTab() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-[#fef9f3] to-[#fdf8f0] rounded-2xl p-6 border border-[#f0ebe4]">
        <h2 className="text-[#181511] text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Wedding Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Bride's Name
            </label>
            <input
              type="text"
              defaultValue="Sarah"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Groom's Name
            </label>
            <input
              type="text"
              defaultValue="Alex"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Wedding Date
            </label>
            <input
              type="date"
              defaultValue="2024-10-12"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue
            </label>
            <input
              type="text"
              placeholder="Enter venue name"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e1dc] p-6">
        <h3 className="text-[#181511] text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="sarah@example.com"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#181511]">Email Notifications</h4>
              <p className="text-sm text-[#887863]">Receive updates about your wedding planning</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e89830]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-[#e89830] text-[#181511] rounded-lg font-medium hover:bg-[#d88a29] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
} 