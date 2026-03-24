
import React, { memo } from 'react';

const WizardIcon: React.FC<{ size?: number; className?: string }> = memo(({ size = 120, className = "" }) => {
  return (
    <div 
      className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size,
        userSelect: 'none'
      }}
    >
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* High-quality glow filter */}
            <filter id="optiGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bloom for eyes */}
            <filter id="eyeBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="40%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="chiselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="neonGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#39ff14" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>

          {/* Background Gear - STATIC */}
          <g transform="translate(100, 105)">
            <circle cx="0" cy="0" r="70" fill="#0a0f1e" stroke="#1e293b" strokeWidth="3" />
            {[...Array(12)].map((_, i) => (
              <rect 
                key={i}
                x="-12" y="-80" width="24" height="12" 
                fill="#1e293b" 
                rx="2"
                transform={`rotate(${i * 30})`}
              />
            ))}
            <circle cx="0" cy="0" r="56" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 6" />
          </g>

          {/* Metallic 'W' - Grounded and Static */}
          <g transform="translate(100, 160)">
            <path 
              d="M-45 -20 L-20 25 L0 -5 L20 25 L45 -20" 
              stroke="#0f172a" 
              strokeWidth="18" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            <path 
              d="M-45 -20 L-20 25 L0 -5 L20 25 L45 -20" 
              stroke="url(#ironGrad)" 
              strokeWidth="12" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            {/* Chisel effect highlight */}
            <path 
              d="M-45 -20 L-20 25 L0 -5 L20 25 L45 -20" 
              stroke="url(#chiselGrad)" 
              strokeWidth="12" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
              fill="none"
            />
          </g>

          {/* Owl Character - STATIC */}
          <g transform="translate(100, 85)">
            {/* Body */}
            <path 
              d="M-34 10 C-45 45 -25 80 0 80 C25 80 45 45 34 10 Z" 
              fill="#0f172a" 
              stroke="#334155" 
              strokeWidth="2" 
            />

            {/* Wing Detail */}
            <path 
              d="M-34 5 Q-65 35 -40 75" 
              fill="none" 
              stroke="url(#ironGrad)" 
              strokeWidth="8" 
              strokeLinecap="round" 
            />
            
            {/* Mini Gears for Mechanical Vibe */}
            <g fill="#1e293b" stroke="#475569" strokeWidth="1">
              <circle cx="-28" cy="35" r="8" />
              <circle cx="-18" cy="55" r="6" />
              <circle cx="-32" cy="50" r="4" />
            </g>

            {/* Glow Accents - STATIC */}
            <g filter="url(#optiGlow)">
              <path d="M-38 70 Q-55 90 -50 115" stroke="url(#neonGreen)" strokeWidth="3" strokeLinecap="round" />
              <path d="M-32 78 Q-42 100 -32 122" stroke="url(#neonGreen)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <circle cx="-50" cy="115" r="2" fill="#39ff14" />
              <circle cx="-32" cy="122" r="1.5" fill="#39ff14" />
            </g>

            {/* Head */}
            <path 
              d="M-40 -15 Q-40 -40 -18 -48 L0 -35 L18 -48 Q40 -40 40 -15 Q40 12 0 20 Q-40 12 -40 -15" 
              fill="#0f172a" 
              stroke="#475569" 
              strokeWidth="2.5" 
            />

            {/* Mechanical Ears */}
            <path d="M-30 -42 L-48 -75" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <path d="M-30 -42 L-48 -75" stroke="#39ff14" strokeWidth="1.5" strokeLinecap="round" filter="url(#optiGlow)" />
            <path d="M30 -42 L48 -75" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <path d="M30 -42 L48 -75" stroke="#39ff14" strokeWidth="1.5" strokeLinecap="round" filter="url(#optiGlow)" />

            {/* Eyes - The main focus */}
            <g filter="url(#eyeBloom)">
              <circle cx="-20" cy="-18" r="10" fill="#000" stroke="#39ff14" strokeWidth="2.5" />
              <circle cx="-20" cy="-18" r="4" fill="#39ff14" />
              
              <circle cx="20" cy="-18" r="10" fill="#000" stroke="#39ff14" strokeWidth="2.5" />
              <circle cx="20" cy="-18" r="4" fill="#39ff14" />

              {/* Brow lines */}
              <path d="M-35 -35 Q-20 -42 -8 -35" stroke="#39ff14" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M35 -35 Q20 -42 8 -35" stroke="#39ff14" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Beak */}
            <path d="M-5 -2 L0 10 L5 -2 Z" fill="#475569" />
          </g>

          {/* Gripping Claws */}
          <g transform="translate(100, 160)" stroke="#1e293b" strokeWidth="5" strokeLinecap="round">
            <path d="M-12 -8 L-15 4" stroke="#475569" />
            <path d="M-6 -8 L-6 6" stroke="#475569" />
            <path d="M12 -8 L15 4" stroke="#475569" />
            <path d="M6 -8 L6 6" stroke="#475569" />
          </g>
        </svg>
      </div>
    </div>
  );
});

export default WizardIcon;
