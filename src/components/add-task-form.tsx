"use client";

import { useRef } from 'react';

export function AddTaskForm({ addTask }: { addTask: (formData: FormData) => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addTask(formData);
        formRef.current?.reset();
      }}
      className="p-4 bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-[#181511] mb-4">Add a new task</h3>
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#181511] mb-2">Task Title</label>
          <input id="title" name="title" placeholder="e.g. Book a photographer" required className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#181511] mb-2">Description</label>
          <input id="description" name="description" placeholder="e.g. Research and contact top 3 photographers" className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"/>
        </div>
      </div>
      <div className="mt-4">
        <button type="submit" className="w-full px-4 py-2 text-sm font-medium bg-[#f9f6f2] text-[#181511] rounded-lg hover:bg-[#f0ebe4] border border-[#f0ebe4] transition-colors">Add Task</button>
      </div>
    </form>
  );
} 