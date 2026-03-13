
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Wrench, ShieldAlert, Target, Zap, Activity, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RegionMode } from '../types';

interface StepByStepGuideProps {
  instructions: string[];
  mode: RegionMode;
  onClose: () => void;
  safetyWarning?: string;
  toolsNeeded?: string[];
}

const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ instructions, mode, onClose, safetyWarning, toolsNeeded = [] }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isRTL = mode !== RegionMode.WESTERN;

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const progress = Math.round((completedSteps.length / instructions.length) * 100);

  useEffect(() => {
    if (progress === 100 && instructions.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [progress, instructions.length]);

  const firstUncompletedIndex = instructions.findIndex((_, i) => !completedSteps.includes(i));

  const getTitle = () => {
    if (mode === RegionMode.ARABIC) return 'دليل الخطوات التقنية';
    if (mode === RegionMode.BADINAN || mode === RegionMode.SORANI) return 'رێبەرێ گاڤ ب گاڤ';
    return 'TECHNICAL STEP-BY-STEP GUIDE';
  };

  const getToolsTitle = () => {
    if (mode === RegionMode.ARABIC) return 'الأدوات المطلوبة';
    if (mode === RegionMode.BADINAN || mode === RegionMode.SORANI) return 'ئامرازێن پێدڤی';
    return 'REQUIRED EQUIPMENT';
  };

  const getAmazonToolUrl = (tool: string) => {
    const storeId = import.meta.env.VITE_AMAZON_STORE_ID || 'repairwizar0d-20';
    return `https://www.amazon.com/s?k=${encodeURIComponent(tool)}&tag=${storeId}`;
  };

  const getSafetyTitle = () => {
    if (mode === RegionMode.ARABIC) return 'تنبيه سلامة حرج';
    if (mode === RegionMode.BADINAN || mode === RegionMode.SORANI) return 'ئاگەهدارییا سلامەتیێ';
    return 'CRITICAL SAFETY ALERT';
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0f1e] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-6 py-6 flex justify-between items-center border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex flex-col">
          <h2 className="font-black text-[10px] tracking-[0.3em] uppercase text-cyan-500 mb-2">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
             </div>
             <span className="text-[10px] font-black text-cyan-400 font-mono tracking-tighter">{progress}%</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-white bg-white/5 border border-white/10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {safetyWarning && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex gap-4 items-start animate-pulse">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <div>
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{getSafetyTitle()}</h4>
              <p className="text-xs text-red-200/80 leading-relaxed">{safetyWarning}</p>
            </div>
          </div>
        )}

        {toolsNeeded.length > 0 && (
          <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2">
              <Wrench size={14} className="text-cyan-500" />
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{getToolsTitle()}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {toolsNeeded.map((tool, i) => (
                <a 
                  key={i}
                  href={getAmazonToolUrl(tool)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 hover:border-orange-500/50 hover:text-orange-400 transition-all flex items-center gap-2 group"
                >
                  {tool}
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {instructions.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === firstUncompletedIndex;
            
            return (
              <motion.div 
                key={index}
                layout
                initial={false}
                animate={{ 
                  scale: isCompleted ? 0.98 : isCurrent ? 1.02 : 1,
                  opacity: isCompleted ? 0.7 : 1,
                  borderColor: isCurrent ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.05)'
                }}
                className={`group flex flex-col gap-4 p-5 rounded-[2rem] border transition-all select-none relative overflow-hidden ${
                  isCompleted 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : isCurrent
                      ? 'bg-cyan-500/5 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                      : 'bg-slate-800/40 border-white/5 hover:border-cyan-500/30'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 animate-pulse" />
                )}

                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleStep(index)}>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 relative ${
                    isCompleted 
                      ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                      : isCurrent
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                  }`}>
                    {isCurrent && !isCompleted && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute -inset-1 border border-cyan-500/50 rounded-2xl"
                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle2 size={20} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="number"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          {isCurrent ? <Target size={18} className="animate-pulse" /> : <span className="text-xs font-black font-mono">{index + 1}</span>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isCurrent && !isCompleted && (
                        <span className="text-[8px] font-black bg-cyan-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                          Active Task
                        </span>
                      )}
                      <span className={`text-[9px] font-mono font-bold ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                        STEP_{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed transition-all ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="h-24" />
      </div>

      {/* Footer Action */}
      <div className="p-8 bg-gradient-to-t from-[#0a0f1e] to-transparent">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl relative overflow-hidden">
          {progress === 100 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
            />
          )}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${progress === 100 ? 'bg-emerald-500/20' : 'bg-cyan-500/10'}`}>
              {progress === 100 ? <Zap className="text-emerald-400" size={18} /> : <Activity className="text-cyan-400" size={18} />}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${progress === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {progress === 100 ? 'System Restored' : 'Protocol Status'}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {completedSteps.length}/{instructions.length} <span className="opacity-50">VERIFIED_NODES</span>
              </p>
            </div>
          </div>
          <AnimatePresence>
            {progress === 100 ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Mission Complete
              </motion.div>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 mb-1">REMAINING</span>
                <span className="text-sm font-bold text-white font-mono">{instructions.length - completedSteps.length}</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StepByStepGuide;
