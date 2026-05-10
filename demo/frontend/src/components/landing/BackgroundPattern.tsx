import React from 'react';

const BackgroundPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />
      
      {/* Decorative SVG elements */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="128" height="128" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        
        {/* Scattered Brackets & Rects */}
        <path d="M 100 100 L 132 100 L 132 132" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 800 200 L 800 168 L 768 168" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 200 600 L 168 600 L 168 568" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 1200 800 L 1232 800 L 1232 832" fill="none" stroke="#FFFFFF" strokeWidth="1" />
        
        <rect x="400" y="300" width="64" height="64" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" />
        <rect x="900" y="500" width="128" height="32" fill="none" stroke="#FFFFFF" strokeWidth="1" />
      </svg>

      {/* Radial Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, #050505 100%)'
        }}
      />
    </div>
  );
};

export default BackgroundPattern;
