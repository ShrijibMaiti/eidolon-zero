import React from 'react';
import { useDomain } from '../context/DomainContext';
import EmbeddingHeatmap from '../components/domain/EmbeddingHeatmap';
import LoRAStats from '../components/domain/LoRAStats';
import InjectionPipeline from '../components/domain/InjectionPipeline';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DomainDetail: React.FC = () => {
  const { activeDomain } = useDomain();
  const navigate = useNavigate();

  return (
    <div className="h-full w-full overflow-y-auto bg-bg-primary custom-scrollbar flex flex-col p-10 gap-12">
      {/* Top Nav */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 technical-label text-text-muted hover:text-text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Domain Detail</span>
        </button>

        <button className="border border-border-standard px-4 py-2 flex items-center gap-4 technical-label text-text-secondary hover:border-text-disabled transition-colors">
            <span>Switch Domain</span>
            <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-6">
        <h1 className="hero-text text-[64px] tracking-[0.04em]">
          {activeDomain.toUpperCase()}
        </h1>
        <div className="bg-bg-tertiary border border-accent-green px-3 py-1 rounded-sm mt-3">
          <span className="tiny-metadata text-accent-green font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-3">
          <EmbeddingHeatmap />
        </div>
        
        <div className="xl:col-span-2">
          <LoRAStats />
        </div>

        <div className="xl:col-span-1">
          <InjectionPipeline />
        </div>
      </div>
    </div>
  );
};

export default DomainDetail;
