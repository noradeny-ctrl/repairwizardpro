import React from 'react';
import { useTranslation } from 'react-i18next';
import { Partner, RegionMode } from '../types';

interface PartnerCardProps {
  partner: Partner;
  mode: RegionMode;
  hideImage?: boolean;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, mode, hideImage }) => {
  const { t } = useTranslation();
  const isRTL = mode !== RegionMode.WESTERN;

  return (
    <div className={`bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 hover:bg-slate-800/60 transition-all ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{partner.business_name}</h4>
            {partner.is_verified && <span className="text-cyan-400 text-xs">🛡️</span>}
          </div>
          <p className="text-xs text-slate-400">{partner.location.city}</p>
        </div>
        {partner.distance !== undefined && (
          <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-full">
            {partner.distance.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {partner.specialties.slice(0, 3).map((s, i) => (
          <span key={i} className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
            {s}
          </span>
        ))}
      </div>

      <a 
        href={`${partner.contact.whatsapp_link}${partner.contact.whatsapp_link.includes('?') ? '&' : '?'}text=${encodeURIComponent(t('common.whatsapp_message', 'Hello, I found you on RepairWizard and I need help with my car.'))}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
      >
        <span className="text-sm">💬</span>
        <span className="font-black tracking-widest uppercase text-[9px] text-white">{t('common.contact_usta', 'Contact Usta')}</span>
      </a>
    </div>
  );
};

export default PartnerCard;
