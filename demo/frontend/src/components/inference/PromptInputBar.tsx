import React from 'react';
import { Send, Command } from 'lucide-react';

const PromptInputBar: React.FC = () => {
  return (
    <div className="h-[64px] w-full bg-bg-secondary border-t border-border-standard flex items-center px-6 gap-4">
      <div className="flex-1 relative flex items-center">
        <input 
          type="text" 
          placeholder="Type your prompt here..."
          className="w-full bg-transparent border-none outline-none text-text-primary body-text placeholder:text-text-disabled"
        />
        <div className="flex items-center gap-1.5 px-3 py-1 border border-border-standard rounded-sm text-text-disabled mr-2">
            <Command className="w-3 h-3" />
            <span className="tiny-metadata">Enter</span>
        </div>
      </div>
      <button className="w-11 h-11 flex items-center justify-center rounded-sm transition-all hover:bg-bg-tertiary group">
        <Send className="w-5 h-5 text-text-disabled group-hover:text-text-primary transition-colors" />
      </button>
    </div>
  );
};

export default PromptInputBar;
