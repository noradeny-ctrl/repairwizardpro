
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Wrench, ShieldAlert, Target, Zap, Activity, ExternalLink, Clock, BarChart, Info, AlertTriangle } from 'lucide-react';
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
  const { t } = useTranslation();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [readyTools, setReadyTools] = useState<string[]>([]);
  const isRTL = mode !== RegionMode.WESTERN;

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleTool = (tool: string) => {
    setReadyTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const progress = Math.round((completedSteps.length / instructions.length) * 100);
  const toolsProgress = toolsNeeded.length > 0 ? Math.round((readyTools.length / toolsNeeded.length) * 100) : 100;

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

  const complexity = useMemo(() => {
    if (instructions.length > 15) return 'EXPERT';
    if (instructions.length > 8) return 'ADVANCED';
    return 'STANDARD';
  }, [instructions.length]);

  const totalEstTime = instructions.length * 5; // 5 mins per step avg

  return (
    <div className={`flex flex-col h-full bg-slate-950/40 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 space-y-8">
        {safetyWarning && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
              {safetyWarning}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.complexity')}</span>
              <span className="text-[10px] font-bold text-cyan-400">{t(`common.complexity_${complexity.toLowerCase()}`)}</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.est_time')}</span>
              <span className="text-[10px] font-bold text-cyan-400">{totalEstTime} {t('common.min')}</span>
            </div>
          </div>
        </div>

        {toolsNeeded.length > 0 && (
          <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2">
              <Wrench size={14} className="text-cyan-500" />
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{t('common.tools_title')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {toolsNeeded.map((tool, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300">
                  {tool}
                </div>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleStep(index)}
                className={`group relative p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                    : isCurrent
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-black transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-xs font-bold leading-relaxed transition-all ${
                      isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}>
                      {step}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepByStepGuide;
