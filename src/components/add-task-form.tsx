"use client";

import { useRef, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface AddTaskFormProps {
  addTask: (formData: FormData) => Promise<void>;
  existingTasks?: Array<{ id: string; title: string; description?: string }>;
  weddingDetails?: any;
}

export function AddTaskForm({ addTask, existingTasks = [], weddingDetails }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [suggestions, setSuggestions] = useState<{ title?: string; description?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTaskSuggestion = async () => {
    setIsGeneratingTitle(true);
    setError(null);
    setSuggestions(null);

    try {
      const response = await fetch('/api/task-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'title_and_description',
          existingTasks: existingTasks,
          weddingDetails: weddingDetails
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate task suggestion');
      }

      const data = await response.json();
      setSuggestions(data.suggestion);
      
      // Auto-fill the form with suggestions
      if (data.suggestion.title) {
        setTitle(data.suggestion.title);
      }
      if (data.suggestion.description) {
        setDescription(data.suggestion.description);
      }

    } catch (err) {
      console.error('Error generating task suggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const generateDescriptionOnly = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first');
      return;
    }

    setIsGeneratingDescription(true);
    setError(null);

    try {
      const response = await fetch('/api/task-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'description_only',
          title: title.trim(),
          existingTasks: existingTasks,
          weddingDetails: weddingDetails
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      
      // Auto-fill the description
      if (data.suggestion.description) {
        setDescription(data.suggestion.description);
        // Update suggestions state to show the feedback
        setSuggestions({
          description: data.suggestion.description
        });
      }

    } catch (err) {
      console.error('Error generating description:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    // Update form data with current state values
    formData.set('title', title);
    formData.set('description', description);
    
    await addTask(formData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setSuggestions(null);
    setError(null);
    formRef.current?.reset();
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="p-4 bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#181511]">Add a new task</h3>
        <button
          type="button"
          onClick={generateTaskSuggestion}
          disabled={isGeneratingTitle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate AI task suggestion"
        >
          <Sparkles className={`w-4 h-4 ${isGeneratingTitle ? 'animate-spin' : ''}`} />
          {isGeneratingTitle ? 'Generating...' : 'AI Suggest'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#181511] mb-2">
            Task Title
          </label>
          <input 
            id="title" 
            name="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Book a photographer" 
            required 
            className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-[#181511]">
              Description
            </label>
            {title.trim() && (
              <button
                type="button"
                onClick={generateDescriptionOnly}
                disabled={isGeneratingDescription}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate AI description for this title"
              >
                <Sparkles className={`w-3 h-3 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                {isGeneratingDescription ? 'Generating...' : 'AI'}
              </button>
            )}
          </div>
          <textarea 
            id="description" 
            name="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Research and contact top 3 photographers" 
            rows={3}
            className="w-full px-3 py-2 border border-[#e5e1dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e89830] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {suggestions && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI Suggestion Applied</span>
          </div>
          <div className="text-sm text-blue-700">
            {suggestions.title && <p><strong>Title:</strong> {suggestions.title}</p>}
            {suggestions.description && <p><strong>Description:</strong> {suggestions.description}</p>}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button 
          type="submit" 
          disabled={!title.trim() || isGeneratingTitle || isGeneratingDescription}
          className="w-full px-4 py-2 text-sm font-medium bg-[#f9f6f2] text-[#181511] rounded-lg hover:bg-[#f0ebe4] border border-[#f0ebe4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Task
        </button>
      </div>
    </form>
  );
} 