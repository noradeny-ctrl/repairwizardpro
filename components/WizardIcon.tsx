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
      
      <pattern id="tech-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00F0FF" strokeWidth="0.2" strokeOpacity="0.2" />
      </pattern>
      <linearGradient id="paint-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
        <stop offset="30%" stopColor="rgba(255, 255, 255, 0.1)" />
        <stop offset="70%" stopColor="rgba(0, 0, 0, 0.2)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0.4)" />
      </linearGradient>

      <radialGradient id="lens-flare" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
        <stop offset="20%" stopColor="#00F0FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="ground-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="black" stopOpacity="0.6" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* Hexagonal Tech-Crest Shield - Beveled Physical Look */}
    <g filter="url(#master-bloom)">
      {/* Outer Rim */}
      <path 
        d="M100 8L182 49V151L100 192L18 151V49L100 8Z" 
        fill="#1a1a1a" 
      />
      {/* Main Shield */}
      <path 
        d="M100 10L180 50V150L100 190L20 150V50L100 10Z" 
        stroke="url(#gold-master)" 
        strokeWidth="6" 
        fill="rgba(10, 14, 20, 0.9)"
        strokeLinejoin="round"
      />
      {/* Tech Grid Background */}
      <path 
        d="M100 10L180 50V150L100 190L20 150V50L100 10Z" 
        fill="url(#tech-grid)"
      />
      {/* Inner Bevel */}
      <path 
        d="M100 14L176 52V148L100 186L24 148V52L100 14Z" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeOpacity="0.1"
        fill="none"
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

    {/* Ground Reflection & Shadow */}
    <ellipse cx="100" cy="195" rx="70" ry="10" fill="url(#ground-shadow)" />
    <g opacity="0.3">
      <ellipse cx="100" cy="195" rx="60" ry="8" fill="url(#cyan-master)" filter="blur(10px)" />
    </g>

    {/* Majestic Sun Burst (Background) */}
    <g filter="url(#master-bloom)" opacity="0.8">
      {/* Central Glow */}
      <circle cx="100" cy="120" r="40" fill="url(#sun-burst)" />
      {/* Radiating Sun Rays */}
      <g stroke="#FEB109" strokeWidth="0.5" strokeOpacity="0.5">
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

    {/* Hyper-Realistic Tesla-Style Front Silhouette */}
    <g filter="url(#master-bloom)" opacity="0.95">
      {/* Upper Body & Roofline - Sleeker Tesla Curve */}
      <path 
        d="M50 135C50 135 60 100 100 100C140 100 150 135 150 135" 
        stroke="url(#cyan-master)" 
        strokeWidth="2" 
        fill="none"
        strokeLinecap="round"
      />
      {/* Windshield & Pillars - Realistic Glass Effect */}
      <path 
        d="M58 135C58 135 68 108 100 108C132 108 142 135 142 135" 
        fill="url(#glass-gradient)" 
        stroke="url(#cyan-master)" 
        strokeWidth="1"
      />
      <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(0, 240, 255, 0.2)" />
        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
        <stop offset="100%" stopColor="rgba(0, 240, 255, 0.1)" />
      </linearGradient>
      
      {/* Main Front Body Panel - Smooth Tesla Paint */}
      <path 
        d="M35 170C35 170 38 135 50 135H150C162 135 165 170 165 170" 
        fill="url(#cyan-master)" 
      />
      <path 
        d="M35 170C35 170 38 135 50 135H150C162 135 165 170 165 170" 
        fill="url(#paint-reflection)" 
      />
      
      {/* Hood Lines - Minimalist Tesla Creases */}
      <path d="M75 135L85 155" stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
      <path d="M125 135L115 155" stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />

      {/* Kurdish Flag Emblem on Hood - 3D Badge Look */}
      <g transform="translate(100, 155)">
        {/* Badge Rim (Chrome) */}
        <circle r="6" fill="url(#gold-master)" />
        <circle r="5.2" fill="#111" />
        {/* Flag Base (Circle) */}
        <circle r="5" fill="white" />
        <clipPath id="flag-clip-3d">
          <circle r="5" />
        </clipPath>
        <g clipPath="url(#flag-clip-3d)">
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
          {/* Badge Reflection */}
          <path d="M-4 -4C-4 -4 -2 -5 2 -3" stroke="white" strokeWidth="0.5" strokeOpacity="0.6" fill="none" />
        </g>
      </g>

      {/* Tesla-Style Sleek LED Headlights */}
      <g>
        {/* Left Headlight */}
        <path 
          d="M40 145C40 145 55 140 80 148L78 152C78 152 55 145 42 150Z" 
          fill="#050505" 
          stroke="url(#cyan-master)" 
          strokeWidth="0.5" 
        />
        <path 
          d="M45 147C45 147 60 143 75 149" 
          stroke="#00F0FF" 
          strokeWidth="1.5" 
          fill="none" 
          filter="url(#master-bloom)" 
        />
        <circle cx="50" cy="147" r="1" fill="white" filter="url(#master-bloom)" />
        
        {/* Right Headlight */}
        <path 
          d="M160 145C160 145 145 140 120 148L122 152C122 152 145 145 158 150Z" 
          fill="#050505" 
          stroke="url(#cyan-master)" 
          strokeWidth="0.5" 
        />
        <path 
          d="M155 147C155 147 140 143 125 149" 
          stroke="#00F0FF" 
          strokeWidth="1.5" 
          fill="none" 
          filter="url(#master-bloom)" 
        />
        <circle cx="150" cy="147" r="1" fill="white" filter="url(#master-bloom)" />
      </g>

      {/* Lower Bumper & Aggressive Air Intakes */}
      <path d="M40 165H160V180C160 185 155 190 150 190H50C45 190 40 185 40 180V165Z" fill="url(#cyan-master)" fillOpacity="0.2" />
      {/* Side Intakes */}
      <path d="M45 170H70V182C70 182 45 182 45 175V170Z" fill="#000" fillOpacity="0.8" stroke="url(#cyan-master)" strokeWidth="0.5" />
      <path d="M155 170H130V182C130 182 155 182 155 175V170Z" fill="#000" fillOpacity="0.8" stroke="url(#cyan-master)" strokeWidth="0.5" />
      {/* Center Intake */}
      <rect x="78" y="172" width="44" height="12" rx="3" fill="#000" fillOpacity="0.8" stroke="url(#cyan-master)" strokeWidth="0.5" />
      
      {/* Front Splitter - Carbon Fiber Look */}
      <path d="M35 190H165V194H35V190Z" fill="#111" stroke="url(#cyan-master)" strokeWidth="0.5" />
      <path d="M35 191H165" stroke="white" strokeWidth="0.2" strokeOpacity="0.2" />
      
      {/* Tires/Wheels (Peeking from bottom) */}
      <rect x="42" y="180" width="15" height="10" fill="#111" />
      <rect x="143" y="180" width="15" height="10" fill="#111" />
    </g>
  </svg>
);

export default WizardIcon;
