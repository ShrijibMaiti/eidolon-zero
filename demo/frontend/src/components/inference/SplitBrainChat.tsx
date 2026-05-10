import React from 'react';
import ChatPane from './ChatPane';
import PromptInputBar from './PromptInputBar';
import { useDomain } from '@/src/context/DomainContext';
import { MOCK_CONVERSATION } from '@/src/data/mockData';

const SplitBrainChat: React.FC = () => {
  const { activeDomain } = useDomain();

  const messages = [
    { role: 'user' as const, content: MOCK_CONVERSATION.prompt },
    { role: 'assistant' as const, content: MOCK_CONVERSATION.baseResponse },
  ];

  const adaptedMessages = [
    { role: 'user' as const, content: MOCK_CONVERSATION.prompt },
    { role: 'assistant' as const, content: MOCK_CONVERSATION.adaptedResponse },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="flex-1 flex flex-row relative">
        {/* Left Pane */}
        <ChatPane 
          title="BASE MODEL"
          subtitle="Qwen 1.5 0.5B, no adaptation."
          messages={messages}
          stats={{ latency: '217ms', tokens: 128 }}
        />

        {/* Divider */}
        <div className="relative w-[2px] bg-bg-primary h-full">
            <div className="absolute inset-0 border-l border-dashed border-border-dashed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-2 py-1 bg-bg-primary border border-border-dashed rounded-sm">
                <span className="tiny-metadata text-text-muted">DELTA</span>
            </div>
        </div>

        {/* Right Pane */}
        <ChatPane 
          title="EIDOLON:ZERO"
          subtitle="LoRA injected, domain active."
          messages={adaptedMessages}
          isActive={true}
          badge={`DOMAIN: ${activeDomain.toUpperCase()}`}
          stats={{ latency: '153ms', tokens: 168, highlight: true }}
        />
      </div>

      <PromptInputBar />
    </div>
  );
};

export default SplitBrainChat;
