import React from 'react';
import { cn } from '@/src/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPaneProps {
  title: string;
  subtitle?: string;
  messages: ChatMessage[];
  stats: {
    latency: string;
    tokens: number;
    highlight?: boolean;
  };
  isActive?: boolean;
  badge?: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({ title, subtitle, messages, stats, isActive, badge }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-hidden">
      <header className="p-4 border-b border-border-soft flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className={cn("section-heading", isActive ? "text-text-primary" : "text-text-secondary")}>
            {title}
          </h3>
          {subtitle && <p className="tiny-metadata text-text-muted">{subtitle}</p>}
        </div>
        {badge && (
          <div className="border border-accent-green px-2 py-0.5 rounded-sm flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="tiny-metadata text-accent-green font-bold">{badge}</span>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-3">
            <span className="tiny-metadata text-text-disabled">{msg.role.toUpperCase()}</span>
            <div className={cn(
              "body-text p-4 rounded-sm border",
              msg.role === 'user' 
                ? "bg-bg-secondary border-border-standard text-text-secondary" 
                : "bg-bg-tertiary border-border-soft text-text-primary mb-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            )}>
              {msg.content}
            </div>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="tiny-metadata text-text-disabled">LATENCY</span>
                  <span className={cn("technical-label", stats.highlight ? "text-accent-green" : "text-text-secondary")}>
                    {stats.latency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tiny-metadata text-text-disabled">TOKENS</span>
                  <span className="technical-label text-text-secondary">{stats.tokens}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPane;
