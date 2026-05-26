import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import type { ChatMessage, ChatContext, HistoryEntry } from '../../utils/chatContext';
import { FREE_MESSAGE_LIMIT, MAX_HISTORY_MESSAGES } from '../../utils/chatContext';

// Set VITE_CHAT_PREMIUM=true to enable free-tier message limits
const PREMIUM_MODE = import.meta.env.VITE_CHAT_PREMIUM === 'true';

let idCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++idCounter}`;
}

export function ChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const context: ChatContext = {
    pageUrl: window.location.href,
  };

  const handleSend = useCallback(async (text: string) => {
    if (PREMIUM_MODE && sessionCount >= FREE_MESSAGE_LIMIT) {
      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: `You've reached the ${FREE_MESSAGE_LIMIT}-message free limit for this session. Upgrade to premium for unlimited access.`,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setSessionCount(c => c + 1);

    try {
      // Build history from current messages (last N pairs, excluding the one we just added)
      const history: HistoryEntry[] = messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          pageUrl: window.location.href,
          calculatorName: context.calculatorName,
          resultSummary: context.resultSummary,
          history,
        }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: res.ok
            ? (data.message ?? 'No response received.')
            : (data.error ?? 'Something went wrong. Please try again.'),
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: 'Network error. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  // location.pathname triggers re-render when page changes, keeping pageUrl fresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, sessionCount, location.pathname]);

  const handleClear = useCallback(() => {
    setMessages([]);
    setSessionCount(0);
  }, []);

  return (
    <>
      {open && (
        <ChatWindow
          messages={messages}
          loading={loading}
          onSend={handleSend}
          onClose={() => setOpen(false)}
          onClear={handleClear}
          context={context}
        />
      )}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close Digi assistant' : 'Open Digi — ResearchCalcHub Assistant'}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 print:hidden"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-sm font-medium">{open ? 'Close' : 'Ask Digi'}</span>
      </button>
    </>
  );
}
