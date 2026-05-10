import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const NODES = [
  { id: 'input', label: 'INPUT', sub: 'User Prompt' },
  { id: 'hypernetwork', label: 'HYPERNETWORK', sub: 'Dynamic Generator' },
  { id: 'lora', label: 'LORA ADAPTERS', sub: 'Rank Decomposition (ΔW)' },
  { id: 'base', label: 'BASE LLM', sub: 'Qwen 1.5 0.5B' },
  { id: 'output', label: 'OUTPUT', sub: 'Model Response' },
];

const ArchitectureVisualizer: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-bg-primary items-center py-6">
      <div className="section-heading text-text-muted mb-auto">ARCHITECTURE VISUALIZER</div>
      
      <div className="relative flex flex-row items-center justify-center gap-12 w-full px-12 mb-auto">
        {/* SVG Connections Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4A4A4A" />
            </marker>
          </defs>
          
          {/* Main flow lines */}
          {NODES.slice(0, -1).map((_, i) => (
            <motion.path
                key={i}
                d={`M ${120 + i * 200} 50 L ${280 + i * 200} 50`}
                stroke="#4A4A4A"
                strokeWidth="1"
                fill="none"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.2 }}
            />
          ))}

          {/* Feedback loop */}
          <path 
            d="M 940 80 C 940 180, 100 180, 100 80" 
            stroke="#4A4A4A" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            fill="none" 
            markerEnd="url(#arrowhead)"
          />

          {/* Glowing Dot Animation */}
          <circle r="3" fill="#FFFFFF">
            <animateMotion 
              dur="6s" 
              repeatCount="indefinite" 
              path="M 120 50 L 920 50 C 920 180, 100 180, 100 80 L 100 50"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>

        {NODES.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "z-10 w-[180px] h-[100px] bg-bg-secondary border border-border-standard rounded-md flex flex-col items-center justify-center p-4",
              "transition-all duration-500 hover:border-text-primary group"
            )}
            style={{ 
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                flexShrink: 0
            }}
          >
            <div className="section-heading text-xs text-text-primary mb-2 text-center group-hover:text-white transition-colors">
              {node.label}
            </div>
            <div className="tiny-metadata text-[9px] text-text-muted text-center leading-tight">
              {node.sub}
            </div>
            
            {/* Active flow indicator */}
            <div className="mt-4 w-full h-[1px] bg-border-standard group-hover:bg-text-primary transition-colors overflow-hidden">
                <motion.div 
                    className="w-1/2 h-full bg-white opacity-20"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-12 text-text-disabled tiny-metadata mb-8">
        <div className="flex items-center gap-2">
            <div className="w-8 h-[1px] bg-white opacity-40" />
            <span>ACTIVE FLOW</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-8 h-[1px] border-b border-dashed border-white opacity-40" />
            <span>FEEDBACK / CONTEXT</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureVisualizer;
