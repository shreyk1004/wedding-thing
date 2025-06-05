"use client";

import { useState } from "react";
import { Globe, Upload, Shuffle, Palette, Image, Calendar, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebsiteFormData {
  bride: string;
  groom: string;
  date: string;
  venue: string;
  photos: File[];
  colorPalette: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  style: string;
}

const colorPalettes = [
  {
    id: "romantic",
    name: "Romantic Rose",
    colors: { primary: "#e89830", secondary: "#f4d6a7", accent: "#8b4513" },
    preview: ["#e89830", "#f4d6a7", "#8b4513"]
  },
  {
    id: "elegant",
    name: "Elegant Navy",
    colors: { primary: "#2c3e50", secondary: "#ecf0f1", accent: "#f39c12" },
    preview: ["#2c3e50", "#ecf0f1", "#f39c12"]
  },
  {
    id: "vintage",
    name: "Vintage Sage",
    colors: { primary: "#8fbc8f", secondary: "#f5f5dc", accent: "#daa520" },
    preview: ["#8fbc8f", "#f5f5dc", "#daa520"]
  },
  {
    id: "modern",
    name: "Modern Blush",
    colors: { primary: "#ffc0cb", secondary: "#696969", accent: "#ff69b4" },
    preview: ["#ffc0cb", "#696969", "#ff69b4"]
  },
  {
    id: "classic",
    name: "Classic Gold",
    colors: { primary: "#ffd700", secondary: "#fffaf0", accent: "#8b4513" },
    preview: ["#ffd700", "#fffaf0", "#8b4513"]
  },
  {
    id: "boho",
    name: "Boho Earth",
    colors: { primary: "#cd853f", secondary: "#f4a460", accent: "#2e8b57" },
    preview: ["#cd853f", "#f4a460", "#2e8b57"]
  }
];

const styleOptions = [
  { id: "classy", name: "Classy", description: "Elegant serif fonts, traditional layouts" },
  { id: "fun", name: "Fun", description: "Playful fonts, colorful and vibrant" },
  { id: "modern", name: "Modern", description: "Clean lines, minimalist design" },
  { id: "romantic", name: "Romantic", description: "Script fonts, soft curves" },
  { id: "rustic", name: "Rustic", description: "Natural textures, handwritten style" },
  { id: "vintage", name: "Vintage", description: "Retro elements, classic typography" }
];

export function WebsiteTab() {
  const [formData, setFormData] = useState<WebsiteFormData>({
    bride: "Sarah", // Will inherit from Supabase
    groom: "Alex", // Will inherit from Supabase
    date: "2024-10-12", // Will inherit from Supabase
    venue: "Garden Rose Manor", // Will inherit from Supabase
    photos: [],
    colorPalette: "",
    customColors: { primary: "#e89830", secondary: "#f4d6a7", accent: "#8b4513" },
    style: ""
  });

  const handleInputChange = (field: keyof WebsiteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorPaletteSelect = (palette: typeof colorPalettes[0]) => {
    setFormData(prev => ({
      ...prev,
      colorPalette: palette.id,
      customColors: palette.colors
    }));
  };

  const handleCustomColorChange = (colorType: keyof typeof formData.customColors, color: string) => {
    setFormData(prev => ({
      ...prev,
      colorPalette: "custom",
      customColors: { ...prev.customColors, [colorType]: color }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const randomizeStyle = () => {
    const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
    
    setFormData(prev => ({
      ...prev,
      colorPalette: randomPalette.id,
      customColors: randomPalette.colors,
      style: randomStyle.id
    }));
  };

  const handleGenerate = () => {
    console.log("Generating website with:", formData);
    // TODO: Implement website generation
    alert("Website generation coming soon! Your preferences have been saved.");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#fef9f3] to-[#fdf8f0] rounded-2xl p-6 border border-[#f0ebe4]">
        <h2 className="text-[#181511] text-xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Website Builder
        </h2>
        <p className="text-[#887863]">
          Create a beautiful, personalized wedding website for your guests.
        </p>
      </div>

      {/* Section 1: Wedding Details */}
      <div className="bg-white rounded-xl border border-[#e5e1dc] p-6">
        <h3 className="text-[#181511] text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Wedding Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Bride's Name
            </label>
            <input
              type="text"
              value={formData.bride}
              onChange={(e) => handleInputChange("bride", e.target.value)}
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181511] mb-2">
              Groom's Name
            </label>
            <input
              type="text"
              value={formData.groom}
              onChange={(e) => handleInputChange("groom", e.target.value)}
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
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
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
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[#181511] mb-2 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Wedding Photos
          </label>
          <div className="border-2 border-dashed border-[#e5e1dc] rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-[#887863] mx-auto mb-2" />
            <p className="text-[#887863] mb-2">Drag and drop photos or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-block px-4 py-2 bg-[#e89830] text-[#181511] rounded-lg cursor-pointer hover:bg-[#d88a29] transition-colors"
            >
              Choose Photos
            </label>
          </div>
          
          {/* Photo Preview */}
          {formData.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Style & Design */}
      <div className="bg-white rounded-xl border border-[#e5e1dc] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#181511] text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Style & Design
          </h3>
          <button
            onClick={randomizeStyle}
            className="flex items-center gap-2 px-3 py-1 bg-[#f4f3f0] text-[#181511] rounded-lg hover:bg-[#ebe9e5] transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </button>
        </div>

        {/* Color Palettes */}
        <div className="mb-6">
          <h4 className="font-medium text-[#181511] mb-3">Color Palette</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorPalettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => handleColorPaletteSelect(palette)}
                className={cn(
                  "p-3 border rounded-lg transition-all hover:shadow-md",
                  formData.colorPalette === palette.id
                    ? "border-[#e89830] ring-2 ring-[#e89830] ring-opacity-20"
                    : "border-[#e5e1dc]"
                )}
              >
                <div className="flex gap-1 mb-2">
                  {palette.preview.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-[#181511]">{palette.name}</p>
              </button>
            ))}
          </div>

          {/* Custom Colors */}
          <div className="mt-4 p-4 bg-[#f9f8f6] rounded-lg">
            <h5 className="font-medium text-[#181511] mb-3">Custom Colors</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#887863] mb-1">Primary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.customColors.primary}
                    onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                    className="w-8 h-8 rounded border border-[#e5e1dc]"
                  />
                  <input
                    type="text"
                    value={formData.customColors.primary}
                    onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-[#e5e1dc] rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#887863] mb-1">Secondary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.customColors.secondary}
                    onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                    className="w-8 h-8 rounded border border-[#e5e1dc]"
                  />
                  <input
                    type="text"
                    value={formData.customColors.secondary}
                    onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-[#e5e1dc] rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#887863] mb-1">Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.customColors.accent}
                    onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                    className="w-8 h-8 rounded border border-[#e5e1dc]"
                  />
                  <input
                    type="text"
                    value={formData.customColors.accent}
                    onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-[#e5e1dc] rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Style Options */}
        <div>
          <h4 className="font-medium text-[#181511] mb-3">Overall Style</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                onClick={() => handleInputChange("style", style.id)}
                className={cn(
                  "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                  formData.style === style.id
                    ? "border-[#e89830] ring-2 ring-[#e89830] ring-opacity-20 bg-[#fef9f3]"
                    : "border-[#e5e1dc] hover:border-[#d0c7ba]"
                )}
              >
                <h5 className="font-medium text-[#181511] mb-1">{style.name}</h5>
                <p className="text-xs text-[#887863]">{style.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={!formData.style || !formData.colorPalette}
          className={cn(
            "px-8 py-3 rounded-xl font-bold tracking-[0.015em] transition-all",
            formData.style && formData.colorPalette
              ? "bg-[#e89830] text-[#181511] hover:bg-[#d88a29] hover:shadow-lg"
              : "bg-[#f4f3f0] text-[#887863] cursor-not-allowed"
          )}
        >
          Generate Wedding Website
        </button>
      </div>
    </div>
  );
} 