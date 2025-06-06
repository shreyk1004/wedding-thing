import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage, WeddingDetails } from '@/types/wedding';
import { extractWeddingDetails } from '@/lib/extractWeddingDetails';

const STARTER_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hi there! Congratulations on your upcoming wedding 🎉. To get started, could you tell me the date of your wedding?",
};

const REQUIRED_FIELDS = [
  'partner1Name',
  'partner2Name',
  'weddingDate',
  'city',
  'theme',
  'estimatedGuestCount',
  'contactEmail',
  'phone',
  'budget',
];

export function WeddingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (saveSuccess) {
      const timeout = setTimeout(() => {
        router.push('/tasks');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [saveSuccess, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after sending, unless loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      
      if (!res.ok) {
        console.error('API response not ok:', res.status, res.statusText);
        throw new Error(`API request failed: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API response data:', data);
      if (data.functionCall && data.details) {
        // Model has called the function with structured details
        setMessages(prev => [...prev, { role: 'assistant', content: 'Thank you! All your details have been collected.' }]);
        setIsComplete(true);
        setMissingFields([]);
        setIsLoading(false);
        if (!hasSaved) {
          setIsSaving(true);
          setSaveError(null);
          try {
            const saveRes = await fetch('/api/wedding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.details),
            });
            if (saveRes.ok) {
              setSaveSuccess(true);
              setHasSaved(true);
              localStorage.setItem('weddingDetails', JSON.stringify(data.details));
            } else {
              const err = await saveRes.text();
              setSaveError(err || 'Failed to save details.');
            }
          } catch (err: any) {
            setSaveError('Failed to save details.');
          } finally {
            setIsSaving(false);
          }
        }
        return;
      }
      // Otherwise, show the assistant's reply as before
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
      // Extraction for debug only
      const details = extractWeddingDetails([...messages, userMessage, assistantMessage]);
      console.log('Extracted details:', details);
      const missingFields = REQUIRED_FIELDS.filter(field => !(field in details));
      setMissingFields(missingFields);
      const isAllFieldsComplete = missingFields.length === 0;
      setIsComplete(isAllFieldsComplete);
      if (isAllFieldsComplete && !hasSaved) {
        setIsSaving(true);
        setSaveError(null);
        try {
          const saveRes = await fetch('/api/wedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details),
          });
          if (saveRes.ok) {
            setSaveSuccess(true);
            setHasSaved(true);
          } else {
            const err = await saveRes.text();
            setSaveError(err || 'Failed to save details.');
          }
        } catch (err: any) {
          setSaveError('Failed to save details.');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-[#f4f6fb] rounded-2xl shadow-2xl border border-[#e0e7ef] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#4f8cff] to-[#6ed0fa] px-6 py-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Wedding Planning Chat Assistant</h2>
        <p className="text-sm text-blue-100 mt-1">Let's plan your perfect day together!</p>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#f4f6fb]">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-base font-medium break-words ${
                message.role === 'assistant'
                  ? 'bg-[#e3f0ff] text-[#1a365d] border border-[#b6d6fa]'
                  : 'bg-[#f0f1f3] text-[#23272f] border border-[#d1d5db]'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Completion Banner */}
      {isComplete ? (
        <div className="p-4 bg-green-100 border-t border-green-300 text-center">
          <p className="text-green-900 font-semibold">
            🎉 Great! We have all the information we need. Let's move on to planning your perfect wedding!
          </p>
          {isSaving && <p className="text-blue-700 mt-2">Saving your details...</p>}
          {saveSuccess && <p className="text-green-800 mt-2">Your details have been saved!</p>}
          {saveError && <p className="text-red-700 mt-2">{saveError}</p>}
          {missingFields.length > 0 && (
            <div className="p-2 bg-yellow-100 text-yellow-900 text-sm rounded mt-2">
              Debug: Missing fields: {missingFields.join(', ')}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-[#e0e7ef]">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-xl border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#4f8cff] text-base bg-[#f9fafb] text-[#23272f] placeholder:text-[#a0aec0]"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4f8cff] to-[#6ed0fa] text-white font-bold shadow-md hover:from-[#3578e5] hover:to-[#4fc3f7] focus:outline-none focus:ring-2 focus:ring-[#4f8cff] disabled:opacity-60 transition-all"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 