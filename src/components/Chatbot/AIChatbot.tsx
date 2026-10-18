import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, MessageCircle, ArrowUp } from 'lucide-react';
import { AppPortal, UserRole, ChatMessage } from '../../types';
import { useRegion } from '../../context/RegionContext';

interface AIChatbotProps {
  currentPortal: AppPortal;
  userRole: UserRole;
  capabilities: string[];
  onNavigatePortal?: (portal: AppPortal) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  currentPortal,
  userRole,
  capabilities,
  onNavigatePortal,
}) => {
  const { region, config } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello. I am your NourishLoop guide for ${config.name}. I can explain food shelf-life estimates, donation compliance under ${config.foodSafety.name}, or help navigate surplus matching.`,
      timestamp: 'Just now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: 'Action Board rules', prompt: 'How does the Action Board categorize urgent vs moderate shelf-life?' },
    { label: 'Donation safety criteria', prompt: 'What items can safely be pledged to accredited food pantries?' },
    { label: 'Cold-chain verification', prompt: 'How does the system ensure refrigerated transport compliance?' },
    { label: 'Allergy safeguards', prompt: 'How does the deterministic allergy filter prevent cross-contamination?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          currentPortal,
          userRole,
          capabilities,
          region,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I couldn't process that query right now. Please try again.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `Under ${config.foodSafety.name} and FoodKeeper guidance, pantry donations require intact commercial seals, while household items should be refrigerated or cooked before expiry.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Circular Button */}
      <div className="fixed bottom-16 md:bottom-6 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.12)] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Open AI Assistant"
          title="Open AI Guide"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-[#6E6E73]" strokeWidth={1.5} />
          ) : (
            <Sparkles className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Floating Glass Sheet */}
      {isOpen && (
        <div className="fixed bottom-28 md:bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[80vh] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.20)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.60)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" />
              <span className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                AI Guide
              </span>
              <span className="text-[11px] text-[#86868B] font-normal">
                {config.shortName}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-1 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[13px] leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#1F7A4D] dark:bg-[#34C77B] text-white font-normal'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/[0.04] dark:bg-white/[0.08] rounded-[18px] px-3.5 py-2 text-[12px] text-[#86868B] flex items-center gap-1.5 animate-pulse">
                  <span>Reasoning</span>
                  <span className="animate-bounce">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quiet Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qp.prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-[11px] font-medium transition-colors cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.08] rounded-full px-3.5 py-1.5 border border-black/[0.04] dark:border-white/[0.06]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about food shelf-life, rules..."
                className="flex-1 bg-transparent text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B] text-white flex items-center justify-center disabled:opacity-30 transition-transform active:scale-95 cursor-pointer"
                aria-label="Send"
              >
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
