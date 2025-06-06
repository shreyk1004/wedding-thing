"use client";

import { useState, useEffect } from 'react';
import { X, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { Task } from '@/types';

interface TaskAIHelpModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskAIHelpModal({ task, onClose }: TaskAIHelpModalProps) {
  const [advice, setAdvice] = useState<string>('');
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TaskAIHelpModal mounted for task:', task);
    fetchAIHelp();
  }, [task]);

  const fetchAIHelp = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching AI help for task:', task);
      
      const response = await fetch('/api/task-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI help response:', data);
      
      if (data.error) {
        setError(data.error);
      } else {
        setAdvice(data.advice || data.content || 'No advice available');
        setToolsUsed(data.toolsUsed || []);
      }
    } catch (err) {
      console.error('Error fetching AI help:', err);
      setError('Failed to get AI help. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAdvice = (advice: string) => {
    return advice
      // FIRST: Process and protect image tags before other processing
      .replace(/<img([^>]+)>/g, (match, attrs) => {
        const srcMatch = attrs.match(/src="([^"]+)"/);
        const altMatch = attrs.match(/alt="([^"]+)"/);
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : 'Venue image';
        
        return `<div style="position: relative; margin: 1em 0; display: block;">
          <img src="${src}" alt="${alt}" 
               style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; display: block;"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div style="display: none; width: 100%; height: 200px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px; border: 1px solid #e5e7eb; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
            📸 ${alt}
          </div>
        </div>`;
      })
      
      // Venue card styling
      .replace(/<div class="venue-card">/g, '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin: 1em 0;">')
      .replace(/<div class="vendor-card">/g, '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin: 1em 0;">')
      .replace(/<div class="menu-card">/g, '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin: 1em 0;">')
      .replace(/<div class="invitation-card">/g, '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin: 1em 0;">')
      .replace(/<div class="hotel-card">/g, '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin: 1em 0;">')
      
      // Convert markdown headers to HTML
      .replace(/^### (.*$)/gm, '<h3 style="color: #1f2937; font-weight: 600; font-size: 1.2em; margin: 1.5em 0 0.5em 0;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #1f2937; font-weight: 700; font-size: 1.4em; margin: 2em 0 1em 0;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #1f2937; font-weight: 800; font-size: 1.6em; margin: 2em 0 1em 0;">$1</h1>')
      
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>')
      
      // Convert markdown links (but NOT image links)
      .replace(/\[([^\]]+)\]\(([^)]+)\)(?!.*<img)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      
      // Convert phone numbers to clickable links
      .replace(/📞\s*\((\d{3})\)\s*(\d{3})-(\d{4})/g, '📞 <a href="tel:+1$1$2$3" style="color: #059669; text-decoration: underline;">($1) $2-$3</a>')
      
      // Convert lists
      .replace(/^- (.*$)/gm, '<li style="color: #374151; margin: 0.25em 0;">$1</li>')
      .replace(/^• (.*$)/gm, '<li style="color: #374151; margin: 0.25em 0;">$1</li>')
      .replace(/^✅ (.*$)/gm, '<li style="color: #065f46; margin: 0.25em 0;">✅ $1</li>')
      .replace(/^⚠️ (.*$)/gm, '<li style="color: #d97706; margin: 0.25em 0;">⚠️ $1</li>')
      .replace(/^🚨 (.*$)/gm, '<li style="color: #dc2626; margin: 0.25em 0;">🚨 $1</li>')
      
      // Wrap consecutive list items
      .replace(/((?:<li[^>]*>.*?<\/li>\s*){2,})/g, '<ul style="margin: 1em 0; padding-left: 1.5em;">$1</ul>')
      
      // Handle horizontal rules
      .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2em 0;"/>')
      
      // Handle line breaks and paragraphs (avoid wrapping image divs)
      .replace(/\n\n/g, '</p><p style="color: #374151; margin: 1em 0;">')
      .replace(/\n/g, '<br/>')
      
      // Wrap in paragraph tags if not already wrapped (exclude image containers and other elements)
      .replace(/^(?!<[h1-6]|<ul|<li|<div|<img|<hr)(.+?)(?=<|$)/gm, '<p style="color: #374151; margin: 1em 0;">$1</p>');
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'create_venue_checklist':
        return '📝';
      case 'suggest_vendors':
        return '🏪';
      case 'create_timeline':
        return '📅';
      case 'budget_breakdown':
        return '💰';
      default:
        return '🔧';
    }
  };

  const getToolLabel = (toolName: string) => {
    switch (toolName) {
      case 'create_venue_checklist':
        return 'Venue Checklist';
      case 'suggest_vendors':
        return 'Vendor Suggestions';
      case 'create_timeline':
        return 'Timeline Planning';
      case 'budget_breakdown':
        return 'Budget Analysis';
      default:
        return toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 99999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        zIndex: 99999
      }}>
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" style={{ color: 'white' }} />
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ 
                  color: 'white !important',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0 
                }}
              >
                AI Wedding Assistant
              </h2>
              <p 
                className="text-sm"
                style={{ 
                  color: 'rgba(219, 234, 254, 0.9)',
                  fontSize: '0.875rem',
                  margin: 0 
                }}
              >
                Task: {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ 
              color: 'white',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tools Used Badge */}
        {toolsUsed.length > 0 && (
          <div 
            className="px-6 py-3 bg-blue-50 border-b border-blue-100"
            style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe' }}
          >
            <div 
              className="flex items-center gap-2 text-sm text-blue-700"
              style={{ color: '#1d4ed8' }}
            >
              <CheckCircle 
                className="w-4 h-4" 
                style={{ color: '#1d4ed8' }}
              />
              <span 
                className="font-medium"
                style={{ 
                  color: '#1d4ed8',
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}
              >
                AI Tools Used:
              </span>
              <div className="flex gap-2">
                {toolsUsed.map((tool, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs"
                    style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}
                  >
                    <span>{getToolIcon(tool)}</span>
                    {getToolLabel(tool)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p 
                  className="text-gray-600"
                  style={{ 
                    color: '#4b5563',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Getting personalized advice...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Unable to get AI help</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {advice && !loading && (
            <div className="space-y-4">
              <div className="venue-cards max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatAdvice(advice) 
                  }}
                  style={{
                    color: '#374151',
                    lineHeight: '1.75',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div 
            className="text-xs text-gray-500"
            style={{ 
              color: '#6b7280',
              fontSize: '0.75rem'
            }}
          >
            Powered by AI • Wedding data from Supabase
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 