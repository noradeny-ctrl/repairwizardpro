
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Shield, Zap, Cpu, Search, Database } from 'lucide-react';

const ProtocolInitialization: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const steps = [
    { icon: <Cpu size={20} />, label: t('common.core_system_boot'), color: 'text-cyan-400' },
    { icon: <Database size={20} />, label: t('common.database_sync_init'), color: 'text-emerald-400' },
    { icon: <Search size={20} />, label: t('common.neural_pattern_scan'), color: 'text-amber-400' },
    { icon: <Shield size={20} />, label: t('common.safety_protocol_verify'), color: 'text-red-400' },
    { icon: <Zap size={20} />, label: t('common.wizard_logic_engaged'), color: 'text-purple-400' },
    { icon: <Activity size={20} />, label: t('common.finalizing_protocol'), color: 'text-cyan-400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 600); // Faster step transition
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#0a0f1e]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-0"
      />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <div className="relative mb-12">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center"
          >
            <div className="w-40 h-40 rounded-full border border-cyan-500/40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-cyan-500/5 flex items-center justify-center animate-pulse">
                <Activity className="text-cyan-500" size={48} />
              </div>
            </div>
          </motion.div>
          
          {/* Orbiting Nodes */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </motion.div>
          ))}
        </div>

        <div className="w-full space-y-6">
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-500 mb-2">
              {t('common.start_analysis')}
            </h2>
            <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
            <AnimatePresence mode="wait">
              <motion.div 
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center ${steps[step].color} border border-white/5`}>
                  {steps[step].icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('common.system_status')}</p>
                  <p className={`text-sm font-mono font-bold ${steps[step].color}`}>
                    {steps[step].label}...
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-500/50">
                  [OK]
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{t('common.latency')}</p>
              <p className="text-xs font-mono text-emerald-400">12ms</p>
            </div>
            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{t('common.wizard_load')}</p>
              <p className="text-xs font-mono text-cyan-400">0.82%</p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[9px] font-mono text-slate-600 uppercase tracking-widest animate-pulse">
          {t('common.do_not_disconnect')}
        </p>
      </div>
    </div>
  );
};

export default ProtocolInitialization;
