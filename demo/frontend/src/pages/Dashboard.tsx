import React from 'react';
import DomainMatrix from '../components/dashboard/DomainMatrix';
import ArchitectureVisualizer from '../components/dashboard/ArchitectureVisualizer';
import TelemetrySidebar from '../components/dashboard/TelemetrySidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-row overflow-hidden border-t border-border-soft">
      {/* 24% Left: Domain Matrix */}
      <div className="w-[24%] h-full border-right border-border-soft">
        <DomainMatrix />
      </div>

      {/* 52% Center: Architecture Visualizer */}
      <div className="w-[52%] h-full border-x border-border-soft overflow-hidden">
        <ArchitectureVisualizer />
      </div>

      {/* 24% Right: Telemetry Sidebar */}
      <div className="w-[24%] h-full">
        <TelemetrySidebar />
      </div>
    </div>
  );
};

export default Dashboard;
