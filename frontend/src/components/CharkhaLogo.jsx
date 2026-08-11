import React from 'react';

export default function CharkhaLogo({ size = 38, className = "" }) {
  return (
    <div 
      className={`relative flex items-center justify-center bg-white rounded-full p-1.5 shadow-md border border-amber-100 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full text-terracotta"
      >
        {/* Base Stand */}
        <path d="M8 52H56M16 52L24 44H40L48 52M20 44V36M44 44V36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Spinning Wheel */}
        <g className="animate-spin" style={{ transformOrigin: '22px 28px', animationDuration: '8s' }}>
          <circle cx="22" cy="28" r="16" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="22" cy="28" r="3" fill="currentColor" />
          {/* Spokes */}
          <line x1="22" y1="12" x2="22" y2="44" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="28" x2="38" y2="28" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.7" y1="16.7" x2="33.3" y2="39.3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.7" y1="39.3" x2="33.3" y2="16.7" stroke="currentColor" strokeWidth="1.5" />
        </g>

        {/* Small Spindle Wheel & Thread */}
        <circle cx="48" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="48" cy="24" r="1.5" fill="currentColor" />
        {/* Connecting Yarn Thread */}
        <path d="M22 12L48 18M22 44L48 30" stroke="#D4A359" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
