"use client";

import { useState } from "react";
import { CheckSquare, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      id: "website",
      label: "Website",
      icon: Globe,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-80 min-h-screen bg-white">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#181511] text-base font-medium leading-normal">
            Weddy
          </h1>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-[#f4f3f0] text-[#181511]"
                      : "text-[#887863] hover:bg-[#f9f8f6] hover:text-[#181511]"
                  )}
                >
                  <Icon size={24} />
                  <p className="text-sm font-medium leading-normal">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e89830] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d88a29] transition-colors">
          <span className="truncate">Preview Website</span>
        </button>
      </div>
    </div>
  );
} 