"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
import { supabase, handleSupabaseQuery } from '@/lib/supabase';
import { useChatContext } from '@/components/chat-provider';
import { TaskAIHelpModal } from '@/components/task-ai-help-modal';
import { Task, WeddingInfo } from '@/types';

const initialTasks: Task[] = [
  { id: '1', title: 'Book venue', status: 'todo', description: 'Find and reserve the perfect venue' },
  { id: '2', title: 'Choose photographer', status: 'todo', description: 'Research and book wedding photographer' },
  { id: '3', title: 'Send invitations', status: 'done', description: 'Design and send wedding invitations' },
  { id: '4', title: 'Plan menu', status: 'todo', description: 'Choose catering options and menu items' },
  { id: '5', title: 'Book DJ', status: 'done', description: 'Hire music entertainment for reception' },
  { id: '6', title: 'Order flowers', status: 'todo', description: 'Select and order bridal bouquet and centerpieces' },
  { id: '7', title: 'Book hotel rooms', status: 'todo', description: 'Reserve rooms for out-of-town guests' },
  { id: '8', title: 'Buy wedding dress', status: 'done', description: 'Find and purchase the perfect dress' },
];


const weddingInfo: WeddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDebug, setSessionDebug] = useState<any>(null);
  const { openChat } = useChatContext();

  // Debug session status
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      const storedSession = localStorage.getItem('sb-atwcovxfbxxdrecjsfyy-auth-token');
      
      setSessionDebug({
        hasSession: !!session,
        user: session?.user?.email || null,
        hasLocalStorage: !!storedSession,
        error: error?.message || null
      });
      
      console.log('🔍 Tasks page session check:', {
        hasSession: !!session,
        user: session?.user?.email || null,
        hasLocalStorage: !!storedSession,
        error: error?.message || null
      });
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    async function fetchWedding() {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching wedding data from API...');
        
        const response = await fetch('/api/wedding');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch wedding details');
        }
        
        console.log('API response:', result);
        
        if (result.data) {
          setWeddingDetails(result.data);
        } else {
          setError('No wedding details found for your account. Please complete the wedding setup first.');
        }
      } catch (err) {
        console.error('Error fetching wedding details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch wedding details. Please check your authentication.');
        setWeddingDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWedding();
  }, []);

  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionPercentage = (completedTasks / tasks.length) * 100;

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleAIHelp = (task: Task) => {
    console.log('AI Help clicked for task:', task.title);
    openChat(task);
  };

  // Map Supabase fields to WeddingHeader fields
  const weddingInfo = weddingDetails ? {
    bride: weddingDetails.partner1name || 'Partner 1',
    groom: weddingDetails.partner2name || 'Partner 2',
    date: weddingDetails.weddingdate || new Date().toISOString().split('T')[0],
    venue: weddingDetails.city || 'Venue',
    theme: weddingDetails.theme || 'Not specified'
  } : null;

  return (
    <div className="relative min-h-screen">
      {/* Session Debug */}
      {sessionDebug && (
        <div className="fixed top-4 right-4 bg-black text-white p-3 rounded-lg text-xs max-w-sm z-50">
          <div className="font-bold mb-1">🔍 Session Status</div>
          <div>Client Session: {sessionDebug.hasSession ? '✅ YES' : '❌ NO'}</div>
          <div>User: {sessionDebug.user || 'None'}</div>
          <div>LocalStorage: {sessionDebug.hasLocalStorage ? '✅ YES' : '❌ NO'}</div>
          {sessionDebug.error && <div className="text-red-300">Error: {sessionDebug.error}</div>}
        </div>
      )}
      
      <div className="space-y-6">
        {loading && <div className="text-gray-500">Loading wedding details...</div>}
        
        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{error}</p>
            {error.includes('No wedding details found') && (
              <p className="text-yellow-600 text-sm mt-1">
                Visit the <a href="/chat" className="underline">wedding setup chat</a> to add your details.
              </p>
            )}
          </div>
        )}
        {weddingInfo && (
          <>
            <WeddingHeader
              weddingInfo={weddingInfo}
              completionPercentage={completionPercentage}
            />
            <div className="px-4 py-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#181511] mb-4">Wedding Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Theme</p>
                  <p className="font-medium text-[#181511]">{weddingDetails.theme || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Guest Count</p>
                  <p className="font-medium text-[#181511]">{weddingDetails.estimatedguestcount || 'Not specified'} guests</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium text-[#181511]">
                    {weddingDetails.budget ? `$${weddingDetails.budget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Special Requirements</p>
                  <p className="font-medium text-[#181511]">
                    {weddingDetails.specialrequirements?.length 
                      ? weddingDetails.specialrequirements.join(', ')
                      : 'None specified'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Contact Email</p>
                  <p className="font-medium text-[#181511]">{weddingDetails.contactemail || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-[#181511]">{weddingDetails.phone || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </>
        )}
        <div>
          <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Tasks ({completedTasks}/{tasks.length} completed)
          </h2>
          <TaskList
            tasks={tasks}
            onTaskToggle={handleTaskToggle}
            onDelete={handleDeleteTask}
            onAIHelp={handleAIHelp}
          />
        </div>
      </div>
      

    </div>
  );
} 