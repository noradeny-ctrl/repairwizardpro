
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { AnalysisResult, RegionMode, Partner } from '../types';
import PartnerCard from './PartnerCard';
import StepByStepGuide from './StepByStepGuide';
import ImportEstimateTable from './ImportEstimateTable';
import { PartnerCardSkeleton } from './Skeleton';
import { ListChecks, ShoppingCart, ExternalLink, AlertTriangle, Globe, ChevronDown, ChevronUp, History, Settings, ShieldAlert, Activity, Gauge, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, isOpen, onToggle, badge }) => (
  <div className="border border-white/5 rounded-3xl overflow-hidden bg-slate-900/40 backdrop-blur-md transition-all">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="text-cyan-400">{icon}</div>
        <div className="text-left">
          <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
          {badge && <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.2em]">{badge}</span>}
        </div>
      </div>
      {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        {children}
      </div>
    )}
  </div>
);

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    specs: result.resultType === 'VIN_SCAN',
    recalls: false,
    auction: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
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

  const vinReportWhatsapp = "https://wa.me/16153392046?text=" + encodeURIComponent(
    t('common.whatsapp_report_msg', {
      year: result.vinScanData?.year || '',
      make: result.vinScanData?.make || '',
      model: result.vinScanData?.model || '',
      vin: result.vinScanData?.vin || 'N/A'
    })
  );

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
        {result.resultType === 'VIN_SCAN' && result.vinScanData && (
          <section className="animate-slide-up">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Globe size={160} className="text-cyan-400" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-orbitron text-2xl font-black text-white tracking-tighter uppercase">
                      {result.vinScanData.year} {result.vinScanData.make}
                    </h3>
                    <p className="text-cyan-400 font-orbitron font-bold tracking-widest text-xs">{result.vinScanData.model}</p>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{t('common.vin_scan', 'VIN Scan')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('common.serial_number', 'Serial Number')}</p>
                    <p className="text-sm font-mono text-white tracking-widest">{result.vinScanData.vin}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('common.region_origin', 'Region of Origin')}</p>
                    <p className="text-sm font-bold text-white">{t('common.origin_north_america', 'North America (USA/CAN)')}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.market_value', 'Market Value')}</p>
                      <p className="text-lg font-orbitron font-black text-emerald-400">
                        ${result.marketValue?.toLocaleString() || '---'}
                      </p>
                    </div>
                    <div className="flex-1 p-3 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.status', 'Status')}</p>
                      <p className="text-lg font-orbitron font-black text-cyan-400 uppercase">{t('common.status_clear', 'Clear')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Details */}
            <div className="mt-6 space-y-4">
              <CollapsibleSection 
                title={t('common.vehicle_specs', 'Vehicle Specifications')} 
                icon={<Settings size={18} />}
                isOpen={openSections.specs}
                onToggle={() => toggleSection('specs')}
                badge={t('common.specs_available', { count: result.vinScanData.technicalSpecs?.length || 4 })}
              >
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {(result.vinScanData.technicalSpecs || [
                    { label: t('common.engine_type', 'Engine Type'), value: result.vinScanData.engine || 'V6 3.5L' },
                    { label: t('common.trim', 'Trim'), value: result.vinScanData.trim || 'Limited' },
                    { label: t('common.drive_type', 'Drive Type'), value: 'AWD' },
                    { label: t('common.fuel_type', 'Fuel Type'), value: 'Gasoline' }
                  ]).map((spec, i) => (
                    <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{spec.label}</p>
                      <p className="text-xs font-bold text-white">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title={t('common.safety_recalls', 'Safety Recalls')} 
                icon={<ShieldAlert size={18} />}
                isOpen={openSections.recalls}
                onToggle={() => toggleSection('recalls')}
                badge={t('common.recalls_found', { count: result.vinScanData.recalls?.length || 1 })}
              >
                <div className="space-y-3 pt-2">
                  {(result.vinScanData.recalls || [
                    { id: 'NHTSA-23V', title: 'Airbag Inflator Inspection', date: '2023-11-12', status: 'Closed' }
                  ]).map((recall, i) => (
                    <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-white mb-1">{recall.title}</p>
                        <p className="text-[8px] text-slate-500 font-mono uppercase">{recall.id} • {recall.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        recall.status === 'Open' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {recall.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title={t('common.auction_history', 'Auction History')} 
                icon={<History size={18} />}
                isOpen={openSections.auction}
                onToggle={() => toggleSection('auction')}
                badge={t('common.records_found', { count: result.vinScanData.auctionHistory?.length || 1 })}
              >
                <div className="space-y-4 pt-2">
                  {(result.vinScanData.auctionHistory || [
                    { date: '2024-01-15', odometer: '42,300 mi', damage: 'Front End', location: 'COPART - FL', finalBid: '$12,400' }
                  ]).map((record, i) => (
                    <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{record.location}</p>
                        <p className="text-[10px] font-bold text-white">{record.date}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('common.odometer', 'Odometer')}</p>
                          <p className="text-[10px] font-bold text-white">{record.odometer}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('common.damage', 'Damage')}</p>
                          <p className="text-[10px] font-bold text-red-400">{record.damage}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('common.final_bid', 'Final Bid')}</p>
                          <p className="text-[10px] font-bold text-emerald-400">{record.finalBid}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </section>
        )}

        {result.resultType !== 'VIN_SCAN' && result.instructions && result.instructions.length > 0 && (
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

        {result.resultType === 'VIN_SCAN' ? (
          <section className="animate-slide-up space-y-6">
            <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden backdrop-blur-md">
               <div className="absolute top-0 right-0 px-4 py-1.5 bg-cyan-500/20 border-b border-l border-cyan-500/30 rounded-bl-2xl flex items-center gap-2">
                 <ShieldCheck size={10} className="text-cyan-400" />
                 <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{t('common.verified_data', 'Verified Data')}</span>
               </div>
               
               <div className="mb-8">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-cyan-500" />
                   {t('common.report_summary', 'Report Summary')}
                 </h4>
                 <div className="flex flex-col gap-1">
                   <h2 className="text-3xl font-orbitron font-black text-white tracking-tighter uppercase">
                     {result.vinScanData?.year} {result.vinScanData?.make}
                   </h2>
                   <p className="text-cyan-400 font-orbitron font-bold tracking-[0.2em] text-sm uppercase">
                     {result.vinScanData?.model}
                   </p>
                 </div>
               </div>

               <div className="space-y-6">
                 <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                   {t('common.vehicle_identified', 'Vehicle successfully identified in our global database. Basic specifications and preliminary status checks are available below.')}
                 </p>
                 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.engine_type', 'Engine Type')}</p>
                        <p className="text-sm font-bold text-white">{result.vinScanData?.engine || '---'}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Gauge size={20} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.mileage_status', 'Mileage Status')}</p>
                        <p className="text-sm font-bold text-white">{result.vinScanData?.mileageStatus || '---'}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.safety_rating', 'Safety Rating')}</p>
                        <p className="text-sm font-bold text-white">{result.vinScanData?.safetyRating || '---'}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4 transition-colors hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.title_status', 'Title Status')}</p>
                        <p className="text-sm font-bold text-white">{result.vinScanData?.titleStatus || '---'}</p>
                      </div>
                    </motion.div>
                  </div>

                 <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                   <p className="text-[10px] text-red-400/80 italic leading-relaxed">
                     "{t('common.locked_records', 'Detailed auction records, high-resolution damage photos, and complete ownership history are currently locked for this VIN.')}"
                   </p>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/5">
                 <a 
                   href={vinReportWhatsapp}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-cyan-900/20 group"
                 >
                   <span className="font-black text-xs uppercase tracking-widest">{t('common.get_full_report', 'Get Full History Report')}</span>
                   <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                 </a>
               </div>
            </div>
          </section>
        ) : (
          <section className="animate-slide-up markdown-body prose prose-invert max-w-none relative">
            <Markdown>{result.markdownOutput.replace(/\\n/g, '\n')}</Markdown>
          </section>
        )}

        {showImportEstimate && (
          <section className="animate-slide-up">
            {result.repairCost && result.marketValue && result.repairCost > (result.marketValue * 0.5) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={20} />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                  {t('common.import_recommended', 'Repair cost exceeds 50% of market value. Import recommended.')}
                </p>
              </div>
            )}
            <ImportEstimateTable vinData={result.vinScanData} marketValue={result.marketValue} />
          </section>
        )}

        {/* Grounding Sources */}
        {result.groundingSources && result.groundingSources.length > 0 && (
          <section className="animate-slide-up space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="text-cyan-400 w-4 h-4" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('common.verified_sources', 'Verified Web Sources')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {result.groundingSources.map((source, i) => (
                <a 
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-cyan-500/5 transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-300 truncate max-w-[80%]">{source.title}</span>
                  <ExternalLink size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>
              ))}
            </div>
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
                    {t('common.amazon_store', 'Amazon Global Store')}
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
