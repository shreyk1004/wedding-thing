"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
import { supabase } from '@/lib/supabase';
import { useChatContext } from '@/components/chat-provider';
import { Task } from '@/types';

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


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDebug, setSessionDebug] = useState<any>(null);
  const { openChat } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          // Handle authentication error specifically
          if (response.status === 401) {
            throw new Error('Please log in to view your wedding details.');
          }
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

  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      partner1name: formData.get('partner1name') as string,
      partner2name: formData.get('partner2name') as string,
      weddingdate: formData.get('weddingdate') as string,
      city: formData.get('city') as string,
      theme: formData.get('theme') as string,
      estimatedguestcount: formData.get('estimatedguestcount') ? parseInt(formData.get('estimatedguestcount') as string, 10) : undefined,
      budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : undefined,
      phone: formData.get('phone') as string,
      specialrequirements: (formData.get('specialrequirements') as string).split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      console.log('Updating wedding data via API...', data);
      const response = await fetch('/api/wedding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('API update response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update wedding details');
      }
      
      if (result.data) {
        setWeddingDetails(result.data);
      }
      setUpdateMessage({ type: 'success', text: 'Wedding details updated successfully!' });
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating wedding details:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update wedding details. Please try again.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#181511]">Wedding Details</h3>
                {!isEditing && weddingDetails && (
                  <button
                    onClick={() => { setIsEditing(true); setUpdateMessage(null); }}
                    className="px-4 py-1.5 text-sm font-medium bg-[#f9f6f2] text-[#181511] rounded-lg hover:bg-[#f0ebe4] border border-[#f0ebe4] transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {updateMessage && !isEditing && (
                <div className={`p-3 mb-4 rounded-lg border text-sm ${
                  updateMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {updateMessage.text}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateDetails}>
                  {updateMessage && (
                    <div className={`p-3 mb-4 rounded-lg border text-sm ${
                      updateMessage.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {updateMessage.text}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Partner 1 Name</label>
                        <input type="text" name="partner1name" defaultValue={weddingDetails?.partner1name || ""} placeholder="Enter partner 1 name" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Partner 2 Name</label>
                        <input type="text" name="partner2name" defaultValue={weddingDetails?.partner2name || ""} placeholder="Enter partner 2 name" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Wedding Date</label>
                        <input type="date" name="weddingdate" defaultValue={weddingDetails?.weddingdate ? new Date(weddingDetails.weddingdate).toISOString().split('T')[0] : ""} className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Venue/City</label>
                        <input type="text" name="city" defaultValue={weddingDetails?.city || ""} placeholder="Enter venue or city name" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Theme</label>
                        <input type="text" name="theme" defaultValue={weddingDetails?.theme || ""} placeholder="Enter wedding theme" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Estimated Guest Count</label>
                        <input type="number" name="estimatedguestcount" defaultValue={weddingDetails?.estimatedguestcount || ""} placeholder="Enter estimated guest count" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Budget</label>
                        <input type="number" name="budget" defaultValue={weddingDetails?.budget || ""} placeholder="Enter wedding budget" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181511] mb-2">Phone</label>
                        <input type="tel" name="phone" defaultValue={weddingDetails?.phone || ""} placeholder="Enter phone number" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#181511] mb-2">Special Requirements</label>
                        <input type="text" name="specialrequirements" defaultValue={weddingDetails?.specialrequirements?.join(', ') || ""} placeholder="e.g. wheelchair access, dietary restrictions" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => { setIsEditing(false); setUpdateMessage(null); }} className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-[#181511] hover:bg-gray-200">Cancel</button>
                    <button type="submit" disabled={isUpdating} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isUpdating ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-[#e89830] text-[#181511] hover:bg-[#d88a29]'}`}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Partner 1</p>
                    <p className="font-medium text-[#181511]">{weddingDetails.partner1name || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Partner 2</p>
                    <p className="font-medium text-[#181511]">{weddingDetails.partner2name || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Wedding Date</p>
                    <p className="font-medium text-[#181511]">{weddingDetails.weddingdate ? new Date(weddingDetails.weddingdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Venue/City</p>
                    <p className="font-medium text-[#181511]">{weddingDetails.city || 'Not specified'}</p>
                  </div>
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
              )}
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