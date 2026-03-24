
import React, { memo, useState } from 'react';
import { RegionMode, Partner } from '../types';
import PartnerBadge from './PartnerBadge';

interface PartnerCardProps {
  partner: Partner;
  mode: RegionMode;
  hideImage?: boolean;
}

const VerifiedBadge = memo(({ isCompact }: { isCompact?: boolean }) => (
  <div className={`absolute ${isCompact ? 'top-2 right-2' : 'top-4 right-4'} z-30 animate-pulse`}>
    <div className={`relative ${isCompact ? 'w-12 h-12' : 'w-20 h-20'} flex items-center justify-center`}>
      {/* Outer Rotating Glow */}
      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-spin-slow"></div>
      
      {/* Redesigned Premium Badge - Scaled for context */}
      <PartnerBadge 
        size={isCompact ? 48 : 72} 
        className="drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
      />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  </div>
));

const PartnerCard: React.FC<PartnerCardProps> = memo(({ partner, mode, hideImage = false }) => {
  const [showPolicy, setShowPolicy] = useState(false);
  const isRTL = mode !== RegionMode.WESTERN;
  
  const contactText = {
    [RegionMode.WESTERN]: "Request Service",
    [RegionMode.BADINAN]: "داخوازا خزمەتگۆزاریێ",
    [RegionMode.SORANI]: "داوای خزمەتگوزاری بکە",
    [RegionMode.ARABIC]: "طلب الخدمة"
  }[mode];

  const whatsappUrl = partner.contact.whatsapp_link;

  const profileUrl = partner.images?.profile;
  const displayImage = (profileUrl && typeof profileUrl === 'string' && profileUrl.startsWith('http')) 
    ? profileUrl 
    : "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className={`relative w-full ${hideImage ? 'rounded-3xl' : 'aspect-[4/5.5] rounded-[2.5rem]'} overflow-hidden group shadow-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md`}>
      {!hideImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={displayImage} 
            alt={partner.business_name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        </div>
      )}

      {partner.is_verified && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {!hideImage && (
            <>
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-2xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent mix-blend-overlay opacity-50" />
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-[scan_8s_linear_infinite]" />
            </>
          )}

          <VerifiedBadge isCompact={hideImage} />
        </div>
      )}

      <div className={`${hideImage ? 'relative p-6 pr-14' : 'absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex flex-col justify-end p-8'}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          
          {partner.distance !== undefined && (
             <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-tighter mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <span className="animate-pulse">📍</span>
                <span>{partner.distance.toFixed(1)} km away</span>
             </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xl font-black text-white leading-tight tracking-tight">
              {partner.business_name}
            </h4>
          </div>
          
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            {partner.location.city}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {partner.specialties.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                {s}
              </span>
            ))}
          </div>

          {partner.policy?.fair_price_guarantee && (
            <div 
              className={`mb-5 p-3.5 rounded-xl transition-all cursor-help border ${showPolicy ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'}`}
              onClick={() => setShowPolicy(!showPolicy)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🛡️</span>
                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.15em]">Fair Price Guarantee</span>
                </div>
                <div className="text-[8px] text-emerald-500/60">
                  {showPolicy ? '▲' : '▼'}
                </div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${showPolicy ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <p className="text-[9px] text-slate-400 leading-relaxed italic font-medium pt-2 border-t border-emerald-500/10">
                  {partner.policy.description}
                </p>
              </div>
            </div>
          )}

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_20px_rgba(5,150,105,0.3)] group/btn font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.438-9.89 9.886-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.982zm11.387-5.464c-.301-.15-1.779-.879-2.053-.979-.275-.1-.475-.15-.675.15-.199.299-.775.979-.949 1.178-.173.199-.349.224-.648.075-.299-.15-1.265-.467-2.41-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.462.13-.611.135-.133.299-.349.448-.524.15-.174.199-.299.299-.499.1-.2.05-.374-.025-.524-.075-.15-.675-1.624-.924-2.223-.244-.585-.491-.507-.675-.516-.174-.008-.374-.01-.574-.01s-.524.075-.798.374c-.275.3-1.047 1.022-1.047 2.492 0 1.47 1.071 2.89 1.221 3.09.15.199 2.107 3.217 5.104 4.512.713.308 1.269.491 1.703.629.716.227 1.368.195 1.883.118.574-.085 1.779-.726 2.028-1.422.25-.697.25-1.296.175-1.422-.075-.125-.275-.199-.575-.349z"/>
            </svg>
            <span>{contactText}</span>
          </a>
        </div>
      </div>

      {!hideImage && (
        <style>{`
          @keyframes scan {
            0% { top: -10%; }
            100% { top: 110%; }
          }
        `}</style>
      )}
    </div>
  );
});

export default PartnerCard;
