import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ship, Truck, Globe, CheckCircle2, DollarSign, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImportEstimateTableProps {
  vinData?: {
    vin: string;
    make: string;
    model: string;
    year: string;
  };
  marketValue?: number;
}

const ImportEstimateTable: React.FC<ImportEstimateTableProps> = ({ vinData, marketValue = 0 }) => {
  const { t } = useTranslation();

  const inlandTowing = 500;
  const oceanFreight = 1200;
  const transitZakho = 400;
  const krgCustoms = marketValue * 0.07;
  const totalImportCost = inlandTowing + oceanFreight + transitZakho + krgCustoms;

  const whatsappLink = "https://wa.me/16153392046?text=" + encodeURIComponent(
    `Hello Repair Wizard, I would like to get the FULL HISTORY REPORT for this vehicle.\nVIN: ${vinData?.vin || 'N/A'}\nVehicle: ${vinData?.year || ''} ${vinData?.make || ''} ${vinData?.model || ''}`
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 border border-cyan-500/30 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-cyan-900/20"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Ship className="text-cyan-400 w-6 h-6" />
          <h3 className="font-orbitron text-sm font-bold text-cyan-400 uppercase tracking-widest">{t('import_estimate.title')}</h3>
        </div>
        <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
          <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{t('import_estimate.partial_data')}</span>
        </div>
      </div>

      {vinData && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('import_estimate.vehicle')}</p>
            <p className="text-sm font-bold text-white">{vinData.year} {vinData.make} {vinData.model}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('import_estimate.vin')}</p>
            <p className="text-sm font-mono text-cyan-400">{vinData.vin}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Truck size={14} /> {t('import_estimate.inland_towing')}</span>
          <span className="font-mono text-white">${inlandTowing}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Ship size={14} /> {t('import_estimate.ocean_freight')}</span>
          <span className="font-mono text-white">${oceanFreight}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Globe size={14} /> {t('import_estimate.transit_zakho')}</span>
          <span className="font-mono text-white">${transitZakho}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><CheckCircle2 size={14} /> {t('import_estimate.krg_customs_percent')}</span>
          <span className="font-mono text-white">${krgCustoms.toFixed(0)}</span>
        </div>

        <div className="pt-2">
          <a 
            href="https://customs.gov.krd/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
          >
            <ExternalLink size={12} />
            {t('import_estimate.asycuda_portal')}
          </a>
          <p className="text-[9px] text-slate-500 mt-2 leading-relaxed italic">
            {t('import_estimate.estimate_disclaimer')}
          </p>
        </div>
        
        <div className="mt-6 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">{t('import_estimate.total_overhead')}</p>
          <p className="font-orbitron text-4xl font-black text-white tracking-tighter">
            ${totalImportCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest">{t('import_estimate.exclude_bid')}</p>
        </div>
      </div>

      {/* Full Report Checklist */}
      <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] space-y-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('import_estimate.full_report_includes')}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            t('import_estimate.accident_history'),
            t('import_estimate.title_brand_check'),
            t('import_estimate.auction_photos'),
            t('import_estimate.odometer_records'),
            t('import_estimate.recall_status'),
            t('import_estimate.ownership_history')
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-cyan-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <a 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
      >
        <MessageCircle size={20} />
        <span className="font-black text-xs uppercase tracking-widest">{t('import_estimate.get_full_report')}</span>
      </a>
    </motion.div>
  );
};

export default ImportEstimateTable;
