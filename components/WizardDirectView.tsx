import React, { useState, useMemo } from 'react';
import { RegionMode } from '../types';

interface WizardDirectViewProps {
  mode: RegionMode;
  onClose: () => void;
}

enum VehicleType {
  SEDAN = 'SEDAN',
  SUV_SMALL = 'SUV (SMALL)',
  SUV_LARGE = 'SUV (LARGE)',
  PICKUP_LIGHT = 'PICKUP (LIGHT)',
  PICKUP_HEAVY = 'PICKUP (HEAVY)',
  EV = 'ELECTRIC VEHICLE',
  HYBRID = 'HYBRID'
}

const WizardDirectView: React.FC<WizardDirectViewProps> = ({ mode, onClose }) => {
  const [vehiclePrice, setVehiclePrice] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.SEDAN);
  
  const isRTL = mode !== RegionMode.WESTERN;

  const estimates = useMemo(() => {
    const baseInland = 500;
    const baseOcean = 1500;
    const baseLand = 600;
    
    const multipliers: Record<VehicleType, number> = {
      [VehicleType.SEDAN]: 1,
      [VehicleType.SUV_SMALL]: 1.2,
      [VehicleType.SUV_LARGE]: 1.4,
      [VehicleType.PICKUP_LIGHT]: 1.5,
      [VehicleType.PICKUP_HEAVY]: 1.8,
      [VehicleType.EV]: 1.3,
      [VehicleType.HYBRID]: 1.1
    };

    const multiplier = multipliers[vehicleType];
    const inland = baseInland * multiplier;
    const ocean = baseOcean * multiplier;
    const land = baseLand * multiplier;
    const wizardFee = 500;
    const dealerFee = 500;
    const customsRate = 0.15;
    const customs = vehiclePrice * customsRate;
    const total = vehiclePrice + inland + ocean + land + customs + wizardFee + dealerFee;
    
    const iqdRate = 1500; // Fixed rate for estimation
    const totalIQD = total * iqdRate;

    return {
      inland,
      ocean,
      land,
      wizardFee,
      dealerFee,
      customs,
      total,
      totalIQD
    };
  }, [vehiclePrice, vehicleType]);

  const labels = {
    title: mode === RegionMode.WESTERN ? "🇺🇸 WIZARD DIRECT PORTAL" : "🇺🇸 پۆرتالا ویزارد دایرێکت",
    subtitle: mode === RegionMode.WESTERN ? "USA to Kurdistan Direct Import" : "ژ ئەمریکا بۆ کوردستانێ ب رەنگەکێ راستەوخۆ",
    vehicleType: mode === RegionMode.WESTERN ? "Vehicle Category" : "پۆلێنا تومبێلێ",
    pricePlaceholder: mode === RegionMode.WESTERN ? "Auction Bid Price ($)" : "بهایێ موزایدێ ($)",
    breakdown: mode === RegionMode.WESTERN ? "COST ESTIMATE BREAKDOWN" : "کۆژمێ خەملاندی",
    inland: mode === RegionMode.WESTERN ? "USA Inland Towing" : "ڤەگوهاستنا ناڤخۆیا ئەمریکا",
    ocean: mode === RegionMode.WESTERN ? "Ocean Freight (Mersin)" : "بارهەلگرا دەریایی (مێرسین)",
    land: mode === RegionMode.WESTERN ? "Land Transit (Zakho)" : "ڤەگوهاستنا وشکانی (زاخۆ)",
    customs: mode === RegionMode.WESTERN ? "KRG Customs (ASYCUDA)" : "گومرکا هەرێمێ (ئاسیکۆدا)",
    wizardFee: mode === RegionMode.WESTERN ? "RepairWizard Service Fee" : "کرێیا خزمەتگۆزاریا ڕێپەیر ویزارد",
    dealerFee: mode === RegionMode.WESTERN ? "Dealer Account Fee" : "کرێیا هەژمارا دیلەر",
    total: mode === RegionMode.WESTERN ? "TOTAL LANDED COST" : "کۆژمێ گشتی",
    totalIQD: mode === RegionMode.WESTERN ? "ESTIMATED IQD TOTAL" : "کۆژمێ خەملاندی ب دینار",
    contact: mode === RegionMode.WESTERN ? "Contact Import Broker" : "پەیوەندیێ ب برۆکەری بکە",
    logistics: mode === RegionMode.WESTERN ? "LOGISTICS TIMELINE" : "خشتێ دەمێ ڤەگوهاستنێ",
    processGuide: mode === RegionMode.WESTERN ? "HOW IT WORKS" : "چەوانیا کارکرنێ",
  };

  const steps = [
    { id: 1, label: mode === RegionMode.WESTERN ? "Auction Win" : "سەرکەفتن د موزایدێ دا", icon: "🔨", duration: "Day 1" },
    { id: 2, label: mode === RegionMode.WESTERN ? "USA Towing" : "ڤەگوهاستنا ئەمریکا", icon: "🚛", duration: "3-7 Days" },
    { id: 3, label: mode === RegionMode.WESTERN ? "Ocean Transit" : "گەشتا دەریایی", icon: "🚢", duration: "30-45 Days" },
    { id: 4, label: mode === RegionMode.WESTERN ? "Mersin Port" : "بەندەرا مێرسین", icon: "⚓", duration: "2-4 Days" },
    { id: 5, label: mode === RegionMode.WESTERN ? "Zakho Border" : "سنۆرێ زاخۆ", icon: "🏁", duration: "1-2 Days" },
  ];

  const getVehicleTypeLabel = (type: VehicleType) => {
    if (mode === RegionMode.WESTERN) return type;
    const labels: Record<VehicleType, string> = {
      [VehicleType.SEDAN]: 'سێدان',
      [VehicleType.SUV_SMALL]: 'SUV (بچویک)',
      [VehicleType.SUV_LARGE]: 'SUV (مەزن)',
      [VehicleType.PICKUP_LIGHT]: 'پیکاپ (سڤک)',
      [VehicleType.PICKUP_HEAVY]: 'پیکاپ (گران)',
      [VehicleType.EV]: 'تومبێلا کارەبایی',
      [VehicleType.HYBRID]: 'هایبرید'
    };
    return labels[type];
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
        {/* Vehicle Selection & Price */}
        <section className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">{labels.vehicleType}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(VehicleType).map((type) => (
                <button 
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`py-3 px-4 rounded-2xl text-[10px] font-black transition-all border ${vehicleType === type ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-900/20' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                >
                  {getVehicleTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">{labels.pricePlaceholder}</label>
            <div className="relative">
              <span className="absolute left-0 bottom-2 text-3xl font-black text-cyan-500/50">$</span>
              <input 
                type="number" 
                className="w-full bg-transparent border-b-2 border-slate-700 focus:border-cyan-500 transition-colors text-3xl font-black text-white outline-none py-2 pl-8"
                placeholder="0"
                value={vehiclePrice || ''}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Logistics Timeline */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">{labels.logistics}</h3>
          <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 overflow-x-auto">
            <div className="flex justify-between min-w-[500px] relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 z-0" />
              {steps.map((step, i) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-xl ${i === 0 ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{step.label}</p>
                    <p className="text-[8px] font-bold text-cyan-500/60 uppercase">{step.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
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
              <div key={i} className="flex justify-between items-center p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-bold text-slate-400">{item.label}</span>
                </div>
                <span className="font-mono font-black text-cyan-400">${item.value.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="p-8 bg-cyan-500/10 border-t border-cyan-500/20 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-black text-white uppercase tracking-widest">{labels.total}</span>
                </div>
                <span className="text-2xl font-mono font-black text-cyan-400">${estimates.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{labels.totalIQD}</span>
                <span className="text-lg font-mono font-black text-emerald-400">~ {estimates.totalIQD.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>
        </section>

        {/* Process Guide */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">{labels.processGuide}</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { 
                title: mode === RegionMode.WESTERN ? "1. Auction Access" : "١. دەستپێکرنا موزایدێ", 
                desc: mode === RegionMode.WESTERN ? "We provide access to Copart/IAAI dealer accounts." : "ئەم هەژمارێن دیلەران بۆ کۆپارت و IAAI دابین دکەین." 
              },
              { 
                title: mode === RegionMode.WESTERN ? "2. Secure Payment" : "٢. پارەدانەکا پاراستی", 
                desc: mode === RegionMode.WESTERN ? "Funds are wired directly to the auction house." : "پارە ب رەنگەکێ راستەوخۆ بۆ موزایدێ دهێتە هنارتن." 
              },
              { 
                title: mode === RegionMode.WESTERN ? "3. Global Logistics" : "٣. ڤەگوهاستنا جیهانی", 
                desc: mode === RegionMode.WESTERN ? "Full tracking from USA port to Zakho border." : "دووڤچوونا هەمی قۆناغێن ڤەگوهاستنێ ژ ئەمریکا بۆ زاخۆ." 
              }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-slate-800/20 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-black text-white uppercase mb-2">{item.title}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wizard Insight */}
        <section className="p-8 bg-gradient-to-br from-slate-900 to-cyan-900/20 rounded-[2.5rem] border border-cyan-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🧙‍♂️</div>
          <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">WIZARD INSIGHT: CLEAN VS SALVAGE</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-4">
            {mode === RegionMode.WESTERN 
              ? "Skip the local salvage dealers. Importing a 'Clean Title' vehicle from the USA ensures structural integrity and higher resale value in Kurdistan. Our ASYCUDA-ready logistics handle everything from the auction floor to the Ibrahim Khalil border."
              : "خۆت ژ تومبێلێن سەلاوەج یێن ناڤخۆ دویر بێخە. ئینانا تومبێلەکا 'کلین تایتل' ژ ئەمریکا سلامەتیا تومبێلێ و بهایێ وێ یێ پاشەرۆژێ دپارێزیت. ئەم هەمی کارێن گومرکێ و ڤەگوهاستنێ دکەین."}
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase">Verified Auctions</span>
            <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase">Direct Logistics</span>
          </div>
        </section>

        <div className="h-20" />
      </main>

      <footer className="p-8 bg-slate-900/80 backdrop-blur-ultra border-t border-white/5 space-y-3">
        <a 
          href="https://wa.me/16153392046" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95"
        >
          <span className="text-xl">💬</span>
          <span className="font-black tracking-[0.2em] uppercase text-[10px] text-white">
            {mode === RegionMode.BADINAN ? "پەیوەندی ب برۆکەری بکە" : "WhatsApp Broker"}
          </span>
        </a>
        <div className="pt-4 text-center">
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
            {mode === RegionMode.WESTERN 
              ? "* Final costs subject to auction fees and current exchange rates."
              : "* بهایێ دوماهیێ دێ هێتە گوهۆرین لدویف کرێیا موزایدێ و بهایێ دۆلاری."}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WizardDirectView;
