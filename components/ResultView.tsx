
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AnalysisResult, RegionMode, Partner } from '../types';
import PartnerCard from './PartnerCard';
import StepByStepGuide from './StepByStepGuide';
import { ListChecks, ShoppingCart, ExternalLink } from 'lucide-react';

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

  const getAmazonUrl = () => {
    const storeId = import.meta.env.VITE_AMAZON_STORE_ID || 'repairwizar0d-20';
    const query = encodeURIComponent(result.partName || 'car parts');
    return `https://www.amazon.com/s?k=${query}&tag=${storeId}`;
  };

  const getAmazonLabel = () => {
    if (isArabic) return 'تسوق قطع الغيار الأصلية';
    if (isKurdish) return 'کڕینا پارچەیێن رەسەن';
    return 'SHOP GENUINE REPLACEMENT PARTS';
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
          <section className="animate-slide-up">
            {isGuideOpen ? (
              <div className="border border-cyan-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cyan-900/20">
                <StepByStepGuide 
                  instructions={result.instructions} 
                  mode={mode} 
                  onClose={() => setIsGuideOpen(false)} 
                  safetyWarning={result.safetyWarning}
                  toolsNeeded={result.toolsNeeded}
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsGuideOpen(true)}
                className="w-full p-8 bg-gradient-to-br from-cyan-600/20 to-cyan-900/40 border-2 border-cyan-500/50 rounded-[2.5rem] flex items-center justify-between group hover:from-cyan-500/30 hover:to-cyan-800/50 transition-all duration-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.25)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-500">
                    <ListChecks size={32} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2 animate-pulse">Interactive Protocol</p>
                    <p className="text-xl font-black text-white tracking-tight group-hover:text-cyan-100 transition-colors">{getGuideLabel()}</p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-all duration-500 group-hover:bg-cyan-500 group-hover:text-white ${isRTL ? 'rotate-180' : 'group-hover:translate-x-2'}`}>
                  <ListChecks size={24} />
                </div>
              </button>
            )}
          </section>
        )}

        <section className="animate-slide-up markdown-body prose prose-invert max-w-none">
          <Markdown>{result.markdownOutput.replace(/\\n/g, '\n')}</Markdown>
        </section>

        {/* Amazon Affiliate Section */}
        {result.partName && (
          <section className="animate-slide-up">
            <a 
              href={getAmazonUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-6 bg-gradient-to-r from-orange-500/10 to-orange-900/20 border border-orange-500/30 rounded-[2rem] flex items-center justify-between group hover:from-orange-500/20 hover:to-orange-900/30 transition-all shadow-xl shadow-orange-900/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <ShoppingCart size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Amazon Global Store</p>
                  <p className="text-sm font-bold text-white">{getAmazonLabel()}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <ExternalLink size={18} />
              </div>
            </a>
          </section>
        )}

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
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent pt-24 z-50">
         <button onClick={onReset} className="w-full py-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.25rem] text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl active:scale-95 transition-all">
          {getResetLabel()}
         </button>
      </div>

    </div>
  );
};

export default ResultView;
