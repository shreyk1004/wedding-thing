"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
import { supabase } from '@/lib/supabase';
import { useChatContext } from '@/components/chat-provider';
import { Task } from '@/types';
import { AddTaskForm } from '@/components/add-task-form';
import { addTask } from './actions';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
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
    async function fetchTasks() {
      try {
        setTasksLoading(true);
        console.log('🔄 Starting to fetch tasks...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("❌ No user, not fetching tasks");
          setTasks([]);
          return;
        }

        console.log('👤 User found:', user.email, 'fetching tasks...');
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching tasks:', error);
          setTasks([]);
        } else {
          console.log('✅ Tasks fetched successfully:', data?.length || 0, 'tasks');
          setTasks(data || []);
        }
      } catch (err) {
        console.error('❌ Exception in fetchTasks:', err);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    }

    fetchTasks();
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
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'todo' ? 'done' : 'todo';

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      // Revert UI change on error
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = tasks;
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      setTasks(originalTasks);
    }
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#181511] mb-4">Your Tasks</h3>
                  {tasksLoading ? (
                    <div className="text-gray-500 text-center py-8">Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      <p>No tasks yet. Add your first wedding planning task!</p>
                    </div>
                  ) : (
                    <TaskList
                      tasks={tasks}
                      onTaskToggle={handleTaskToggle}
                      onDelete={handleDeleteTask}
                      onAIHelp={handleAIHelp}
                    />
                  )}
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <AddTaskForm 
                  addTask={async (formData: FormData) => {
                    await addTask(formData);
                    // Manually re-fetch tasks after adding a new one
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    const { data, error } = await supabase
                      .from('tasks')
                      .select('*')
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false });

                    if (!error && data) {
                      setTasks(data);
                    }
                  }}
                  existingTasks={tasks}
                  weddingDetails={weddingDetails}
                />
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
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
                            <label className="block text-sm font-medium text-[#181511] mb-2">City</label>
                            <input type="text" name="city" defaultValue={weddingDetails?.city || ""} placeholder="e.g. New York" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#181511] mb-2">Wedding Theme</label>
                            <input type="text" name="theme" defaultValue={weddingDetails?.theme || ""} placeholder="e.g. Rustic, Modern, etc." className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#181511] mb-2">Special Requirements</label>
                            <textarea name="specialrequirements" defaultValue={weddingDetails?.specialrequirements?.join(', ') || ""} placeholder="e.g. Vegan options, accessibility needs" rows={3} className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"></textarea>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-6">
                        <button type="button" onClick={() => { setIsEditing(false); setUpdateMessage(null); }} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                          Cancel
                        </button>
                        <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm font-medium bg-[#e89830] text-white rounded-lg hover:bg-[#d68920] disabled:bg-opacity-50">
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    weddingDetails && (
                      <div className="text-[#181511]">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <p><strong>Partner 1:</strong> {weddingDetails.partner1name || 'Not set'}</p>
                          <p><strong>Partner 2:</strong> {weddingDetails.partner2name || 'Not set'}</p>
                          <p><strong>Date:</strong> {weddingDetails.weddingdate ? new Date(weddingDetails.weddingdate).toLocaleDateString() : 'Not set'}</p>
                          <p><strong>City:</strong> {weddingDetails.city || 'Not set'}</p>
                          <p className="col-span-2"><strong>Theme:</strong> {weddingDetails.theme || 'Not set'}</p>
                          <p className="col-span-2"><strong>Special Requirements:</strong> {weddingDetails.specialrequirements?.join(', ') || 'None'}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 