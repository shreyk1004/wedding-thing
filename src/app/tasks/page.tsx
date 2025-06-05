"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
import { Task } from '@/types';
import { supabase } from '@/lib/supabase';

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
  const [aiModalTask, setAIModalTask] = useState<Task | null>(null);

  useEffect(() => {
    async function fetchWedding() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) {
        setError('Failed to fetch wedding details');
        setWeddingDetails(null);
      } else {
        setWeddingDetails(data);
      }
      setLoading(false);
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
    setAIModalTask(task);
  };

  const closeAIModal = () => setAIModalTask(null);

  return (
    <div className="space-y-6">
      {loading && <div className="text-gray-500">Loading wedding details...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {weddingDetails && (
        <>
          <WeddingHeader
            weddingInfo={{
              bride: weddingDetails.partner1name || '',
              groom: weddingDetails.partner2name || '',
              date: weddingDetails.weddingdate || '',
              venue: weddingDetails.city || '',
            }}
            completionPercentage={completionPercentage}
          />
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
      {/* AI Help Modal */}
      {aiModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
            <button
              onClick={closeAIModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2">AI Help for: {aiModalTask.title}</h3>
            <p className="mb-4 text-gray-700">(AI insights and suggestions will appear here.)</p>
            {/* TODO: Add AI insights here */}
          </div>
        </div>
      )}
    </div>
  );
} 