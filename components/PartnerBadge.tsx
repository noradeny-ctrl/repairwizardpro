
import React, { memo } from 'react';

const PartnerBadge: React.FC<{ size?: number; className?: string }> = memo(({ size = 80, className = "" }) => {
  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 400 420" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Refined Steel Gradient */}
          <linearGradient id="premiumSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          
          {/* Burnished Gold Gradient */}
          <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="30%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Electric Cyan Neon */}
          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="innerBevel">
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* OUTER LARGE GEAR (STEEL) */}
        <g transform="translate(200, 225)">
          <circle r="145" fill="url(#premiumSteel)" stroke="#0f172a" strokeWidth="2" />
          {[...Array(12)].map((_, i) => (
            <rect 
              key={i}
              x="-28" y="-172" width="56" height="32" 
              fill="url(#premiumSteel)" 
              stroke="#0f172a" 
              strokeWidth="3"
              rx="4"
              transform={`rotate(${i * 30})`}
            />
          ))}
          {/* Texture/Bolt details on outer gear */}
          {[...Array(6)].map((_, i) => (
            <circle 
              key={i} 
              cx="0" cy="-125" r="4" 
              fill="#1e293b" 
              transform={`rotate(${i * 60})`} 
            />
          ))}
        </g>

        {/* MIDDLE GOLD GEAR RING */}
        <g transform="translate(200, 225)">
          <circle r="110" fill="url(#premiumGold)" stroke="#451a03" strokeWidth="2" />
          {[...Array(16)].map((_, i) => (
            <rect 
              key={i}
              x="-12" y="-120" width="24" height="18" 
              fill="url(#premiumGold)" 
              stroke="#451a03" 
              strokeWidth="2"
              rx="2"
              transform={`rotate(${i * 22.5})`}
            />
          ))}
        </g>

        {/* INNER CYAN SEAL */}
        <g transform="translate(200, 225)">
          <circle r="90" fill="#081421" stroke="#22d3ee" strokeWidth="6" filter="url(#badgeGlow)" />
          <circle r="82" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
          
          {/* Circular Text Paths */}
          <path id="textPathTop" d="M-70 -20 A 72 72 0 0 1 70 -20" fill="none" />
          <path id="textPathBottom" d="M-70 30 A 72 72 0 0 0 70 30" fill="none" />
          
          <text className="font-black text-[24px] tracking-[0.1em]" fill="#22d3ee" filter="url(#badgeGlow)">
            <textPath xlinkHref="#textPathTop" startOffset="50%" textAnchor="middle">VERIFIED</textPath>
          </text>
          <text className="font-black text-[24px] tracking-[0.1em]" fill="#22d3ee" filter="url(#badgeGlow)">
            <textPath xlinkHref="#textPathBottom" startOffset="50%" textAnchor="middle">PARTNER</textPath>
          </text>

          {/* CENTRAL 3D CHECKMARK */}
          <g transform="scale(1.1) translate(0, 5)">
            {/* 3D Depth Sides */}
            <path d="M-30 0 L0 30 L50 -25 L50 -20 L0 35 L-30 5 Z" fill="#065f73" />
            <path d="M50 -25 L55 -20 L5 35 L0 30 Z" fill="#0e7490" />
            {/* Top Surface */}
            <path d="M-30 0 L0 30 L50 -30 L40 -40 L0 10 L-20 -10 Z" fill="url(#neonCyan)" stroke="#fff" strokeWidth="1" opacity="0.9" filter="url(#badgeGlow)" />
            {/* Glint on checkmark */}
            <path d="M-20 -5 L0 15 L35 -25" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
          </g>
        </g>

        {/* DECORATIVE MINI GEARS */}
        <g transform="translate(80, 225)">
          <circle r="18" fill="url(#premiumGold)" stroke="#451a03" strokeWidth="1.5" />
          <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#451a03" strokeWidth="2" />
        </g>
        <g transform="translate(320, 225)">
          <circle r="18" fill="url(#premiumGold)" stroke="#451a03" strokeWidth="1.5" />
          <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#451a03" strokeWidth="2" />
        </g>

        {/* OWL MASCOT ON TOP */}
        <g transform="translate(200, 75)">
          {/* Hat Detail */}
          <path d="M-40 0 L-32 -45 L32 -45 L40 0 Z" fill="#111" stroke="#000" strokeWidth="2" />
          <path d="M-50 0 L50 0" stroke="#000" strokeWidth="8" strokeLinecap="round" />
          <circle cx="0" cy="-22" r="10" fill="url(#premiumGold)" stroke="#000" strokeWidth="1" />
          
          {/* Head & Feathers */}
          <path d="M-45 35 Q-45 5 -15 -5 L0 5 L15 -5 Q45 5 45 35 Q45 70 0 80 Q-45 70 -45 35" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          
          {/* Intense Neon Eyes */}
          <g filter="url(#badgeGlow)">
            <circle cx="-22" cy="40" r="14" fill="#000" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="-22" cy="40" r="5" fill="#22d3ee" />
            <circle cx="22" cy="40" r="14" fill="#000" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="22" cy="40" r="5" fill="#22d3ee" />
          </g>
          
          {/* Beak Detail */}
          <path d="M-7 52 L0 68 L7 52 Z" fill="#475569" stroke="#0f172a" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
});

export default PartnerBadge;
