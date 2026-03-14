import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Truck, Calculator, Search, Globe, ChevronRight, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

interface ExportTerminalProps {
  onClose: () => void;
}

const ExportTerminal: React.FC<ExportTerminalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [auctionPrice, setAuctionPrice] = useState<string>('');
  const [vinSearch, setVinSearch] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);

  // Landed Cost Calculation Logic
  const calculations = useMemo(() => {
    const price = parseFloat(auctionPrice) || 0;
    if (price === 0) return null;

    // Standard Tiered Auction Fees (Copart/IAAI Estimate)
    let auctionFees = 0;
    if (price < 500) auctionFees = 150;
    else if (price < 1000) auctionFees = 250;
    else if (price < 2000) auctionFees = 400;
    else if (price < 5000) auctionFees = 600;
    else if (price < 10000) auctionFees = 800;
    else auctionFees = price * 0.08;

    const inlandTowing = 500;
    const oceanFreight = 1200;
    const transitZakho = 400;
    const krgCustoms = price * 0.07;

    const total = price + auctionFees + inlandTowing + oceanFreight + transitZakho + krgCustoms;

    return {
      auctionFees,
      inlandTowing,
      oceanFreight,
      transitZakho,
      krgCustoms,
      total
    };
  }, [auctionPrice]);

  const shippingSteps = [
    { status: t('terminal.steps.us_port'), date: 'March 10, 2026', completed: true, icon: <Truck className="w-5 h-5" /> },
    { status: t('terminal.steps.ocean'), date: 'March 14, 2026', completed: true, icon: <Ship className="w-5 h-5" /> },
    { status: t('terminal.steps.mersin'), date: 'April 02, 2026', completed: false, icon: <Globe className="w-5 h-5" /> },
    { status: t('terminal.steps.zakho'), date: 'April 05, 2026', completed: false, icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#010409] text-slate-100 font-sans overflow-y-auto"
    >
      {/* Cyber Header */}
      <header className="sticky top-0 z-50 bg-[#010409]/80 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-center">
            <Globe className="text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-xs tracking-[0.2em] text-cyan-400 uppercase">{t('terminal.title')}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('terminal.version')}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all"
        >
          ✕
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-slate-900/40 border border-white/5 p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Ship size={200} className="text-cyan-500" />
          </div>
          <div className="relative z-10">
            <h2 className="font-orbitron text-3xl font-black text-white mb-4 tracking-tighter">{t('terminal.hero_title')}</h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {t('terminal.hero_desc')}
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Card */}
          <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="text-emerald-400 w-5 h-5" />
              <h3 className="font-orbitron text-sm font-bold text-emerald-400 uppercase tracking-widest">{t('terminal.calc_title')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('terminal.auction_price')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="number"
                    value={auctionPrice}
                    onChange={(e) => setAuctionPrice(e.target.value)}
                    placeholder={t('terminal.bid_placeholder')}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono focus:border-emerald-500/50 focus:ring-0 transition-all"
                  />
                </div>
              </div>

              {calculations && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-4 border-t border-white/5"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('terminal.auction_fees')}</span>
                    <span className="font-mono text-white">${calculations.auctionFees.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('terminal.inland_towing')}</span>
                    <span className="font-mono text-white">${calculations.inlandTowing}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('terminal.ocean_freight')}</span>
                    <span className="font-mono text-white">${calculations.oceanFreight}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('terminal.transit_zakho')}</span>
                    <span className="font-mono text-white">${calculations.transitZakho}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t('terminal.krg_customs')}</span>
                    <span className="font-mono text-white">${calculations.krgCustoms.toFixed(0)}</span>
                  </div>

                  <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">{t('terminal.total_price')}</p>
                    <p className="font-orbitron text-4xl font-black text-white tracking-tighter">
                      ${calculations.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tracking Card */}
          <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="text-cyan-400 w-5 h-5" />
              <h3 className="font-orbitron text-sm font-bold text-cyan-400 uppercase tracking-widest">{t('terminal.track_title')}</h3>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={vinSearch}
                  onChange={(e) => setVinSearch(e.target.value.toUpperCase())}
                  placeholder={t('terminal.vin_placeholder')}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono text-sm focus:border-cyan-500/50 focus:ring-0 transition-all"
                />
                <button 
                  onClick={() => vinSearch.length === 17 && setIsTracking(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-2xl transition-all active:scale-95"
                >
                  <ChevronRight />
                </button>
              </div>

              {isTracking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800"
                >
                  {shippingSteps.map((step, i) => (
                    <div key={i} className="relative flex gap-6 items-start">
                      <div className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        step.completed 
                          ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                          : 'bg-slate-900 border-white/10 text-slate-600'
                      }`}>
                        {step.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-slate-500'}`}>{step.status}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {!isTracking && (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                  <Search size={48} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">{t('terminal.idle')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex gap-4 items-start">
          <AlertTriangle className="text-cyan-500 shrink-0" size={20} />
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
            {t('terminal.disclaimer')}
          </p>
        </div>
      </main>
    </motion.div>
  );
};

export default ExportTerminal;
