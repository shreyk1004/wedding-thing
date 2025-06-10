"use client";

import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { Sparkles, Trash2, CheckCircle, Undo2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAIHelp: (task: Task) => void;
}

export function TaskList({ tasks, onTaskToggle, onDelete, onAIHelp }: TaskListProps) {
  return (
    <div className="grid gap-4 grid-cols-1">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={() => onTaskToggle(task.id)}
          onDelete={() => onDelete(task.id)}
          onAIHelp={() => onAIHelp(task)}
        />
      ))}
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onAIHelp }: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onAIHelp: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 border-2 flex flex-col gap-4 transition-all relative group overflow-hidden ${task.status === 'done' ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'} text-gray-900`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-xl font-extrabold font-sans tracking-tight flex items-center gap-2 text-[#2d2a26] min-w-0">
          <span>{task.status === 'done' ? '🎉' : '📝'}</span>
          <span className="break-words">{task.title}</span>
        </h3>
        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold shadow ${task.status === 'done' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{task.status === 'done' ? 'Done' : 'To Do'}</span>
      </div>
      
      <p
        style={{ color: '#181511', fontSize: '1rem', fontWeight: 500 }}
        className={`min-h-[40px] ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}
      >
        {task.description || <span className="text-gray-400">No description</span>}
      </p>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-black/5">
        <button
          onClick={onToggle}
          aria-label={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
          className={`flex items-center justify-center p-2 rounded-lg font-bold transition-colors shadow-sm w-12 h-12 ${task.status === 'done' ? 'bg-green-300 text-green-900 hover:bg-green-400' : 'bg-yellow-300 text-yellow-900 hover:bg-yellow-400'}`}
        >
          {task.status === 'done' ? <Undo2 size={22} /> : <CheckCircle size={22} />}
        </button>
        
        <button
          onClick={onAIHelp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 h-12 rounded-lg bg-blue-200 text-blue-900 font-bold shadow-sm hover:bg-blue-300 transition-colors border-2 border-blue-300 min-w-0"
        >
          <Sparkles className="text-blue-500 flex-shrink-0" size={20} />
          <span className="truncate">AI Help</span>
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete Task"
          className="p-2 rounded-lg bg-red-200 text-red-700 font-bold shadow-sm hover:bg-red-300 transition-colors flex items-center justify-center w-12 h-12 flex-shrink-0"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-2xl z-10 border-2 border-red-400 shadow-xl animate-fade-in text-gray-900">
          <span className="text-lg text-red-700 font-bold mb-3">Delete this task?</span>
          <div className="flex gap-3">
            <button onClick={onDelete} className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 shadow">Yes, Delete</button>
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 