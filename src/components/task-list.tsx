"use client";

import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskToggle }: TaskListProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex overflow-hidden rounded-xl border border-[#e5e1dc] bg-white shadow-sm">
        <table className="flex-1">
          <thead>
            <tr className="bg-white border-b border-[#e5e1dc]">
              <th className="px-4 py-3 text-left text-[#181511] text-sm font-medium leading-normal">
                Task
              </th>
              <th className="px-4 py-3 text-left text-[#181511] w-32 text-sm font-medium leading-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                className={cn(
                  "border-t border-t-[#e5e1dc] hover:bg-[#fefefe] transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                )}
              >
                <td className="h-[72px] px-4 py-2 text-[#181511] text-sm font-normal leading-normal">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className={cn(
                        "font-medium",
                        task.status === 'done' && "line-through text-[#887863]"
                      )}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-[#887863] mt-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="h-[72px] px-4 py-2 w-32 text-sm font-normal leading-normal">
                  <button
                    onClick={() => onTaskToggle(task.id)}
                    className={cn(
                      "flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 text-sm font-medium leading-normal w-full transition-colors",
                      task.status === 'done'
                        ? "bg-[#e8f5e8] text-[#2d5a2d] hover:bg-[#d4f0d4]"
                        : "bg-[#f4f3f0] text-[#181511] hover:bg-[#ebe9e5]"
                    )}
                  >
                    <span className="truncate">
                      {task.status === 'done' ? 'Done' : 'To Do'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 