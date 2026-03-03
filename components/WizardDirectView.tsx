import React, { useState, useMemo } from 'react';
import { RegionMode } from '../types';

interface WizardDirectViewProps {
  mode: RegionMode;
  onClose: () => void;
}

const WizardDirectView: React.FC<WizardDirectViewProps> = ({ mode, onClose }) => {
  const [vehiclePrice, setVehiclePrice] = useState<number>(0);
  
  const isRTL = mode !== RegionMode.WESTERN;

  const estimates = useMemo(() => {
    const inland = 500;
    const ocean = 1500;
    const land = 600;
    const wizardFee = 500;
    const dealerFee = 300;
    const customsRate = 0.15;
    const customs = vehiclePrice * customsRate;
    const total = vehiclePrice + inland + ocean + land + customs + wizardFee + dealerFee;
    
    return {
      inland,
      ocean,
      land,
      wizardFee,
      dealerFee,
      customs,
      total
    };
  }, [vehiclePrice]);

  const labels = {
    title: mode === RegionMode.WESTERN ? "🇺🇸 WIZARD DIRECT PORTAL" : "🇺🇸 پۆرتالا ویزارد دایرێکت",
    subtitle: mode === RegionMode.WESTERN ? "USA to Kurdistan Direct Import" : "ژ ئەمریکا بۆ کوردستانێ ب رەنگەکێ راستەوخۆ",
    pricePlaceholder: mode === RegionMode.WESTERN ? "Auction Bid Price ($)" : "بهایێ موزایدێ ($)",
    breakdown: mode === RegionMode.WESTERN ? "COST ESTIMATE BREAKDOWN" : "کۆژمێ خەملاندی",
    inland: mode === RegionMode.WESTERN ? "USA Inland Towing" : "ڤەگوهاستنا ناڤخۆیا ئەمریکا",
    ocean: mode === RegionMode.WESTERN ? "Ocean Freight (Mersin)" : "بارهەلگرا دەریایی (مێرسین)",
    land: mode === RegionMode.WESTERN ? "Land Transit (Zakho)" : "ڤەگوهاستنا وشکانی (زاخۆ)",
    customs: mode === RegionMode.WESTERN ? "KRG Customs (ASYCUDA)" : "گومرکا هەرێمێ (ئاسیکۆدا)",
    wizardFee: mode === RegionMode.WESTERN ? "RepairWizard Service Fee" : "کرێیا خزمەتگۆزاریا ڕێپەیر ویزارد",
    dealerFee: mode === RegionMode.WESTERN ? "Dealer Account Fee" : "کرێیا هەژمارا دیلەر",
    total: mode === RegionMode.WESTERN ? "TOTAL LANDED COST" : "کۆژمێ گشتی",
    contact: mode === RegionMode.WESTERN ? "Contact Import Broker" : "پەیوەندیێ ب برۆکەری بکە",
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0f1e] text-white overflow-hidden animate-modal-enter ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="px-6 pt-12 pb-6 flex justify-between items-center border-b border-white/5 bg-slate-900/80 backdrop-blur-ultra sticky top-0 z-50">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-1">{labels.title}</h2>
          <p className="text-xs text-slate-400 font-bold">{labels.subtitle}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">✕</button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
        <section className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">{labels.pricePlaceholder}</label>
              <input 
                type="number" 
                className="w-full bg-transparent border-b-2 border-slate-700 focus:border-cyan-500 transition-colors text-3xl font-black text-white outline-none py-2"
                placeholder="0"
                value={vehiclePrice || ''}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">{labels.breakdown}</h3>
          
          <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
            {[
              { label: labels.inland, value: estimates.inland, icon: "🚛" },
              { label: labels.ocean, value: estimates.ocean, icon: "🚢" },
              { label: labels.land, value: estimates.land, icon: "🚚" },
              { label: labels.customs, value: estimates.customs, icon: "📋" },
              { label: labels.wizardFee, value: estimates.wizardFee, icon: "💎" },
              { label: labels.dealerFee, value: estimates.dealerFee, icon: "🏢" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-bold text-slate-400">{item.label}</span>
                </div>
                <span className="font-mono font-black text-cyan-400">${item.value.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="flex justify-between items-center p-8 bg-cyan-500/5">
              <div className="flex items-center gap-4">
                <span className="text-2xl">💰</span>
                <span className="text-sm font-black text-white uppercase tracking-widest">{labels.total}</span>
              </div>
              <span className="text-2xl font-mono font-black text-cyan-400">${estimates.total.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className="p-8 bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] border border-white/5">
          <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
            {mode === RegionMode.WESTERN 
              ? "* Estimates based on standard sedan shipping from New Jersey to Zakho. Prices may vary based on vehicle size and auction location."
              : "* ئەڤ خەملاندنە بۆ تومبێلێن بچووکە ژ نیوجێرسی بۆ زاخۆ. بها دێ هێنە گوهۆرین لدویف قەبارێ تومبێلێ و جهێ موزایدێ."}
          </p>
        </section>
      </main>

      <footer className="p-8 bg-slate-900/80 backdrop-blur-ultra border-t border-white/5 space-y-3">
        <a 
          href="https://wa.me/16153392046" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95"
        >
          <span className="text-xl">💬</span>
          <span className="font-black tracking-[0.2em] uppercase text-[10px] text-white">WhatsApp Broker</span>
        </a>
        <a 
          href="mailto:support@repairwizard.net" 
          className="w-full py-5 bg-slate-800 hover:bg-slate-700 transition-all rounded-[2rem] flex items-center justify-center gap-3 border border-white/5 active:scale-95"
        >
          <span className="text-xl">✉️</span>
          <span className="font-black tracking-[0.2em] uppercase text-[10px] text-white">Email Support</span>
        </a>
      </footer>
    </div>
  );
};

export default WizardDirectView;
