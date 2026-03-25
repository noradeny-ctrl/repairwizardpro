
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResult, RegionMode, Partner } from '../types';
import PartnerCard from './PartnerCard';

interface ResultViewProps {
  result: AnalysisResult;
  mode: RegionMode;
  onReset: () => void;
  recommendedPartners?: Partner[];
}

const ResultView: React.FC<ResultViewProps> = ({ result, mode, onReset, recommendedPartners = [] }) => {
  const { t } = useTranslation();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isKurdish = result.isKurdish;
  const isArabic = mode === RegionMode.ARABIC;
  const isRTL = isKurdish || isArabic;
  
  const toggleStep = (index: number) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const progress = Math.round((completedSteps.length / result.instructions.length) * 100);

  const getHeaderLabel = () => {
    if (result.resultType === 'TEST') return t('common.diagnostic_protocol');
    if (result.resultType === 'LEARN') return t('common.knowledge_transfer');
    return t('common.repair_sequence');
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0f1e] overflow-hidden ${isRTL ? 'rtl text-right' : 'ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 py-6 flex justify-between items-center border-b border-white/5 bg-slate-900/40 backdrop-blur-ultra sticky top-0 z-50">
        <div className="flex flex-col">
          <h2 className="font-black text-[10px] tracking-[0.3em] uppercase text-cyan-500 mb-2">
            {t('common.wizard_report')}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-700 glow-cyan" style={{ width: `${progress}%` }}></div>
             </div>
             <span className="text-[10px] font-black text-cyan-400 font-mono tracking-tighter">{progress}%</span>
          </div>
        </div>
        <button onClick={onReset} className="text-white bg-white/5 border border-white/10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90">
          ✕
        </button>
      </div>

      <div className="flex-1 p-6 space-y-10 overflow-y-auto pb-48 hide-scrollbar">
        <section className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">{t('common.technical_diagnosis')}</p>
            {/^[PCBU][0-9]{4}/i.test(result.diagnosis) && (
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-md text-[8px] font-black text-amber-400 uppercase tracking-widest">OBD-II</span>
            )}
          </div>
          <h3 className="text-3xl font-black tracking-tighter leading-[1.1] text-white mb-5">{result.diagnosis}</h3>
          
          {result.safetyWarning && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[1.75rem] flex gap-4 items-center shadow-xl">
              <span className="text-2xl">⚠️</span>
              <p className="text-xs font-black text-red-400 leading-relaxed italic tracking-tight uppercase">{result.safetyWarning}</p>
            </div>
          )}
        </section>

        {/* Partners Integrated Directly into Diagnosis Section */}
        {recommendedPartners.length > 0 && (
          <section className="animate-slide-up space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{t('common.verified_experts')}</p>
            </div>
            <div className="space-y-4">
              {recommendedPartners.map(p => (
                <PartnerCard key={p.id} partner={p} mode={mode} hideImage={true} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-white/[0.03] border border-white/5 rounded-[2.25rem] p-6 shadow-inner animate-slide-up">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5">{t('common.toolkit')}</p>
          <div className="flex flex-wrap gap-2.5">
            {result.toolsNeeded.map((tool, i) => (
              <span key={i} className="px-3.5 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-[10px] font-black text-cyan-300/80 uppercase tracking-wider flex items-center gap-2">
                <span className="text-sm">🔧</span> {tool}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-[2.5rem] p-7 border border-white/10 shadow-2xl animate-slide-up">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">{t('common.critical_component')}</p>
          <h4 className="text-2xl font-black text-white leading-tight mb-4">{result.partName}</h4>
        </section>

        <section className="space-y-6 animate-slide-up">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">{getHeaderLabel()}</p>
          
          <div className="space-y-4">
            {result.instructions.map((step, i) => {
              const isDone = completedSteps.includes(i);
              return (
                <div 
                  key={i} 
                  onClick={() => toggleStep(i)} 
                  className={`flex gap-5 items-start p-6 rounded-[2rem] border transition-all cursor-pointer ${isDone ? 'bg-cyan-600/10 border-cyan-500/30 opacity-60' : 'bg-white/[0.02] border-white/5 shadow-xl hover:bg-white/[0.04]'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all duration-300 ${isDone ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <p className={`text-sm leading-relaxed font-medium transition-colors duration-300 ${isDone ? 'text-cyan-300' : 'text-slate-300'}`}>{step}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2.5rem] border border-white/5 animate-slide-up">
          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4">{t('common.expert_insight')}</p>
          <p className="text-slate-200 text-sm leading-relaxed font-bold italic">"{result.tip}"</p>
        </section>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent pt-24">
         <button onClick={onReset} className="w-full py-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.25rem] text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl active:scale-95 transition-all">
          {t('common.reset')}
         </button>
      </div>
    </div>
  );
};

export default ResultView;
