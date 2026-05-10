import React from 'react';

const CornerLabels: React.FC = () => {
  return (
    <>
      <div className="absolute top-8 left-8 technical-label text-text-disabled pointer-events-none">
        EIDOLON:ZERO
      </div>
      <div className="absolute top-8 right-8 technical-label text-text-disabled pointer-events-none">
        DYNAMIC ADAPTATION. REAL-TIME INTELLIGENCE.
      </div>
      <div className="absolute bottom-8 left-8 technical-label text-text-disabled pointer-events-none max-w-[240px]">
        BUILT FOR ENGINEERS. OPTIMIZED FOR COMPUTE.
      </div>
      <div className="absolute bottom-8 right-8 pointer-events-none">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 16 V 32 H 16" stroke="#4F4F4F" strokeWidth="1" />
          <path d="M 32 16 V 0 H 16" stroke="#4F4F4F" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
};

export default CornerLabels;
