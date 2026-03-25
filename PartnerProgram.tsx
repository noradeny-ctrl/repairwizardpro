import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import PartnerBadge from './components/PartnerBadge';

const PartnerProgram = memo(() => {
  const { t } = useTranslation();
  return (
    <div className="mt-12 bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <PartnerBadge size={100} />
      </div>
      <h3 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-4">
        {t('common.verified_partner_program')}
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-6">
        {t('common.join_network_desc')}
      </p>
      <a 
        href="mailto:support@repairwizard.net" 
        className="text-white text-xs font-bold border-b border-cyan-500/40 pb-1 hover:text-cyan-400 transition-colors"
      >
        {t('common.contact_support')}
      </a>
    </div>
  );
});

export default PartnerProgram;
