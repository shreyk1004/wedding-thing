"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { WeddingHeader } from "@/components/wedding-header";
import { TaskList } from "@/components/task-list";
import { WebsiteTab } from "@/components/website-tab";
import { SettingsTab } from "@/components/settings-tab";
import { Task, WeddingInfo } from "@/types";

// Sample data
const initialTasks: Task[] = [
  { id: "1", title: "Book venue", status: "todo", description: "Find and reserve the perfect venue" },
  { id: "2", title: "Choose photographer", status: "todo", description: "Research and book wedding photographer" },
  { id: "3", title: "Send invitations", status: "done", description: "Design and send wedding invitations" },
  { id: "4", title: "Plan menu", status: "todo", description: "Choose catering options and menu items" },
  { id: "5", title: "Book DJ", status: "done", description: "Hire music entertainment for reception" },
  { id: "6", title: "Order flowers", status: "todo", description: "Select and order bridal bouquet and centerpieces" },
  { id: "7", title: "Book hotel rooms", status: "todo", description: "Reserve rooms for out-of-town guests" },
  { id: "8", title: "Buy wedding dress", status: "done", description: "Find and purchase the perfect dress" },
];

const weddingInfo: WeddingInfo = {
  bride: "Sarah",
  groom: "Alex",
  date: "2024-10-12",
  venue: "Garden Rose Manor",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' }
          : task
      )
    );
  };

  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionPercentage = (completedTasks / tasks.length) * 100;

  const renderContent = () => {
    switch (activeTab) {
      case "tasks":
        return (
          <div className="space-y-6">
            <WeddingHeader 
              weddingInfo={weddingInfo} 
              completionPercentage={completionPercentage} 
            />
            <div>
              <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Tasks ({completedTasks}/{tasks.length} completed)
              </h2>
              <TaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
            </div>
          </div>
        );
      case "website":
        return (
          <div className="space-y-6">
            <WeddingHeader 
              weddingInfo={weddingInfo} 
              completionPercentage={completionPercentage} 
            />
            <WebsiteTab />
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <WeddingHeader 
              weddingInfo={weddingInfo} 
              completionPercentage={completionPercentage} 
            />
            <SettingsTab />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#fefefe] to-[#f9f8f6] overflow-x-hidden">
      <div className="flex h-full grow">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[960px] p-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
