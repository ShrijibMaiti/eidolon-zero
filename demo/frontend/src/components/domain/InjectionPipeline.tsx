import React from 'react';
import { PIPELINE_STEPS } from '@/src/data/mockData';
import { cn } from '@/src/lib/utils';

const InjectionPipeline: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="section-heading text-text-primary">INJECTION PIPELINE</h3>
      <div className="flex flex-col relative gap-8 pl-4">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-[1px] bg-border-soft" />

        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.id} className="flex items-start gap-8 group">
            <div className={cn(
                "z-10 w-7 h-7 flex items-center justify-center border bg-bg-primary section-heading text-[10px] transition-colors",
                i === 0 ? "border-text-primary text-text-primary" : "border-border-standard text-text-disabled group-hover:border-text-secondary"
            )}>
              {step.id}
            </div>
            <div className="flex flex-col gap-1 pt-0.5">
              <span className="section-heading text-[12px]">{step.title}</span>
              <span className="tiny-metadata text-text-muted">{step.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InjectionPipeline;
