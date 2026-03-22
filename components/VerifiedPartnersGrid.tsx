
import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Award, Globe, Zap, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BecomePartnerModal } from './BecomePartnerModal';
import { Partner } from '../types';

interface VerifiedPartnersGridProps {
  livePartners?: Partner[];
}

export const VerifiedPartnersGrid: React.FC<VerifiedPartnersGridProps> = ({ livePartners = [] }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const STATIC_PARTNERS = [
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
        {/* Static Partners */}
        {STATIC_PARTNERS.map((partner, index) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
          >
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

        {/* Live Partners */}
        {livePartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (STATIC_PARTNERS.length + index) * 0.1 }}
            className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[40px] group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ShieldCheck className="text-emerald-400" size={20} />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-full border border-white/5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  {t('common.verified')}
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {partner.specialties[0] || 'Automotive Expert'}
              </p>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {partner.business_name}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-4">
                <MapPin size={10} className="text-slate-500" />
                {partner.location.city}
              </div>
              
              <a 
                href={partner.contact.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-[9px] font-black text-emerald-500 group-hover:text-emerald-400 uppercase tracking-widest transition-colors"
              >
                <span>{t('common.contact_expert', 'Contact Expert')}</span>
                <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsModalOpen(true)}
        className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-cyan-500/40 transition-all overflow-hidden"
      >
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:rotate-12 transition-transform">
            <ShieldCheck size={24} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">{t('common.become_partner')}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t('common.join_elite_network')}</p>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 group-hover:bg-cyan-500 group-hover:text-black transition-all">
          <span className="text-[9px] font-black uppercase tracking-widest">{t('common.apply_now', 'Apply Now')}</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>

      <BecomePartnerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
