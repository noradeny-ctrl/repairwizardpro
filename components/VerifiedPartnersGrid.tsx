
import React from 'react';
import { ShieldCheck, ExternalLink, Award, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const VerifiedPartnersGrid: React.FC = () => {
  const { t } = useTranslation();

  const PARTNERS = [
    {
      name: 'Copart Elite',
      category: t('common.auction_network'),
      icon: <Globe className="text-cyan-400" size={20} />,
      description: t('common.copart_desc'),
      status: t('common.verified'),
      color: 'cyan'
    },
    {
      name: 'IAAI Premium',
      category: t('common.inventory_source'),
      icon: <Zap className="text-emerald-400" size={20} />,
      description: t('common.iaai_desc'),
      status: t('common.active'),
      color: 'emerald'
    },
    {
      name: 'MBUSA Technical',
      category: t('common.oem_support'),
      icon: <Award className="text-indigo-400" size={20} />,
      description: t('common.mbusa_desc'),
      status: t('common.verified'),
      color: 'indigo'
    },
    {
      name: 'Carfax Audit',
      category: t('common.history_verification'),
      icon: <ShieldCheck className="text-blue-400" size={20} />,
      description: t('common.carfax_desc'),
      status: t('common.verified'),
      color: 'blue'
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500 rounded-full" />
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white uppercase">
            {t('common.elite_partner_network')}
          </h3>
        </div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {t('common.global_integration')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PARTNERS.map((partner, index) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${partner.color}-500/5 blur-[40px] group-hover:bg-${partner.color}-500/10 transition-all`} />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={`p-3 bg-${partner.color}-500/10 rounded-2xl border border-${partner.color}-500/20`}>
                {partner.icon}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-full border border-white/5">
                <div className={`w-1 h-1 rounded-full bg-${partner.color}-400 animate-pulse`} />
                <span className={`text-[8px] font-black text-${partner.color}-400 uppercase tracking-widest`}>
                  {partner.status}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {partner.category}
              </p>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {partner.name}
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                {partner.description}
              </p>
              
              <div className="flex items-center gap-2 text-[9px] font-black text-cyan-500/60 group-hover:text-cyan-400 uppercase tracking-widest transition-colors">
                <span>{t('common.view_integration')}</span>
                <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-cyan-500/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <ShieldCheck size={16} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">{t('common.become_partner')}</p>
            <p className="text-[8px] text-slate-500 uppercase font-bold">{t('common.join_elite_network')}</p>
          </div>
        </div>
        <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
      </div>
    </div>
  );
};
