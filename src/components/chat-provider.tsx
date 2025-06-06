"use client";

import React, { createContext, useContext, useState } from 'react';
import { Task } from '@/types';
import { AIChatSidebar } from './ai-chat-sidebar';

interface ChatContextType {
  openChat: (task: Task) => void;
  isOpen: boolean;
  closeChat: () => void;
  currentTask: Task | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const openChat = (task: Task) => {
    setCurrentTask(task);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setCurrentTask(null);
  };

  return (
    <ChatContext.Provider value={{ openChat, isOpen, closeChat, currentTask }}>
      <div className={`transition-all duration-300 ${isOpen ? 'mr-96' : 'mr-0'}`}>
        {children}
      </div>
      <AIChatSidebar
        isOpen={isOpen}
        onClose={closeChat}
        initialTask={currentTask || undefined}
      />
    </ChatContext.Provider>
  );
} 