import React from 'react';

const STATS = [
  { label: 'RANK (r)', value: '16' },
  { label: 'TARGET LAYERS', value: '32 / 32', sub: 'ALL' },
  { label: 'ADAPTER SIZE', value: '24.38 MB' },
  { label: 'DTYPE', value: 'FP16' },
  { label: 'SCALE (α)', value: '32.0' },
  { label: 'TARGET MODULES', value: 'q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, lm_head' },
];

const LoRAStats: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="section-heading text-text-primary">LORA MATRIX GENERATION STATS</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border-soft border border-border-soft overflow-hidden">
        {STATS.map((stat, i) => (
          <div 
            key={i} 
            className="bg-bg-primary p-6 flex flex-col gap-3 min-h-[140px]"
          >
            <span className="technical-label text-text-muted">{stat.label}</span>
            <div className="flex flex-col gap-1">
                <span className="major-heading text-text-primary uppercase">{stat.value}</span>
                {stat.sub && <span className="tiny-metadata text-text-disabled">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoRAStats;
