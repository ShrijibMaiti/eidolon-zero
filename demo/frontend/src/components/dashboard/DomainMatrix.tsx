import React from 'react';
import { useDomain } from '@/src/context/DomainContext';
import { DOMAINS } from '@/src/data/mockData';
import { cn } from '@/src/lib/utils';
import * as Icons from 'lucide-react';

// [PHASE 4 WIRING] - Replace X.X with Person 1's IPv4 address!
// Change it to this exactly:
const BASE_URL = "http://localhost:8000";

const DomainMatrix = () => {
  const { activeDomain, setActiveDomain } = useDomain();

  const handleDomainSelect = async (domainId) => {
    // 1. Optimistic UI update (makes the button click feel instant for the demo)
    setActiveDomain(domainId);

    // 2. The critical ping to the FastAPI backend
    try {
      const response = await fetch(`${BASE_URL}/api/domain/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainId }),
      });

      if (!response.ok) {
        console.error(`Backend rejected the request: ${response.status}`);
      } else {
        const data = await response.json();
        console.log(`Ping successful! Backend routed to:`, data);
      }
    } catch (error) {
      // If Person 1's server is down, IP is wrong, or firewall is blocking, it fails here.
      console.error("🚨 FAILED TO FETCH! Check Person 1's IP, Server, and Firewall.", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary overflow-y-auto custom-scrollbar">
      <div className="technical-label text-text-muted px-5 py-4">DOMAIN MATRIX</div>
      <div className="grid grid-cols-2 gap-2 p-5 pt-0">
        {DOMAINS.map((domain) => {
          const IconComponent = (Icons as any)[domain.icon];
          const isActive = activeDomain === domain.id;
          
          return (
            <button
              key={domain.id}
              onClick={() => handleDomainSelect(domain.id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 p-4 border rounded-sm transition-all duration-200",
                isActive 
                  ? "bg-bg-tertiary border-text-primary text-text-primary shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                  : "bg-bg-secondary border-border-standard text-text-disabled hover:border-border-dashed hover:bg-[#0D0D0D]"
              )}
            >
              {IconComponent && (
                <IconComponent 
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                  )} 
                />
              )}
              <span className="technical-label">{domain.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-auto px-5 py-4 border-t border-border-soft flex justify-between items-center bg-bg-secondary">
         <span className="tiny-metadata text-text-disabled">ACTIVE DOMAIN</span>
         <span className="tiny-metadata text-text-primary flex items-center gap-2">
            {activeDomain.toUpperCase()}
            <div className="w-[4px] h-[4px] rounded-full bg-white animate-pulse" />
         </span>
      </div>
    </div>
  );
};

export default DomainMatrix;