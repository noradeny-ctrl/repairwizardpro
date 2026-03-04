import React from 'react';

const WizardIcon: React.FC<{ size?: number; className?: string }> = ({ size, className = "" }) => (
  <svg 
    width={size || (className.includes('h-') ? undefined : 24)} 
    height={size || (className.includes('h-') ? undefined : 24)} 
    viewBox="0 0 200 220" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Hyper-Realistic Bloom & Depth Filters */}
      <filter id="master-bloom" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" result="blur1" />
        <feGaussianBlur stdDeviation="3" result="blur2" />
        <feGaussianBlur stdDeviation="6" result="blur3" />
        <feMerge>
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      
      <linearGradient id="gold-master" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="20%" stopColor="#FFFACD" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="80%" stopColor="#B8860B" />
        <stop offset="100%" stopColor="#4D3300" />
      </linearGradient>

      <linearGradient id="cyan-master" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F0FF" />
        <stop offset="40%" stopColor="#E0FFFF" />
        <stop offset="60%" stopColor="#00F0FF" />
        <stop offset="100%" stopColor="#003366" />
      </linearGradient>

      <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="white" />
        <stop offset="40%" stopColor="#00F0FF" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="sun-burst" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEB109" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#FEB109" stopOpacity="0.3" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* Hexagonal Tech-Crest Shield */}
    <g filter="url(#master-bloom)">
      <path 
        d="M100 10L180 50V150L100 190L20 150V50L100 10Z" 
        stroke="url(#gold-master)" 
        strokeWidth="6" 
        fill="rgba(10, 14, 20, 0.8)"
        strokeLinejoin="round"
      />
      {/* Glowing Circuitry Patterns on Shield */}
      <g stroke="#FFD700" strokeWidth="1" strokeOpacity="0.4">
        <path d="M40 60H60M140 60H160M40 140H60M140 140H160" />
        <path d="M100 20V40M100 160V180" />
        <circle cx="60" cy="60" r="1.5" fill="#FFD700" />
        <circle cx="140" cy="60" r="1.5" fill="#FFD700" />
        <circle cx="60" cy="140" r="1.5" fill="#FFD700" />
        <circle cx="140" cy="140" r="1.5" fill="#FFD700" />
      </g>
    </g>

    {/* Magic Tech Particles (Wizardry Essence) */}
    <g filter="url(#master-bloom)">
      <circle cx="60" cy="120" r="1" fill="white" className="animate-pulse" />
      <circle cx="140" cy="120" r="1" fill="white" className="animate-pulse" />
      <circle cx="80" cy="110" r="0.8" fill="#00F0FF" />
      <circle cx="120" cy="110" r="0.8" fill="#00F0FF" />
      <circle cx="100" cy="95" r="1.2" fill="white" />
    </g>

    {/* Majestic Sun Burst (Background) */}
    <g filter="url(#master-bloom)" opacity="0.7">
      {/* Central Glow */}
      <circle cx="100" cy="120" r="40" fill="url(#sun-burst)" />
      {/* Radiating Sun Rays */}
      <g stroke="#FEB109" strokeWidth="0.5" strokeOpacity="0.4">
        {[...Array(21)].map((_, i) => (
          <line 
            key={i} 
            x1="100" 
            y1="120" 
            x2={100 + 80 * Math.cos((i * 360 / 21 - 90) * Math.PI / 180)} 
            y2={120 + 80 * Math.sin((i * 360 / 21 - 90) * Math.PI / 180)} 
          />
        ))}
      </g>
    </g>

    {/* Hyper-Realistic BMW Front Silhouette */}
    <g filter="url(#master-bloom)" opacity="0.95">
      {/* Upper Body & Roofline */}
      <path 
        d="M55 130C55 130 65 105 100 105C135 105 145 130 145 130" 
        stroke="url(#cyan-master)" 
        strokeWidth="2" 
        fill="none"
        strokeLinecap="round"
      />
      {/* Windshield & Pillars */}
      <path 
        d="M62 130C62 130 70 112 100 112C130 112 138 130 138 130" 
        fill="rgba(0, 240, 255, 0.1)" 
        stroke="url(#cyan-master)" 
        strokeWidth="1"
      />
      
      {/* Main Front Body Panel */}
      <path 
        d="M40 165C40 165 42 135 55 130H145C158 135 160 165 160 165" 
        fill="url(#cyan-master)" 
        fillOpacity="0.4"
      />
      
      {/* Hood Lines (V-Shape) */}
      <path d="M85 130L92 150M115 130L108 150" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* BMW Kidney Grille - High Detail */}
      <g transform="translate(82, 152)">
        {/* Grille Outlines */}
        <rect x="0" y="0" width="16" height="14" rx="5" stroke="url(#cyan-master)" strokeWidth="1.5" fill="#000" fillOpacity="0.8" />
        <rect x="20" y="0" width="16" height="14" rx="5" stroke="url(#cyan-master)" strokeWidth="1.5" fill="#000" fillOpacity="0.8" />
        {/* Vertical Slats */}
        <path d="M4 3V11M8 3V11M12 3V11" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M24 3V11M28 3V11M32 3V11" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      </g>

      {/* Kurdish Flag Emblem on Hood */}
      <g transform="translate(100, 145)">
        {/* Flag Base (Circle) */}
        <circle r="5" fill="white" stroke="url(#gold-master)" strokeWidth="0.5" />
        <clipPath id="flag-clip">
          <circle r="5" />
        </clipPath>
        <g clipPath="url(#flag-clip)">
          <rect x="-5" y="-5" width="10" height="3.33" fill="#ED2024" /> {/* Red */}
          <rect x="-5" y="-1.67" width="10" height="3.33" fill="white" /> {/* White */}
          <rect x="-5" y="1.66" width="10" height="3.34" fill="#278E43" /> {/* Green */}
          {/* Kurdish Sun (Yellow) */}
          <circle r="1.8" fill="#FEB109" />
          <g stroke="#FEB109" strokeWidth="0.3">
            {[...Array(21)].map((_, i) => (
              <line key={i} x1="0" y1="0" x2="0" y2="-2.5" transform={`rotate(${i * (360 / 21)})`} />
            ))}
          </g>
        </g>
      </g>

      {/* "Angel Eye" Headlights - Multi-Element */}
      <g>
        {/* Left Headlight */}
        <path d="M45 145L75 140L78 150L48 155Z" fill="rgba(0,0,0,0.5)" />
        <circle cx="58" cy="148" r="3" stroke="white" strokeWidth="1" fill="none" filter="url(#master-bloom)" />
        <circle cx="70" cy="145" r="3" stroke="white" strokeWidth="1" fill="none" filter="url(#master-bloom)" />
        {/* Right Headlight */}
        <path d="M155 145L125 140L122 150L152 155Z" fill="rgba(0,0,0,0.5)" />
        <circle cx="142" cy="148" r="3" stroke="white" strokeWidth="1" fill="none" filter="url(#master-bloom)" />
        <circle cx="130" cy="145" r="3" stroke="white" strokeWidth="1" fill="none" filter="url(#master-bloom)" />
      </g>

      {/* Lower Bumper & Air Intakes */}
      <path d="M40 165H160V175C160 180 155 185 150 185H50C45 185 40 180 40 175V165Z" fill="url(#cyan-master)" fillOpacity="0.2" />
      <rect x="50" y="170" width="25" height="10" rx="2" fill="#000" fillOpacity="0.6" />
      <rect x="125" y="170" width="25" height="10" rx="2" fill="#000" fillOpacity="0.6" />
      <rect x="80" y="172" width="40" height="8" rx="2" fill="#000" fillOpacity="0.6" />
      
      {/* Front Splitter */}
      <path d="M35 185H165V188H35V185Z" fill="url(#cyan-master)" />
      
      {/* Tires/Wheels (Peeking from bottom) */}
      <rect x="42" y="180" width="15" height="10" fill="#111" />
      <rect x="143" y="180" width="15" height="10" fill="#111" />
    </g>
  </svg>
);

export default WizardIcon;
