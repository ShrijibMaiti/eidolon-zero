import React, { useMemo } from 'react';

const EmbeddingHeatmap: React.FC = () => {
  const bars = useMemo(() => {
    return Array.from({ length: 768 }).map((_, i) => ({
      id: i,
      opacity: 0.1 + Math.random() * 0.9
    }));
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="section-heading text-text-primary text-[11px]">DOMAIN EMBEDDING (768-D)</span>
        <div className="flex items-center gap-4 tiny-metadata text-text-disabled">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#2A2A2A]" /> LOW
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#F5F5F5]" /> HIGH
            </div>
        </div>
      </div>
      
      <div className="h-[56px] w-full flex items-stretch gap-0 bg-bg-secondary border border-border-standard overflow-hidden">
        {bars.map((bar) => (
          <div 
            key={bar.id} 
            className="flex-1" 
            style={{ 
              backgroundColor: '#F5F5F5',
              opacity: bar.opacity
            }} 
          />
        ))}
      </div>

      <div className="flex justify-between items-center w-full px-1">
        <span className="tiny-metadata text-text-disabled">0</span>
        <span className="tiny-metadata text-text-disabled">256</span>
        <span className="tiny-metadata text-text-disabled">512</span>
        <span className="tiny-metadata text-text-disabled">767</span>
      </div>
    </div>
  );
};

export default EmbeddingHeatmap;
