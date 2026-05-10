import React from 'react';

const DecorationLayer: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 32px Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 vignette opacity-100" />
      
      {/* Complex Geometry */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="micro-dots" x="0" y="0" width="128" height="128" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.5" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#micro-dots)" />
        
        {/* Wireframe Rectangles */}
        <rect x="5%" y="10%" width="120" height="120" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <rect x="85%" y="60%" width="180" height="40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <rect x="10%" y="75%" width="60" height="160" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Corner Brackets Geometry */}
        <path d="M 40 40 L 72 40 L 40 72 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 1400 100 L 1400 132 L 1368 132" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 100 900 L 132 900 L 132 868" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        
        {/* Node dots */}
        <circle cx="20%" cy="30%" r="2" fill="#FFFFFF" />
        <circle cx="80%" cy="15%" r="2" fill="#FFFFFF" />
        <circle cx="45%" cy="85%" r="2" fill="#FFFFFF" />
      </svg>
      
      {/* Primary UI Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/10" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-white/10" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-white/10" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/10" />
    </div>
  );
};

export default DecorationLayer;
