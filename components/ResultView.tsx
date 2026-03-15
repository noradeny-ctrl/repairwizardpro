
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { AnalysisResult, RegionMode, Partner } from '../types';
import PartnerCard from './PartnerCard';
import StepByStepGuide from './StepByStepGuide';
import ImportEstimateTable from './ImportEstimateTable';
import { PartnerCardSkeleton } from './Skeleton';
import { ListChecks, ShoppingCart, ExternalLink, AlertTriangle } from 'lucide-react';

interface ResultViewProps {
  result: AnalysisResult;
  mode: RegionMode;
  onReset: () => void;
  recommendedPartners?: Partner[];
  isPartnersLoading?: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ 
  result, 
  mode, 
  onReset, 
  recommendedPartners = [],
  isPartnersLoading = false
}) => {
  const { t } = useTranslation();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isKurdish = result.isKurdish;
  const isArabic = mode === RegionMode.ARABIC;
  const isRTL = isKurdish || isArabic;
  
  const showImportEstimate = result.resultType === 'VIN_SCAN' || 
    (result.repairCost && result.marketValue && result.repairCost > (result.marketValue * 0.5));

  const getAmazonUrl = () => {
    const storeId = import.meta.env.VITE_AMAZON_STORE_ID || 'repairwizar0d-20';
    const query = encodeURIComponent(result.partName || 'car parts');
    return `https://www.amazon.com/s?k=${query}&tag=${storeId}`;
  };

  const getAmazonLabel = () => {
    return t('common.shop_parts');
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
            <div className="border border-cyan-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cyan-900/20">
              <StepByStepGuide 
                instructions={result.instructions} 
                mode={mode} 
                onClose={() => {}} 
                safetyWarning={result.safetyWarning}
                toolsNeeded={result.toolsNeeded}
              />
            </div>
          </section>
        )}

        <section className="animate-slide-up markdown-body prose prose-invert max-w-none">
          <Markdown>{result.markdownOutput.replace(/\\n/g, '\n')}</Markdown>
        </section>

        {showImportEstimate && (
          <section className="animate-slide-up">
            {result.repairCost && result.marketValue && result.repairCost > (result.marketValue * 0.5) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={20} />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                  Repair cost exceeds 50% of market value. Import recommended.
                </p>
              </div>
            )}
            <ImportEstimateTable vinData={result.vinScanData} marketValue={result.marketValue} />
          </section>
        )}

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
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
                    {mode === RegionMode.BADINAN ? 'کۆگەها جیهانی یا ئەمەزۆن' : 'Amazon Global Store'}
                  </p>
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
        {(isPartnersLoading || recommendedPartners.length > 0) && (
          <section className="animate-slide-up space-y-6">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isPartnersLoading ? 'animate-ping' : 'animate-pulse'}`}></span>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{t('common.verified_experts')}</p>
            </div>
            <div className="space-y-4">
              {isPartnersLoading ? (
                <>
                  <PartnerCardSkeleton />
                  <PartnerCardSkeleton />
                </>
              ) : (
                recommendedPartners.map(p => (
                  <PartnerCard key={p.id} partner={p} mode={mode} hideImage={true} />
                ))
              )}
            </div>
          </section>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent pt-24 z-50">
         <button onClick={onReset} className="w-full py-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.25rem] text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl active:scale-95 transition-all">
          {t('common.reset')}
         </button>
      </div>

    </div>
  );
};

export default ResultView;
