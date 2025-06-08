import { Heart, Calendar, MapPin, User } from "lucide-react";
import { useState, useRef } from "react";

interface SettingsTabProps {
  weddingDetails?: any;
}

export function SettingsTab({ weddingDetails }: SettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      partner1name: formData.get('partner1name') as string,
      partner2name: formData.get('partner2name') as string,
      weddingdate: formData.get('weddingdate') as string,
      city: formData.get('city') as string,
      theme: formData.get('theme') as string,
      estimatedguestcount: formData.get('estimatedguestcount') ? parseInt(formData.get('estimatedguestcount') as string) : undefined,
      budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : undefined,
      phone: formData.get('phone') as string,
      contactemail: formData.get('contactemail') as string,
    };

    try {
      const response = await fetch('/api/wedding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update wedding details');
      }

      setMessage({ type: 'success', text: 'Wedding details updated successfully!' });
      
      // Optionally refresh the page after a delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating wedding details:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update wedding details. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gradient-to-r from-[#fef9f3] to-[#fdf8f0] rounded-2xl p-6 border border-[#f0ebe4]">
        <h2 className="text-[#181511] text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Wedding Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Partner 1 Name
            </label>
            <input
              type="text"
              name="partner1name"
              defaultValue={weddingDetails?.partner1name || ""}
              placeholder="Enter partner 1 name"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Partner 2 Name
            </label>
            <input
              type="text"
              name="partner2name"
              defaultValue={weddingDetails?.partner2name || ""}
              placeholder="Enter partner 2 name"
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
              name="weddingdate"
              defaultValue={weddingDetails?.weddingdate || ""}
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue/City
            </label>
            <input
              type="text"
              name="city"
              defaultValue={weddingDetails?.city || ""}
              placeholder="Enter venue or city name"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Theme
            </label>
            <input
              type="text"
              name="theme"
              defaultValue={weddingDetails?.theme || ""}
              placeholder="Enter wedding theme"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Estimated Guest Count
            </label>
            <input
              type="number"
              name="estimatedguestcount"
              defaultValue={weddingDetails?.estimatedguestcount || ""}
              placeholder="Enter estimated guest count"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Budget
            </label>
            <input
              type="number"
              name="budget"
              defaultValue={weddingDetails?.budget || ""}
              placeholder="Enter wedding budget"
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={weddingDetails?.phone || ""}
              placeholder="Enter phone number"
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
              name="contactemail"
              defaultValue={weddingDetails?.contactemail || ""}
              placeholder="Enter email address"
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
        <button 
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            loading 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-[#e89830] text-[#181511] hover:bg-[#d88a29]'
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 