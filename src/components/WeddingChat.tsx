import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage, WeddingDetails } from '@/types/wedding';
import { extractWeddingDetails } from '@/lib/extractWeddingDetails';

const STARTER_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hi there! Congratulations on your upcoming wedding 🎉. To get started, could you tell me the date of your wedding?",
};

const requiredFields = [
  'partner1name',
  'partner2name',
  'weddingdate',
  'city',
  'theme',
  'estimatedguestcount',
  'contactemail',
  'phone',
  'budget'
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
      console.log('saveSuccess is true, setting up redirect timer...');
      const timeout = setTimeout(() => {
        console.log('Redirecting to /setup-password...');
        router.push('/setup-password');
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      console.log('saveSuccess is false, no redirect');
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
              const responseData = await saveRes.json();
              // Store both wedding details and the ID for later linking
              localStorage.setItem('weddingDetails', JSON.stringify({
                ...data.details,
                id: responseData.data.id
              }));
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
      const missingFields = requiredFields.filter(field => !(field in details));
      console.log('Missing fields:', missingFields);
      console.log('Required fields:', requiredFields);
      setMissingFields(missingFields);
      const isAllFieldsComplete = missingFields.length === 0;
      console.log('Is all fields complete:', isAllFieldsComplete);
      setIsComplete(isAllFieldsComplete);
      if (isAllFieldsComplete && !hasSaved) {
        console.log('All fields complete, attempting to save...');
        setIsSaving(true);
        setSaveError(null);
        try {
          const saveRes = await fetch('/api/wedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details),
          });
          if (saveRes.ok) {
            console.log('Save successful, setting saveSuccess to true');
            setSaveSuccess(true);
            setHasSaved(true);
            const responseData = await saveRes.json();
            // Store both wedding details and the ID for later linking
            localStorage.setItem('weddingDetails', JSON.stringify({
              ...details,
              id: responseData.data.id
            }));
          } else {
            const err = await saveRes.text();
            console.error('Save failed:', err);
            setSaveError(err || 'Failed to save details.');
          }
        } catch (err: any) {
          console.error('Save error:', err);
          setSaveError('Failed to save details.');
        } finally {
          setIsSaving(false);
        }
      } else if (!isAllFieldsComplete) {
        console.log('Not all fields complete, missing:', missingFields);
      } else if (hasSaved) {
        console.log('Already saved, not saving again');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200/50">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Wedding Planner</h2>
        <p className="text-sm text-gray-500 mt-1">Let's plan your perfect day together!</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 space-y-4 bg-transparent">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-base break-words font-medium ${
                message.role === 'assistant'
                  ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                  : 'bg-rose-500 text-white rounded-br-none'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Completion Banner or Input Form */}
      {isComplete ? (
        <div className="p-4 bg-green-50 border-t border-green-200 text-center">
          <p className="text-green-800 font-semibold">
            🎉 Great! We have all the information we need.
          </p>
          {isSaving && <p className="text-blue-600 mt-2">Saving your details...</p>}
          {saveSuccess && <p className="text-green-600 mt-2">Your details have been saved!</p>}
          {saveError && <p className="text-red-600 mt-2">{saveError}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white text-gray-900 placeholder:text-gray-500"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-0.5">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="m22 2-11 11"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 