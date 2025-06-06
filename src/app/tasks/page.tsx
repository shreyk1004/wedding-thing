"use client";

import { useState, useEffect } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
import { Task } from '@/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

interface WeddingDetails {
  partner1name: string;
  partner2name: string;
  weddingdate: string;
  city: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchWedding() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('weddings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setWeddingDetails(data);
      } catch (err: any) {
        console.error('Error fetching wedding:', err);
        setError(err?.message || 'Failed to fetch wedding details');
        setWeddingDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWedding();
  }, [supabase]);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {loading && <div className="text-[#887863] text-lg">Loading wedding details...</div>}
      {error && <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>}
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
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3">
          Tasks ({completedTasks}/{tasks.length} completed)
        </h2>
        <TaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
      </div>
    </div>
  );
} 