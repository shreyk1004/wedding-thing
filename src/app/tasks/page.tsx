"use client";

import { useState } from 'react';
import { WeddingHeader } from '@/components/wedding-header';
import { TaskList } from '@/components/task-list';
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

const weddingInfo = {
  bride: 'Sarah',
  groom: 'Alex',
  date: '2024-10-12',
  venue: 'Garden Rose Manor',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
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
    <div className="space-y-6">
      <WeddingHeader weddingInfo={weddingInfo} completionPercentage={completionPercentage} />
      <div>
        <h2 className="text-[#181511] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Tasks ({completedTasks}/{tasks.length} completed)
        </h2>
        <TaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
      </div>
    </div>
  );
} 