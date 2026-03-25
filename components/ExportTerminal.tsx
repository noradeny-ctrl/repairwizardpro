import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Truck, Calculator, Search, Globe, ChevronRight, CheckCircle2, AlertTriangle, DollarSign, BarChart3, History, Zap, Info, Save, Cpu, Terminal as TerminalIcon, Activity, TrendingUp, Car, ShieldAlert } from 'lucide-react';
import { analyzeMarket } from '../services/geminiService';
import { RegionMode, MarketAnalysisResult } from '../types';
import { useFirebase } from './FirebaseProvider';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface ExportTerminalProps {
  onClose: () => void;
  mode: RegionMode;
}

interface SavedEstimate {
  id: string;
  price: number;
  total: number;
  date: string;
  vehicleType?: string;
  port?: string;
}

const ExportTerminal: React.FC<ExportTerminalProps> = ({ onClose, mode }) => {
  const { t } = useTranslation();
  const { user, userProfile, isAdmin } = useFirebase();
  const [auctionPrice, setAuctionPrice] = useState<string>('');
  const [vinSearch, setVinSearch] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
  const [savedVins, setSavedVins] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<'MERSIN' | 'JEBEL_ALI' | 'UMM_QASR'>('MERSIN');
  const [vehicleType, setVehicleType] = useState<'SEDAN' | 'SUV' | 'PICKUP'>('SEDAN');
  const [titleType, setTitleType] = useState<'CLEAN' | 'SALVAGE'>('SALVAGE');
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['> SYSTEM INITIALIZED', '> B2B TERMINAL v4.2 ONLINE']);

  const isPartner = userProfile?.role === 'partner';
  const canAccessAI = isAdmin || isPartner;

  // Load saved data
  useEffect(() => {
    // Local storage fallback
    const savedEst = localStorage.getItem('wizard_estimates');
    if (savedEst) setSavedEstimates(JSON.parse(savedEst));
    
    const savedV = localStorage.getItem('wizard_vins');
    if (savedV) setSavedVins(JSON.parse(savedV));

    // Firestore sync if logged in
    if (auth.currentUser) {
      const q = query(
        collection(db, 'estimates'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const estimates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedEstimate[];
        if (estimates.length > 0) {
          setSavedEstimates(estimates);
        }
      }, (err) => {
        console.error("Estimates listener error:", err);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleTrack = () => {
    if (vinSearch.length === 17) {
      setIsTracking(true);
      addLog(`> TRACKING VIN: ${vinSearch}`);
      addLog(`> QUERYING GLOBAL LOGISTICS DATABASE...`);
      if (!savedVins.includes(vinSearch)) {
        const updated = [vinSearch, ...savedVins].slice(0, 5);
        setSavedVins(updated);
        localStorage.setItem('wizard_vins', JSON.stringify(updated));
      }
    }
  };

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-9), msg]);
  };

  const clearLogs = () => {
    setTerminalLogs(['> SYSTEM LOGS CLEARED', '> STANDBY...']);
  };

  const handleMarketAnalysis = async () => {
    if (!vinSearch && !auctionPrice) return;
    setIsAnalyzingMarket(true);
    addLog(`> INITIALIZING AI MARKET INTELLIGENCE...`);
    try {
      const result = await analyzeMarket(vinSearch || auctionPrice, mode);
      setMarketAnalysis(result);
      addLog(`> ANALYSIS COMPLETE: ${result.resalePotential} POTENTIAL`);
    } catch (err) {
      addLog(`> ERROR: ANALYSIS FAILED`);
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  // Landed Cost Calculation Logic
  const calculations = useMemo(() => {
    const price = parseFloat(auctionPrice) || 0;
    if (price === 0) return null;

    // Port-based base costs
    const portConfigs = {
      MERSIN: { inland: 650, ocean: { SEDAN: 1200, SUV: 1450, PICKUP: 1700 }, transit: 450 },
      JEBEL_ALI: { inland: 850, ocean: { SEDAN: 1800, SUV: 2100, PICKUP: 2400 }, transit: 800 },
      UMM_QASR: { inland: 750, ocean: { SEDAN: 1500, SUV: 1800, PICKUP: 2100 }, transit: 600 }
    };

    const config = portConfigs[selectedPort];
    const inlandTowing = config.inland;
    const oceanFreight = config.ocean[vehicleType];
    const transitZakho = config.transit;

    // Auction fees (approximate sliding scale)
    let auctionFees = 600;
    if (price > 5000) auctionFees = 800;
    if (price > 15000) auctionFees = 1100;
    if (price > 30000) auctionFees = 1500;

    // KRG Customs (7% is standard, but salvage often has different valuation)
    const krgCustoms = price * (titleType === 'SALVAGE' ? 0.08 : 0.07);
    const docFees = 150;
    const storageBuffer = 100;

    const total = price + auctionFees + inlandTowing + oceanFreight + transitZakho + krgCustoms + docFees + storageBuffer;

    return {
      auctionFees,
      inlandTowing,
      oceanFreight,
      transitZakho,
      krgCustoms,
      docFees,
      storageBuffer,
      total
    };
  }, [auctionPrice, selectedPort, vehicleType, titleType]);

  const handleSaveEstimate = async () => {
    if (!calculations) return;
    
    const estimateData = {
      price: parseFloat(auctionPrice),
      total: calculations.total,
      vehicleType,
      port: selectedPort,
      titleType,
      date: new Date().toLocaleDateString(),
      userId: auth.currentUser?.uid || 'anonymous'
    };

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, 'estimates'), {
          ...estimateData,
          timestamp: serverTimestamp()
        });
        addLog(`> ESTIMATE SYNCED TO CLOUD`);
      } else {
        const newEstimate: SavedEstimate = {
          id: Math.random().toString(36).substr(2, 9),
          price: estimateData.price,
          total: estimateData.total,
          date: estimateData.date,
          vehicleType,
          port: selectedPort
        };
        const updated = [newEstimate, ...savedEstimates].slice(0, 5);
        setSavedEstimates(updated);
        localStorage.setItem('wizard_estimates', JSON.stringify(updated));
        addLog(`> ESTIMATE SAVED LOCALLY`);
      }
    } catch (err) {
      console.error("Save error:", err);
      addLog(`> ERROR: SAVE FAILED`);
    }
  };

  const shippingSteps = [
    { status: t('terminal.steps.us_port'), date: 'March 10, 2026', completed: true, icon: <Truck className="w-5 h-5" /> },
    { status: t('terminal.steps.ocean'), date: 'March 14, 2026', completed: true, icon: <Ship className="w-5 h-5" /> },
    { status: t('terminal.steps.mersin'), date: 'April 02, 2026', completed: false, icon: <Globe className="w-5 h-5" /> },
    { status: t('terminal.steps.zakho'), date: 'April 05, 2026', completed: false, icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const marketTrends = [
    { model: 'Toyota Camry 2022', avgBid: '$12,500', trend: '+2.4%', color: 'text-emerald-400' },
    { model: 'Jeep Grand Cherokee 2021', avgBid: '$18,200', trend: '-1.1%', color: 'text-red-400' },
    { model: 'Hyundai Elantra 2023', avgBid: '$9,800', trend: '+0.8%', color: 'text-emerald-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#010409] text-slate-100 font-sans overflow-y-auto"
    >
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[110] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Cyber Header */}
      <header className="sticky top-0 z-50 bg-[#010409]/80 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-center">
            <TerminalIcon className="text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-xs tracking-[0.2em] text-cyan-400 uppercase">{t('terminal.title')}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('terminal.version')}</p>
          </div>
        </div>
        
        {/* Live Terminal Log */}
        <div className="hidden lg:flex flex-col items-end font-mono text-[9px] text-cyan-500/60 relative group">
          {terminalLogs.map((log, i) => (
            <div key={i} className="opacity-80">{log}</div>
          ))}
          <button 
            onClick={clearLogs}
            className="absolute -bottom-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest"
          >
            [ Clear Logs ]
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Zap size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{t('terminal.system_online')}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-slate-900/40 border border-white/5 p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Ship size={200} className="text-cyan-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-orbitron text-4xl font-black text-white mb-4 tracking-tighter leading-none">
                {t('terminal.hero_title_main')} <span className="text-cyan-400">{t('terminal.hero_title_accent')}</span> {t('terminal.hero_title_sub')}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('terminal.hero_desc')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('terminal.active_containers')}</p>
                <p className="text-2xl font-orbitron font-black text-white">142</p>
              </div>
              <div className="px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('terminal.avg_transit')}</p>
                <p className="text-2xl font-orbitron font-black text-white">28d</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Calculator className="text-emerald-400 w-5 h-5" />
                  <h3 className="font-orbitron text-sm font-bold text-emerald-400 uppercase tracking-widest">{t('terminal.calc_title')}</h3>
                </div>
                {calculations && (
                  <button 
                    onClick={handleSaveEstimate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all"
                  >
                    <Save size={12} />
                    {t('terminal.save')}
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
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

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('terminal.target_port', 'Target Port')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['MERSIN', 'JEBEL_ALI', 'UMM_QASR'] as const).map(port => (
                        <button
                          key={port}
                          onClick={() => setSelectedPort(port)}
                          className={`py-2 rounded-xl text-[9px] font-black transition-all border ${
                            selectedPort === port 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          {port.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('terminal.vehicle_type', 'Vehicle Type')}</label>
                      <div className="flex gap-2">
                        {(['SEDAN', 'SUV', 'PICKUP'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setVehicleType(type)}
                            className={`flex-1 py-2 rounded-xl text-[8px] font-black transition-all border ${
                              vehicleType === type 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('terminal.title_type', 'Title Type')}</label>
                      <div className="flex gap-2">
                        {(['CLEAN', 'SALVAGE'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setTitleType(type)}
                            className={`flex-1 py-2 rounded-xl text-[8px] font-black transition-all border ${
                              titleType === type 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={12} className="text-slate-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('terminal.fee_breakdown')}</span>
                    </div>
                    {calculations ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.auction_fees')}</span>
                          <span className="font-mono text-white">${calculations.auctionFees.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.inland_towing')}</span>
                          <span className="font-mono text-white">${calculations.inlandTowing}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.ocean_freight')}</span>
                          <span className="font-mono text-white">${calculations.oceanFreight}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.transit_zakho')}</span>
                          <span className="font-mono text-white">${calculations.transitZakho}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.krg_customs')}</span>
                          <span className="font-mono text-white">${calculations.krgCustoms.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.documentation')}</span>
                          <span className="font-mono text-white">${calculations.docFees}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{t('terminal.storage_buffer')}</span>
                          <span className="font-mono text-white">${calculations.storageBuffer}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">{t('terminal.enter_price_hint')}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {calculations ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                    >
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">{t('terminal.total_price')}</p>
                      <p className="font-orbitron text-6xl font-black text-white tracking-tighter mb-2">
                        ${calculations.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">
                        <Zap size={10} />
                        {t('terminal.landed_in_zakho')}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <Calculator size={64} className="mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">{t('terminal.awaiting_input')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Card */}
            <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
              <div className="flex items-center gap-3 mb-2">
                <Search className="text-cyan-400 w-5 h-5" />
                <h3 className="font-orbitron text-sm font-bold text-cyan-400 uppercase tracking-widest">{t('terminal.track_title')}</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('terminal.vehicle_id')}</label>
                      <span className={`text-[10px] font-mono ${vinSearch.length === 17 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {vinSearch.length}/17
                      </span>
                    </div>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          maxLength={17}
                          value={vinSearch}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                            setVinSearch(val);
                          }}
                          placeholder={t('terminal.vin_input_placeholder')}
                          className={`w-full bg-black/40 border ${vinSearch.length === 17 ? 'border-cyan-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white font-mono text-xs focus:border-cyan-500/50 focus:ring-0 transition-all tracking-widest pr-12`}
                        />
                        {vinSearch.length > 0 && (
                          <button 
                            onClick={() => {
                              setVinSearch('');
                              setIsTracking(false);
                            }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                        {vinSearch.length === 17 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <CheckCircle2 size={14} className="text-cyan-400 animate-bounce" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handleTrack}
                        disabled={vinSearch.length !== 17}
                        className={`px-4 rounded-2xl transition-all active:scale-95 ${
                          vinSearch.length === 17 
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]' 
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </div>
                  
                  {savedVins.length > 0 && !isTracking && (
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('terminal.recent_vins')}</p>
                      <div className="flex flex-wrap gap-2">
                        {savedVins.map(v => (
                          <button 
                            key={v}
                            onClick={() => setVinSearch(v)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-mono text-slate-400 transition-all"
                          >
                            {v.substring(0, 4)}...{v.substring(13)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {vinSearch.length > 0 && vinSearch.length < 17 && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[9px] text-amber-500/80 font-bold uppercase tracking-wider"
                      >
                        {t('terminal.vin_requirement_hint')}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={10} className="text-cyan-500" />
                      <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">{t('terminal.tracking_intelligence')}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {t('terminal.tracking_desc')}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {isTracking ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {shippingSteps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                            step.completed 
                              ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                              : 'bg-slate-900 border-white/10 text-slate-600'
                          }`}>
                            {step.icon}
                          </div>
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-tighter ${step.completed ? 'text-white' : 'text-slate-500'}`}>{step.status}</p>
                            <p className="text-[8px] font-mono text-slate-600 mt-1">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                      <Globe size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{t('terminal.tracking_inactive')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Intelligence */}
          <div className="space-y-8">
            {/* AI Market Intelligence */}
            <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Cpu size={80} className="text-cyan-400" />
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="text-cyan-400 w-4 h-4" />
                <h3 className="font-orbitron text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{t('terminal.ai_intelligence', 'AI Intelligence')}</h3>
              </div>
              
              {!marketAnalysis ? (
                <div className="space-y-4">
                  <button 
                    onClick={handleMarketAnalysis}
                    disabled={isAnalyzingMarket || (!vinSearch && !auctionPrice) || !canAccessAI}
                    className="w-full py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center gap-3 transition-all group disabled:opacity-50"
                  >
                    {isAnalyzingMarket ? (
                      <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Cpu className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                    )}
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                      {isAnalyzingMarket ? t('terminal.analyzing', 'Analyzing...') : t('terminal.run_market_audit', 'Run Market Audit')}
                    </span>
                  </button>
                  {!canAccessAI && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
                      <ShieldAlert className="text-amber-500 shrink-0" size={16} />
                      <p className="text-[9px] text-amber-200/60 leading-relaxed uppercase tracking-wider">
                        {t('terminal.partner_only_ai', 'AI Market Intelligence is restricted to Verified Partners and Admins.')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase">{t('terminal.resale_potential', 'Resale Potential')}</span>
                      <span className={`text-[10px] font-black uppercase ${
                        marketAnalysis.resalePotential === 'High' ? 'text-emerald-400' : 
                        marketAnalysis.resalePotential === 'Medium' ? 'text-amber-400' : 'text-red-400'
                      }`}>{marketAnalysis.resalePotential}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${marketAnalysis.demandScore}%` }}
                        className="h-full bg-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{t('terminal.local_price', 'Local Price Range')}</p>
                    <p className="text-lg font-mono font-bold text-white">{marketAnalysis.localMarketPriceRange}</p>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">{t('terminal.advice', 'Advice')}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{marketAnalysis.importAdvice}</p>
                  </div>
                  
                  <button 
                    onClick={() => setMarketAnalysis(null)}
                    className="w-full py-2 text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                  >
                    {t('terminal.reset_analysis', 'Reset Analysis')}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Market Trends */}
            <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-cyan-400 w-4 h-4" />
                <h3 className="font-orbitron text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{t('terminal.market_intelligence')}</h3>
              </div>
              <div className="space-y-4">
                {marketTrends.map((trend, i) => (
                  <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-white mb-1">{trend.model}</p>
                      <p className="text-[9px] font-mono text-slate-500">Avg. Bid: {trend.avgBid}</p>
                    </div>
                    <span className={`text-[10px] font-black ${trend.color}`}>{trend.trend}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Saved Estimates */}
            <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center gap-3">
                <History className="text-slate-400 w-4 h-4" />
                <h3 className="font-orbitron text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('terminal.recent_estimates')}</h3>
              </div>
              <div className="space-y-3">
                {savedEstimates.length > 0 ? (
                  savedEstimates.map((est) => (
                    <div key={est.id} className="relative group">
                      <button 
                        onClick={() => {
                          setAuctionPrice(est.price.toString());
                          if (est.port) setSelectedPort(est.port as any);
                          if (est.vehicleType) setVehicleType(est.vehicleType as any);
                        }}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex justify-between items-center transition-all"
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-bold text-white">${est.price.toLocaleString()}</p>
                            {est.vehicleType && (
                              <span className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] text-slate-400 font-black">{est.vehicleType}</span>
                            )}
                          </div>
                          <p className="text-[8px] text-slate-500 uppercase">{est.date} • {est.port?.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400 group-hover:scale-110 transition-transform">${est.total.toLocaleString()}</p>
                        </div>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 text-center py-4 italic">{t('terminal.no_estimates')}</p>
                )}
              </div>
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
