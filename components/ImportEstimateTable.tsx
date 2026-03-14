import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ship, Truck, Globe, CheckCircle2, DollarSign, MessageCircle } from 'lucide-react';
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

  const whatsappLink = "https://wa.me/9647501234567?text=" + encodeURIComponent(
    `Hello Repair Wizard, I am interested in importing a vehicle. \nVIN: ${vinData?.vin || 'N/A'}\nVehicle: ${vinData?.year || ''} ${vinData?.make || ''} ${vinData?.model || ''}`
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 border border-cyan-500/30 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-cyan-900/20"
    >
      <div className="flex items-center gap-3 mb-2">
        <Ship className="text-cyan-400 w-6 h-6" />
        <h3 className="font-orbitron text-sm font-bold text-cyan-400 uppercase tracking-widest">Wizard Direct Import Estimate</h3>
      </div>

      {vinData && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle</p>
            <p className="text-sm font-bold text-white">{vinData.year} {vinData.make} {vinData.model}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VIN</p>
            <p className="text-sm font-mono text-cyan-400">{vinData.vin}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Truck size={14} /> USA Inland Towing</span>
          <span className="font-mono text-white">${inlandTowing}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Ship size={14} /> Ocean Freight (Mersin)</span>
          <span className="font-mono text-white">${oceanFreight}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><Globe size={14} /> Transit to Zakho</span>
          <span className="font-mono text-white">${transitZakho}</span>
        </div>
        <div className="flex justify-between text-xs py-2 border-b border-white/5">
          <span className="text-slate-400 flex items-center gap-2"><CheckCircle2 size={14} /> KRG Customs (7%)</span>
          <span className="font-mono text-white">${krgCustoms.toFixed(0)}</span>
        </div>
        
        <div className="mt-6 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">Total Import Overhead</p>
          <p className="font-orbitron text-4xl font-black text-white tracking-tighter">
            ${totalImportCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest">*Excludes Auction Bid Price</p>
        </div>
      </div>

      <a 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
      >
        <MessageCircle size={20} />
        <span className="font-black text-xs uppercase tracking-widest">Contact Import Agent</span>
      </a>
    </motion.div>
  );
};

export default ImportEstimateTable;
