import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-6 p-12 border border-border-standard bg-bg-secondary rounded-sm">
        <h2 className="section-heading text-text-muted">SYSTEM SETTINGS</h2>
        <div className="flex flex-col gap-4 w-[320px]">
            <div className="flex justify-between items-center py-3 border-b border-border-soft">
                <span className="tiny-metadata text-text-disabled">API ENDPOINT</span>
                <span className="technical-label text-text-primary">RUNNING</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-soft">
                <span className="tiny-metadata text-text-disabled">VERSION</span>
                <span className="technical-label text-text-primary">v0.8.2-BETA</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-soft">
                <span className="tiny-metadata text-text-disabled">COMPUTE NODE</span>
                <span className="technical-label text-text-primary">NVIDIA A100</span>
            </div>
            <div className="flex justify-between items-center py-3">
                <span className="tiny-metadata text-text-disabled">QUANTIZATION</span>
                <span className="technical-label text-text-primary">4-BIT GGUF</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
