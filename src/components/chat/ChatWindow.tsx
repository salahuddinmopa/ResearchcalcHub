import { useEffect, useRef } from 'react';
import { X, Trash2, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ChatContext } from '../../utils/chatContext';
import { STARTER_QUESTIONS } from '../../utils/chatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Props {
  messages: ChatMessageType[];
  loading: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  onClear: () => void;
  context: ChatContext;
}

export function ChatWindow({ messages, loading, onSend, onClose, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const isEmpty = messages.length === 0;

  return (
    <div
      role="dialog"
      aria-label="ResearchCalcHub Assistant"
      className="fixed bottom-[72px] right-4 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      style={{ width: 'min(380px, calc(100vw - 32px))', height: 'min(560px, calc(100dvh - 90px))' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm leading-tight">Digi Assistant</h2>
          <p className="text-blue-100 text-xs truncate">Your friendly ResearchCalcHub assistant</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onClear}
            aria-label="Clear chat history"
            title="Clear chat"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors duration-150"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 flex-shrink-0">
        <p className="text-xs text-amber-700 text-center leading-snug">
          Do not submit confidential or personally identifiable data. Responses are for educational and research-support purposes only.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isEmpty ? (
          <div>
            {/* Welcome message */}
            <div className="flex justify-start mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <span className="text-white text-xs font-bold select-none">D</span>
              </div>
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm max-w-[82%] leading-relaxed">
                Hi, I'm Digi, your virtual assistant from Digibly. I can help you find calculators, understand results, upload data, and use ResearchCalcHub. How can I help you today?
              </div>
            </div>
            {/* Starter questions */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-400 px-1 mb-2">Suggested questions:</p>
              {STARTER_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <span className="text-white text-xs font-bold select-none">D</span>
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={loading} />
    </div>
  );
}
