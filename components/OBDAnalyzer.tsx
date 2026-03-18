import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, ShoppingCart, Truck, Activity, Terminal, CheckCircle2, Cpu, Zap, History, ChevronRight, Info, ShieldAlert, Loader2, Trash2, X } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { RegionMode } from '../types';
import { useTranslation } from 'react-i18next';
import { useFirebase } from './FirebaseProvider';
import { db, collection, setDoc, doc, Timestamp, handleFirestoreError, OperationType } from '../firebase';

type ThreatLevel = 'STABLE' | 'WARNING' | 'CRITICAL';

interface OBDCodeData {
  code: string;
  translation: string;
  threatLevel: ThreatLevel;
  threatDescription: string;
  partName: string;
  symptoms: string[];
  commonCauses: string[];
  estimatedCost: string;
  technicalDetails?: {
    freezeFrameSimulation: string;
    pinoutChecks: string[];
    componentLocation: string;
  };
}

interface OBDAnalyzerProps {
  mode?: RegionMode;
}

const OBDAnalyzer: React.FC<OBDAnalyzerProps> = ({ mode = RegionMode.WESTERN }) => {
  const { t } = useTranslation();
  const { user } = useFirebase();

  const localizedLogs = [
    t('common.initializing_neural_link', 'INITIALIZING NEURAL LINK...'),
    t('common.accessing_global_obd_database', 'ACCESSING GLOBAL OBD-II DATABASE...'),
    t('common.scanning_vehicle_telemetry', 'SCANNING VEHICLE TELEMETRY...'),
    t('common.decoding_fault_signatures', 'DECODING FAULT SIGNATURES...'),
    t('common.analyzing_threat_vectors', 'ANALYZING THREAT VECTORS...'),
    t('common.generating_plain_english', 'GENERATING PLAIN TRANSLATION...'),
    t('common.calculating_repair_costs', 'CALCULATING REPAIR COSTS...'),
    t('common.neural_breaker_complete', 'NEURAL BREAKER COMPLETE.')
  ];

  const [input, setInput] = useState('');
  const [result, setResult] = useState<OBDCodeData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [logIndex, setLogIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<OBDCodeData[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const getStatus = () => {
    if (isSearching || isDeepScanning) return 'SCANNING';
    if (error) return 'ERROR';
    if (result) return 'COMPLETE';
    return 'IDLE';
  };

  const status = getStatus();

  useEffect(() => {
    const saved = localStorage.getItem('obd_recent_scans');
    if (saved) setRecentScans(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isSearching || isDeepScanning) {
      const interval = setInterval(() => {
        setLogIndex(prev => {
          if (prev < localizedLogs.length - 1) return prev + 1;
          return prev;
        });
      }, 400);
      return () => clearInterval(interval);
    } else {
      setLogIndex(-1);
    }
  }, [isSearching, isDeepScanning, localizedLogs.length]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [logIndex]);

  useEffect(() => {
    if ((isSearching || isDeepScanning) && logContainerRef.current) {
      logContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSearching, isDeepScanning]);

  useEffect(() => {
    if (result && !isSearching && !isDeepScanning && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isSearching, isDeepScanning]);

  const saveToRecent = (data: OBDCodeData) => {
    setRecentScans(prev => {
      const filtered = prev.filter(s => s.code !== data.code);
      const updated = [data, ...filtered].slice(0, 5);
      localStorage.setItem('obd_recent_scans', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClear = useCallback(() => {
    setInput('');
    setResult(null);
    setError(null);
    setIsSearching(false);
    setIsDeepScanning(false);
    setLogIndex(-1);
  }, []);

  const getAmazonLink = (part: string) => {
    const query = encodeURIComponent(`${part} car part`);
    return `https://www.amazon.com/s?k=${query}&tag=repairwizard-20`;
  };

  const handleSearch = useCallback(async (deep = false) => {
    if (!input.trim()) return;
    
    if (deep) setIsDeepScanning(true);
    else setIsSearching(true);
    
    setError(null);
    if (!deep) setResult(null);

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      let languagePrompt = "";
      const clarityInstruction = "CRITICAL: All user-facing descriptions (especially the 'translation' and 'threatDescription' fields) MUST be written for a regular person who knows nothing about cars. Use simple, everyday language. Instead of 'catalytic converter efficiency', say 'the part that cleans exhaust is not working well'. Instead of 'misfire', say 'the engine is stumbling'. ABSOLUTELY NO technical jargon in these two fields.";
      
      if (mode === RegionMode.BADINAN) {
        languagePrompt = `Response must be in Badini Kurdish (Duhok/Zakho). ${clarityInstruction}`;
      } else if (mode === RegionMode.SORANI) {
        languagePrompt = `Response must be in Sorani Kurdish (Erbil/Sulaymaniyah). ${clarityInstruction}`;
      } else if (mode === RegionMode.ARABIC) {
        languagePrompt = `Response must be in Modern Standard Arabic. ${clarityInstruction}`;
      } else {
        languagePrompt = `Response must be in clear, simple, non-technical English. ${clarityInstruction}`;
      }

      const prompt = deep 
        ? `Perform a DEEP NEURAL ANALYSIS for the following car problem or OBD-II code: "${input.trim()}". ${languagePrompt} If a description is provided, first identify the most likely OBD-II code. Provide a non-technical summary for the user, but include deep technical details like freeze frame simulation, pinout checks, and component location in the technicalDetails section for professional reference.`
        : `The user has provided the following input: "${input.trim()}". ${languagePrompt} If this is an OBD-II code, analyze it. If this is a description of a car problem, identify the most likely OBD-II fault code associated with these symptoms and then analyze it. Provide a clear, non-technical diagnostic report for the owner, while including technical details like freeze frame simulation, pinout checks, and component location in the technicalDetails section if applicable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a friendly, expert car mechanic who explains complex car problems to people who know nothing about cars. Your goal is to be helpful and clear, using simple analogies and everyday language for the 'translation' and 'threatDescription' fields.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: "The detected or provided OBD-II fault code (e.g., P0300)." },
              translation: { type: Type.STRING, description: "A non-technical, easy to understand explanation of the problem for a regular car owner. NO JARGON." },
              threatLevel: { type: Type.STRING, enum: ["STABLE", "WARNING", "CRITICAL"] },
              threatDescription: { type: Type.STRING, description: "A clear explanation of the danger level in simple terms. NO JARGON." },
              partName: { type: Type.STRING },
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of symptoms in plain language." },
              commonCauses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common causes in plain language." },
              estimatedCost: { type: Type.STRING },
              technicalDetails: {
                type: Type.OBJECT,
                properties: {
                  freezeFrameSimulation: { type: Type.STRING, description: "Technical data for mechanics." },
                  pinoutChecks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Technical pinout steps." },
                  componentLocation: { type: Type.STRING, description: "Technical location details." }
                }
              }
            },
            required: ["code", "translation", "threatLevel", "threatDescription", "partName", "symptoms", "commonCauses", "estimatedCost"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
      saveToRecent(data);

      // Save to Firestore if user is logged in
      if (user) {
        try {
          const scanRef = doc(collection(db, 'scans'));
          await setDoc(scanRef, {
            uid: user.uid,
            code: data.code,
            translation: data.translation,
            threatLevel: data.threatLevel,
            partName: data.partName,
            estimatedCost: data.estimatedCost,
            timestamp: Timestamp.now()
          });
        } catch (fsErr) {
          console.error("Failed to save scan to Firestore:", fsErr);
          // We don't throw here to not interrupt the user experience
        }
      }
    } catch (err: any) {
      console.error("OBD Analysis failed:", err);
      
      let errorMessage = t('common.neural_link_interrupted', "NEURAL LINK INTERRUPTED: UNABLE TO DECODE SIGNATURE.");
      
      const errorStr = String(err).toLowerCase();
      if (errorStr.includes("quota") || errorStr.includes("429")) {
        errorMessage = t('common.neural_link_saturated', "NEURAL LINK SATURATED: PROCESSING QUOTA EXCEEDED. PLEASE STAND BY.");
      } else if (errorStr.includes("safety") || errorStr.includes("blocked")) {
        errorMessage = t('common.neural_link_blocked', "NEURAL LINK BLOCKED: SAFETY PROTOCOLS TRIGGERED BY INPUT SIGNATURE.");
      } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
        errorMessage = t('common.neural_link_unstable', "NEURAL LINK UNSTABLE: CONNECTION TIMEOUT DETECTED.");
      } else if (errorStr.includes("api key") || errorStr.includes("key not found")) {
        errorMessage = t('common.neural_link_rejected', "NEURAL LINK REJECTED: INVALID AUTHENTICATION SIGNATURE.");
      } else if (errorStr.includes("json")) {
        errorMessage = t('common.neural_link_corrupted', "NEURAL LINK CORRUPTED: RECEIVED MALFORMED DATA STREAM.");
      }

      setError(errorMessage);
    } finally {
      setIsSearching(false);
      setIsDeepScanning(false);
    }
  }, [input]);







  return (
    <div className="w-full bg-[#010409] text-white font-orbitron p-6 flex flex-col items-center justify-start relative">
      {/* Neural Pulse Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] animate-neural-pulse pointer-events-none"></div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Recent Scans */}
        <div className="lg:col-span-3 space-y-4 hidden lg:block">
          <div className="flex items-center gap-2 text-cyan-400/40 text-[10px] font-black uppercase tracking-widest mb-4">
            <History size={14} />
            {t('common.recent_scans', 'Recent Scans')}
          </div>
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <button 
                key={i}
                onClick={() => { setInput(scan.code); setResult(scan); }}
                className="w-full text-left p-4 bg-[#0d1117] border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-cyan-400">{scan.code}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[8px] text-slate-500 uppercase truncate mt-1">{scan.partName}</div>
              </button>
            ))}
            {recentScans.length === 0 && (
              <div className="text-[10px] text-slate-600 italic">{t('common.no_recent_scans', 'No recent scans')}</div>
            )}
          </div>
        </div>

        {/* Main Column */}
        <div className="lg:col-span-9 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl font-black tracking-tighter text-[#00f3ff] drop-shadow-[0_0_20px_rgba(0,243,255,0.6)] uppercase italic"
            >
              {t('common.obd_breaker', 'OBD Breaker')}
            </motion.h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-cyan-500/20"></div>
              <p className="text-[10px] tracking-[0.4em] text-cyan-400/60 uppercase">
                {t('common.diagnostic_interface', 'Diagnostic Interface v6.0')}
              </p>
              <div className="h-[1px] w-12 bg-cyan-500/20"></div>
            </div>
          </div>

          {/* Scan Status Indicator */}
          <div className="flex items-center justify-between bg-[#0d1117] border border-white/5 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                status === 'SCANNING' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                status === 'COMPLETE' ? 'bg-emerald-500/20 text-emerald-400' :
                status === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/10 text-slate-500'
              }`}>
                {status === 'SCANNING' ? <Activity size={20} /> :
                 status === 'COMPLETE' ? <CheckCircle2 size={20} /> :
                 status === 'ERROR' ? <ShieldAlert size={20} /> :
                 <Terminal size={20} />}
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                  {t('common.scan_status', 'Scan Status')}
                </div>
                <div className={`text-sm font-black uppercase tracking-tighter ${
                  status === 'SCANNING' ? 'text-cyan-400' :
                  status === 'COMPLETE' ? 'text-emerald-400' :
                  status === 'ERROR' ? 'text-red-400' :
                  'text-slate-400'
                }`}>
                  {status === 'SCANNING' ? t('common.status_scanning', 'SCANNING') :
                   status === 'COMPLETE' ? t('common.status_complete', 'COMPLETE') :
                   status === 'ERROR' ? t('common.status_error', 'ERROR') :
                   t('common.status_idle', 'IDLE')}
                </div>
              </div>
            </div>

            {/* Progress Bar for Scanning */}
            {status === 'SCANNING' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((logIndex + 1) / localizedLogs.length) * 100}%` }}
                  className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0d1117] border border-cyan-500/30 rounded-2xl p-2 shadow-2xl">
              <Search className="ml-4 text-cyan-400/50" size={20} />
              <input 
                type="text" 
                placeholder={t('common.obd_placeholder', "DESCRIBE PROBLEM OR ENTER CODE (e.g., 'car shaking')")}
                className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-cyan-900/50 px-4 py-4 text-lg font-bold tracking-widest uppercase"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="flex items-center gap-2 pr-2">
                <button 
                  onClick={handleClear}
                  className="px-4 py-4 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors border border-white/5 rounded-xl bg-white/5 whitespace-nowrap"
                >
                  {t('common.clear_all', 'Clear All')}
                </button>
                <button 
                  onClick={() => handleSearch()}
                  disabled={isSearching || isDeepScanning}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-black px-8 py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {isSearching ? <Activity className="animate-spin" size={18} /> : t('common.decode', 'DECODE')}
                </button>
              </div>
            </div>
          </div>

          {/* Neural Scan Log */}
          <AnimatePresence>
            {(isSearching || isDeepScanning) && (
              <motion.div 
                ref={logContainerRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4 font-mono text-[10px] text-cyan-400/60 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
                  <div className="w-full h-1 bg-cyan-400 animate-scan-line"></div>
                </div>
                <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/10 pb-2">
                  <Terminal size={12} />
                  <span className="uppercase tracking-widest">{t('common.neural_scan_log', 'Neural Scan Log')}</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto hide-scrollbar">
                  {localizedLogs.slice(0, logIndex + 1).map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 animate-fade-in">
                      <span className="text-cyan-500/30">[{new Date().toLocaleTimeString()}]</span>
                      <span className={i === logIndex ? "text-cyan-400" : ""}>{msg}</span>
                      {i === logIndex && <span className="w-1 h-3 bg-cyan-400 animate-pulse"></span>}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-red-500 rounded-2xl blur opacity-20 animate-pulse"></div>
                <div className="relative p-6 bg-[#0d1117] border border-red-500/30 rounded-2xl text-red-500 flex flex-col items-center gap-3 text-center">
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <ShieldAlert size={24} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-[0.3em]">{t('common.neural_link_status', 'Neural Link Status')}: {t('common.critical', 'Critical')}</div>
                    <div className="text-sm font-bold tracking-widest uppercase">{error}</div>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-[10px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    {t('common.dismiss_alert', '[ Dismiss Alert ]')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {result && !isSearching && !isDeepScanning ? (
              <motion.div 
                ref={resultsRef}
                key={result.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="space-y-6"
              >
                {/* Threat Level Gauge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    boxShadow: result.threatLevel === 'CRITICAL' 
                      ? ["0 0 20px rgba(239,68,68,0.1)", "0 0 40px rgba(239,68,68,0.3)", "0 0 20px rgba(239,68,68,0.1)"]
                      : result.threatLevel === 'WARNING'
                      ? ["0 0 15px rgba(234,179,8,0.05)", "0 0 30px rgba(234,179,8,0.15)", "0 0 15px rgba(234,179,8,0.05)"]
                      : "0 0 50px rgba(0,0,0,0.5)"
                  }}
                  transition={{ 
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className={`bg-[#0d1117] border rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 ${
                    result.threatLevel === 'CRITICAL' 
                      ? 'border-red-500/40 bg-red-500/[0.02]' 
                      : result.threatLevel === 'WARNING' 
                      ? 'border-yellow-500/30 bg-yellow-500/[0.01]' 
                      : 'border-cyan-500/20 bg-cyan-500/[0.01]'
                  }`}
                >
                  {/* Background Icon Watermark */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700">
                    {result.threatLevel === 'CRITICAL' ? (
                      <ShieldAlert size={200} className="text-red-500" />
                    ) : result.threatLevel === 'WARNING' ? (
                      <AlertTriangle size={200} className="text-yellow-500" />
                    ) : (
                      <CheckCircle2 size={200} className="text-cyan-500" />
                    )}
                  </div>

                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${
                    result.threatLevel === 'CRITICAL' ? 'text-red-500' : result.threatLevel === 'WARNING' ? 'text-yellow-500' : 'text-cyan-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-2.5 h-2.5 rounded-full ${result.threatLevel === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : result.threatLevel === 'WARNING' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'}`}
                        ></motion.div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('common.threat_assessment', 'Neural Threat Assessment')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${
                          result.threatLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                          result.threatLevel === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 
                          'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        }`}>
                          {result.threatLevel === 'CRITICAL' ? <ShieldAlert size={24} /> : result.threatLevel === 'WARNING' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <div>
                          <h2 className={`text-2xl font-black uppercase tracking-tighter drop-shadow-sm ${result.threatLevel === 'CRITICAL' ? 'text-red-500' : result.threatLevel === 'WARNING' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {result.threatLevel === 'CRITICAL' ? t('common.critical', 'Critical') : result.threatLevel === 'WARNING' ? t('common.warning', 'Warning') : t('common.stable', 'Stable')}
                          </h2>
                          <motion.p 
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5"
                          >
                            {result.threatDescription}
                          </motion.p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('common.identified_part', 'Identified Part')}:</span>
                        <a 
                          href={getAmazonLink(result.partName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black text-cyan-400 hover:text-white transition-all flex items-center gap-1.5 group/link bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10 hover:border-cyan-500/30"
                        >
                          {result.partName}
                          <ShoppingCart size={10} className="group-hover/link:scale-110 transition-transform" />
                        </a>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-5xl font-black italic text-white/5 tracking-tighter select-none">{result.code}</span>
                      <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-mono text-slate-500 uppercase tracking-widest border border-white/5">
                        {t('common.fault_signature', 'Fault Signature')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{t('common.risk_index', 'Risk Index')}</span>
                      <span className={result.threatLevel === 'CRITICAL' ? 'text-red-500' : result.threatLevel === 'WARNING' ? 'text-yellow-400' : 'text-cyan-400'}>
                        {result.threatLevel === 'CRITICAL' ? '90-100%' : result.threatLevel === 'WARNING' ? '40-70%' : '0-20%'}
                      </span>
                    </div>
                    <div className="relative h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: result.threatLevel === 'CRITICAL' ? '100%' : result.threatLevel === 'WARNING' ? '65%' : '20%' }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className={`h-full rounded-full relative ${
                          result.threatLevel === 'CRITICAL' 
                            ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                            : result.threatLevel === 'WARNING' 
                            ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                            : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer"></div>
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Translation Box */}
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-10 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={120} />
                  </div>
                  <div className="absolute top-0 left-0 bg-cyan-500 text-black text-[9px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-[0.2em] flex items-center gap-2">
                    <Cpu size={10} />
                    {t('common.decoded_intelligence', 'Decoded Intelligence')}
                  </div>
                  <p className="text-2xl font-medium leading-relaxed text-cyan-50/90 italic relative z-10 pr-12">
                    <span className="text-cyan-500/40 text-4xl font-serif absolute -left-6 -top-2">"</span>
                    {result.translation}
                    <span className="text-cyan-500/40 text-4xl font-serif absolute -bottom-8 ml-2">"</span>
                  </p>
                </div>

                {/* Technical Deep Dive Button */}
                {!result.technicalDetails && (
                  <button 
                    onClick={() => handleSearch(true)}
                    className="w-full py-4 bg-slate-900/50 border border-cyan-500/20 rounded-2xl text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.4em] hover:bg-cyan-500/10 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Info size={14} className="group-hover:rotate-12 transition-transform" />
                    {t('common.deep_analysis_btn', 'Initialize Deep Neural Analysis')}
                  </button>
                )}

                {/* Technical Deep Dive Content */}
                {result.technicalDetails && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0d1117] border border-cyan-500/30 rounded-3xl p-8 space-y-8 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/40"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-cyan-400 text-sm font-black uppercase tracking-widest">
                        <Terminal size={18} className="text-cyan-500" />
                        {t('common.deep_scan_telemetry', 'Deep Scan Telemetry')}
                      </div>
                      <div className="text-[8px] text-cyan-500/40 font-mono uppercase">{t('common.neural_link_active', 'Neural Link: Active')}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-wider">
                          <Activity size={14} className="text-cyan-500/60" />
                          {t('common.freeze_frame', 'Freeze Frame Simulation')}
                        </div>
                        <div className="p-5 bg-black/60 rounded-2xl font-mono text-xs text-cyan-400/90 leading-relaxed border border-white/5 shadow-inner">
                          {result.technicalDetails.freezeFrameSimulation}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-wider">
                          <Cpu size={14} className="text-cyan-500/60" />
                          {t('common.comp_location', 'Component Location')}
                        </div>
                        <div className="p-5 bg-black/60 rounded-2xl font-mono text-xs text-cyan-400/90 leading-relaxed border border-white/5 shadow-inner">
                          {result.technicalDetails.componentLocation}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-wider">
                        <Zap size={14} className="text-cyan-500/60" />
                        {t('common.pinout_checks', 'Pinout & Continuity Checks')}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {result.technicalDetails.pinoutChecks.map((check, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-300 hover:bg-cyan-500/5 transition-colors group">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover:animate-pulse"></div>
                            <span className="leading-tight">{check}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Detailed Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={14} />
                      {t('common.symptoms', 'Common Symptoms')}
                    </div>
                    <ul className="space-y-2">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-cyan-500 mt-1">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-400/60 text-[10px] font-black uppercase tracking-widest">
                      <Zap size={14} />
                      {t('common.causes', 'Likely Causes')}
                    </div>
                    <ul className="space-y-2">
                      {result.commonCauses.map((c, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Cost & Actions */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[10px] font-black text-cyan-400/40 uppercase tracking-widest">{t('common.est_repair_cost', 'Estimated Repair Cost')}</span>
                    <div className="text-4xl font-black text-white">{result.estimatedCost}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <a 
                      href={getAmazonLink(result.partName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center gap-3 bg-white text-black font-black px-10 py-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <ShoppingCart size={20} />
                      <span className="uppercase tracking-tighter text-sm">{t('common.buy_part', 'BUY {{part}}', { part: result.partName })}</span>
                    </a>
                    <button className="group relative flex items-center justify-center gap-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-black px-10 py-5 rounded-2xl overflow-hidden transition-all hover:bg-cyan-500 hover:text-black active:scale-95">
                      <Truck size={20} />
                      <span className="uppercase tracking-tighter text-sm">{t('common.dispatch_mechanic', 'DISPATCH MECHANIC')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : input && !isSearching && !isDeepScanning && !error ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-12 border-2 border-dashed border-white/5 rounded-3xl"
              >
                <AlertTriangle className="mx-auto text-red-500/40 mb-4" size={48} />
                <p className="text-white/40 font-black uppercase tracking-widest text-sm">{t('common.awaiting_signature', 'Awaiting Neural Signature')}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Footer Stats */}
          <div className="flex justify-between items-center pt-12 border-t border-white/5 opacity-20">
            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="text-[8px] uppercase tracking-widest">{t('common.neural_uptime', 'Neural Uptime')}</div>
                <div className="text-xs font-bold">99.999%</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] uppercase tracking-widest">{t('common.processing', 'Processing')}</div>
                <div className="text-xs font-bold">{t('common.ai_driven', 'AI-DRIVEN')}</div>
              </div>
            </div>
            <div className="text-[8px] uppercase tracking-widest">{t('common.copyright', '© 2026 REPAIRWIZARD.NET')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OBDAnalyzer;
