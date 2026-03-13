
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AnalysisResult, RegionMode, Partner } from '../types';
import PartnerCard from './PartnerCard';
import StepByStepGuide from './StepByStepGuide';
import { ListChecks } from 'lucide-react';

interface ResultViewProps {
  result: AnalysisResult;
  mode: RegionMode;
  onReset: () => void;
  onOpenWizardDirect: () => void;
  recommendedPartners?: Partner[];
}

const ResultView: React.FC<ResultViewProps> = ({ result, mode, onReset, onOpenWizardDirect, recommendedPartners = [] }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isKurdish = result.isKurdish;
  const isArabic = mode === RegionMode.ARABIC;
  const isRTL = isKurdish || isArabic;
  
  const getResetLabel = () => {
    return 'Initialize New Protocol';
  };

  const getPartnerLabel = () => {
    if (isArabic) return 'خبراء معتمدون لهذه المشكلة';
    if (isKurdish) return 'هۆستایێن پشتڕاستکری بۆ ڤێ ئاریشێ';
    return 'VERIFIED EXPERTS FOR THIS PROBLEM';
  };

  const getImportLabel = () => {
    if (isArabic) return 'استيراد عبر ويزارد دایرێکت';
    if (isKurdish) return 'هاوردەکرن ب رێکا ویزارد دایرێکت';
    return 'IMPORT VIA WIZARD DIRECT';
  };

  const getGuideLabel = () => {
    if (isArabic) return 'عرض دليل الخطوات';
    if (isKurdish) return 'دیتنا رێبەرێ گاڤ ب گاڤ';
    return 'VIEW STEP-BY-STEP GUIDE';
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0f1e] overflow-hidden ${isRTL ? 'rtl text-right' : 'ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 py-6 flex justify-between items-center border-b border-white/5 bg-slate-900/40 backdrop-blur-ultra sticky top-0 z-50">
        <div className="flex flex-col">
          <h2 className="font-black text-[10px] tracking-[0.3em] uppercase text-cyan-500 mb-2">
            {isArabic ? 'تقرير الخبير' : isKurdish ? 'ڕاپۆرتا هۆستای' : 'WIZARD REPORT'}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-700 glow-cyan" style={{ width: '100%' }}></div>
             </div>
             <span className="text-[10px] font-black text-cyan-400 font-mono tracking-tighter">100%</span>
          </div>
        </div>
        <button onClick={onReset} className="text-white bg-white/5 border border-white/10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90">
          ✕
        </button>
      </div>

      <div className="flex-1 p-6 space-y-10 overflow-y-auto pb-48 hide-scrollbar">
        {result.instructions && result.instructions.length > 0 && (
          <section className="animate-slide-up space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">TECHNICAL PROTOCOL (20 STEPS)</p>
              </div>
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
              >
                {isArabic ? 'فتح الوضع التفاعلي' : isKurdish ? 'ڤەکرنا بارێ کارلێکەر' : 'OPEN INTERACTIVE MODE'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {result.instructions.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black font-mono text-cyan-500 border border-white/5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="animate-slide-up markdown-body prose prose-invert max-w-none">
          <Markdown>{result.markdownOutput}</Markdown>
        </section>

        {/* Partners Integrated Directly into Diagnosis Section */}
        {recommendedPartners.length > 0 && (
          <section className="animate-slide-up space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{getPartnerLabel()}</p>
            </div>
            <div className="space-y-4">
              {recommendedPartners.map(p => (
                <PartnerCard key={p.id} partner={p} mode={mode} hideImage={true} />
              ))}
            </div>
          </section>
        )}

        {result.wizardDirectPitch && (
          <section className="animate-slide-up bg-cyan-500/10 border border-cyan-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🇺🇸</div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-4">🇺🇸 WIZARD DIRECT RECOMMENDATION</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {isArabic 
                ? "تكلفة الإصلاح مرتفعة جداً. نوصي باستيراد سيارة نظيفة مباشرة من الولايات المتحدة." 
                : isKurdish 
                  ? "بهایێ چاککرنێ گەلەک یێ بلندە. ئەم پێشنیار دکەین تومبێلەکا پاقژ ژ ئەمریکا هاوردە بکەی." 
                  : "Repair costs are excessive. We recommend importing a clean title vehicle directly from the USA."}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onOpenWizardDirect}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-cyan-900/20 font-black text-[10px] uppercase tracking-[0.2em]"
              >
                {getImportLabel()}
              </button>
              <a 
                href="https://wa.me/16153392046" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-900/20 font-black text-[10px] uppercase tracking-[0.2em]"
              >
                💬 WhatsApp Broker
              </a>
            </div>
          </section>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent pt-24">
         <button onClick={onReset} className="w-full py-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.25rem] text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl active:scale-95 transition-all">
          {getResetLabel()}
         </button>
      </div>

      {isGuideOpen && (
        <div className="fixed inset-0 z-[110] animate-modal-enter">
          <StepByStepGuide 
            instructions={result.instructions} 
            mode={mode} 
            onClose={() => setIsGuideOpen(false)} 
            safetyWarning={result.safetyWarning}
          />
        </div>
      )}
    </div>
  );
};

export default ResultView;
