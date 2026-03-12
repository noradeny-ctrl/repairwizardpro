
import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Wrench, ShieldAlert } from 'lucide-react';
import { RegionMode } from '../types';

interface StepByStepGuideProps {
  instructions: string[];
  mode: RegionMode;
  onClose: () => void;
  safetyWarning?: string;
}

const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ instructions, mode, onClose, safetyWarning }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isRTL = mode !== RegionMode.WESTERN;

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const progress = Math.round((completedSteps.length / instructions.length) * 100);

  const getTitle = () => {
    if (mode === RegionMode.ARABIC) return 'دليل الخطوات التقنية';
    if (mode === RegionMode.BADINAN || mode === RegionMode.SORANI) return 'رێبەرێ گاڤ ب گاڤ';
    return 'TECHNICAL STEP-BY-STEP GUIDE';
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
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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

        <div className="space-y-3">
          {instructions.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            return (
              <div 
                key={index}
                onClick={() => toggleStep(index)}
                className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer select-none ${
                  isCompleted 
                    ? 'bg-cyan-500/10 border-cyan-500/30 opacity-60' 
                    : 'bg-slate-800/40 border-white/5 hover:border-cyan-500/30'
                }`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <span className="text-xs font-black font-mono">{index + 1}</span>}
                </div>
                <p className={`text-sm leading-relaxed transition-all ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        <div className="h-24" />
      </div>

      {/* Footer Action */}
      <div className="p-8 bg-gradient-to-t from-[#0a0f1e] to-transparent">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Wrench className="text-cyan-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Protocol Status</p>
              <p className="text-xs text-slate-400">{completedSteps.length} of {instructions.length} steps verified</p>
            </div>
          </div>
          {progress === 100 && (
            <div className="animate-bounce bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter">
              Mission Complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepByStepGuide;
