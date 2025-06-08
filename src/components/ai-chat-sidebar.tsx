"use client";

import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Plus, Send, Brain, Minimize2 } from 'lucide-react';
import { Task } from '@/types';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface ChatSession {
  id: string;
  task: Task;
  messages: ChatMessage[];
  isLoading: boolean;
  isActive: boolean;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task;
}

export function AIChatSidebar({ isOpen, onClose, initialTask }: AIChatSidebarProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch wedding details
  useEffect(() => {
    async function fetchWedding() {
      setLoading(true);
      try {
        console.log('AI Chat: Fetching wedding data from API...');
        
        const response = await fetch('/api/wedding');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch wedding details');
        }
        
        console.log('AI Chat: API response:', result);
        
        if (result.data) {
          setWeddingDetails(result.data);
        } else {
          console.log('AI Chat: No wedding details found');
          setWeddingDetails(null);
        }
      } catch (err) {
        console.error('AI Chat: Error fetching wedding details:', err);
        setWeddingDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchWedding();
  }, []);

  // Handle initial task or new task
  useEffect(() => {
    if (initialTask) {
      // Check if we already have a chat for this exact task
      const existingChat = chatSessions.find(session => 
        session.task.id === initialTask.id && session.task.title === initialTask.title
      );
      
      if (existingChat) {
        // Switch to existing chat
        setActiveChatId(existingChat.id);
      } else {
        // Create new chat for this task
        const newChat = createNewChat(initialTask);
        setChatSessions(prev => [...prev, newChat]);
        setActiveChatId(newChat.id);
        // Send initial AI help request with the chat data
        sendInitialTaskMessage(newChat.id, initialTask, newChat);
      }
    }
  }, [initialTask?.id, initialTask?.title]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSessions]);

  const createNewChat = (task: Task): ChatSession => {
    return {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task,
      messages: [
        {
          id: `msg-${Date.now()}`,
          type: 'assistant',
          content: `Hi! I'm here to help you with **${task.title}**. What specific assistance do you need?`,
          timestamp: new Date()
        }
      ],
      isLoading: false,
      isActive: true
    };
  };

  const sendInitialTaskMessage = async (chatId: string, task: Task, chatData?: ChatSession) => {
    const initialPrompt = `Help me complete this task: "${task.title}". ${task.description ? `Description: ${task.description}` : ''}`;
    await sendMessage(chatId, initialPrompt, true, chatData);
  };

  const sendMessage = async (chatId: string, message: string, isInitial = false, chatData?: ChatSession) => {
    if ((!message.trim() && !isInitial) || !chatId) return;

    console.log('Sending message:', { chatId, message, isInitial });

    // Get current chat session - use provided chatData if available, or find in current state
    let currentChat: ChatSession | undefined = chatData;
    if (!currentChat) {
      currentChat = chatSessions.find(s => s.id === chatId);
    }

    if (!currentChat) {
      console.error('Chat not found:', chatId, 'Available chats:', chatSessions.map(c => c.id));
      return;
    }

    // Update the chat sessions state
    setChatSessions(prev => {
      // Add user message if not initial
      if (!isInitial) {
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}-user`,
          type: 'user',
          content: message,
          timestamp: new Date()
        };

        return prev.map(session => 
          session.id === chatId 
            ? { ...session, messages: [...session.messages, userMessage], isLoading: true }
            : session
        );
      } else {
        // Mark as loading for initial request
        return prev.map(session => 
          session.id === chatId ? { ...session, isLoading: true } : session
        );
      }
    });

    try {

      console.log('Making API call to /api/task-help...');
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/task-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: currentChat.task,
          message: isInitial ? undefined : message,
          chatHistory: currentChat.messages.slice(-10), // Send last 10 messages for context
          weddingDetails: weddingDetails // Add wedding details to context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        type: 'assistant',
        content: data.advice || data.content || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date(),
        toolsUsed: data.toolsUsed || []
      };

      setChatSessions(prev => prev.map(session => 
        session.id === chatId 
          ? { 
              ...session, 
              messages: [...session.messages, assistantMessage], 
              isLoading: false 
            }
          : session
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent = 'Request timed out. Please try again.';
        } else if (error.message.includes('status: 500')) {
          errorContent = 'Server error. Please check the console and try again.';
        }
      }
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };

      setChatSessions(prev => prev.map(session => 
        session.id === chatId 
          ? { 
              ...session, 
              messages: [...session.messages, errorMessage], 
              isLoading: false 
            }
          : session
      ));
    }

    setInputMessage('');
  };

  const startNewChat = (task: Task) => {
    // Check if we already have a chat for this task
    const existingChat = chatSessions.find(session => 
      session.task.id === task.id && session.task.title === task.title
    );
    
    if (existingChat) {
      // Switch to existing chat
      setActiveChatId(existingChat.id);
    } else {
      // Create new chat for this task
      const newChat = createNewChat(task);
      setChatSessions(prev => [...prev, newChat]);
      setActiveChatId(newChat.id);
      sendInitialTaskMessage(newChat.id, task, newChat);
    }
  };

  const closeChat = (chatId: string) => {
    setChatSessions(prev => {
      const remaining = prev.filter(session => session.id !== chatId);
      if (remaining.length === 0) {
        onClose();
        return [];
      }
      // If we closed the active chat, switch to the first remaining one
      if (chatId === activeChatId && remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      }
      return remaining;
    });
  };

  const activeChat = chatSessions.find(session => session.id === activeChatId);

  const formatMessageContent = (content: string, messageType: 'user' | 'assistant') => {
    const baseColor = messageType === 'user' ? 'color: white;' : 'color: #374151;';
    
    if (messageType === 'user') {
      // Simple formatting for user messages
      return `<div style="${baseColor}">${content.replace(/\n/g, '<br/>')}</div>`;
    }

    // Enhanced formatting for assistant messages
    let formatted = content;

    // Convert numbered list items with links and images to attractive cards
    formatted = formatted.replace(
      /(\d+)\.\s*\[([^\]]+)\]\(([^)]+)\)\s*-\s*([^.]+\.)\s*([^.]+\.)\s*([^.]+\.)\s*!\[([^\]]+)\]\(([^)]+)\)/g,
      (match, num, title, url, desc1, desc2, cost, altText, imgUrl) => {
                 return `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 12px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 100%; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">${num}</span>
              <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0; word-wrap: break-word;">${title}</h3>
            </div>
            <img src="${imgUrl}" alt="${altText}" style="width: 100%; max-width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin: 8px 0; display: block;">
            <p style="color: #475569; margin: 8px 0 4px 0; font-size: 14px; word-wrap: break-word;">${desc1.trim()}</p>
            <p style="color: #475569; margin: 4px 0; font-size: 14px; word-wrap: break-word;">${desc2.trim()}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 8px;">
              <span style="color: #059669; font-weight: 600; font-size: 14px; word-wrap: break-word;">💰 ${cost.replace('The cost ranges from ', '')}</span>
              <a href="${url}" target="_blank" style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500; white-space: nowrap;">Visit Website</a>
            </div>
          </div>
        `;
      }
    );

    // Handle remaining markdown patterns
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1e293b;">$1</strong>')
      .replace(/^\s*#\s+(.+)$/gm, '<h2 style="color: #1e293b; font-size: 18px; font-weight: bold; margin: 16px 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">$1</h2>')
      .replace(/^\s*##\s+(.+)$/gm, '<h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 12px 0 6px 0;">$1</h3>')
      .replace(/^\s*###\s+(.+)$/gm, '<h4 style="color: #1e293b; font-size: 14px; font-weight: 600; margin: 10px 0 4px 0;">$1</h4>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">')
      .replace(/✅/g, '<span style="color: #059669;">✅</span>')
      .replace(/📞/g, '<span style="color: #3b82f6;">📞</span>')
      .replace(/🌐/g, '<span style="color: #3b82f6;">🌐</span>')
      .replace(/💰/g, '<span style="color: #059669;">💰</span>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return `<div style="${baseColor} line-height: 1.5; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word;">${formatted}</div>`;
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-20 right-0 z-50 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-l-full shadow-lg text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
        title="Expand Chat"
      >
        <Brain className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl border-l-2 border-gray-400 z-50 transition-all duration-300 w-96`} 
        style={{ 
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.25)'
        }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">AI Wedding Assistant</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <>
        {/* Chat Tabs */}
        {chatSessions.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 p-2 shadow-sm" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex gap-1 overflow-x-auto">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveChatId(session.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    session.id === activeChatId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="truncate max-w-20 text-inherit">
                    {session.task.title}
                  </span>
                  <X 
                    className="w-3 h-3 ml-1 hover:bg-black/10 rounded text-inherit"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeChat(session.id);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white" style={{ height: 'calc(100vh - 120px)', backgroundColor: '#ffffff' }}>
          {activeChat ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 word-wrap break-words ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content, message.type)
                        }}
                      />
                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <div 
                          className="mt-2 text-xs font-medium"
                          style={{ 
                            color: message.type === 'user' ? '#bfdbfe' : '#4b5563'
                          }}
                        >
                          🔧 Tools used: {message.toolsUsed.join(', ')}
                        </div>
                      )}
                      <div 
                        className="text-xs mt-1"
                        style={{ 
                          color: message.type === 'user' ? '#bfdbfe' : '#6b7280'
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeChat.isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span style={{ color: '#374151' }} className="text-sm font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(activeChatId, inputMessage)}
                    placeholder="Ask about this task..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={activeChat.isLoading}
                  />
                  <button
                    onClick={() => sendMessage(activeChatId, inputMessage)}
                    disabled={!inputMessage.trim() || activeChat.isLoading}
                    className="bg-blue-500 text-white rounded-lg px-3 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-gray-700 font-medium">No active chats</p>
                <p className="text-sm text-gray-500">Click AI Help on a task to start</p>
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
} 