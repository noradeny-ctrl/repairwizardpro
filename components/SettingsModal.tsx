
import React, { useState, useEffect } from 'react';
import { X, Shield, Key, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const { t } = useTranslation();
  const [key, setKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(currentKey);
      setIsSaved(false);
    }
  }, [isOpen, currentKey]);

  const handleSave = () => {
    onSave(key);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0D1117] border border-cyan-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('settings.title')}</h2>
                    <p className="text-[10px] font-black tracking-widest text-cyan-500/60 uppercase">{t('settings.protocol')}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    {t('settings.disclaimer')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase ml-1">
                    {t('settings.api_key_label')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showKey ? "text" : "password"}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder={t('settings.api_key_placeholder')}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase"
                    >
                      {showKey ? t('settings.hide') : t('settings.show')}
                    </button>
                  </div>
                  {currentKey && !key && (
                    <p className="text-[9px] text-red-400/60 mt-1 ml-1 italic">{t('settings.warning_clear')}</p>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isSaved 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">{t('settings.calibrated')}</span>
                    </>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-widest">{t('settings.save_config')}</span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-medium">{currentKey ? t('settings.status_ready') : t('settings.status_awaiting')}</span>
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] text-cyan-400 hover:underline"
              >
                {t('settings.get_key')}
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
