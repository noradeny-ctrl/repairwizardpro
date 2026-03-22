
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardIcon from './WizardIcon';
import { useTranslation } from 'react-i18next';
import { Camera, WifiOff, ShieldAlert, ZapOff, AlertTriangle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  category?: string;
  onRetry: () => void;
  onBack: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, title, message, category, onRetry, onBack }) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (category) {
      case 'validation':
        return <Camera size={32} className="text-cyan-400" />;
      case 'network':
        return <WifiOff size={32} className="text-red-400" />;
      case 'quota':
        return <ZapOff size={32} className="text-amber-400" />;
      case 'safety':
        return <ShieldAlert size={32} className="text-red-400" />;
      default:
        return <WizardIcon size={48} className="text-cyan-400" />;
    }
  };

  const getGlowColor = () => {
    switch (category) {
      case 'validation': return 'bg-cyan-500/10';
      case 'quota': return 'bg-amber-500/10';
      default: return 'bg-red-500/10';
    }
  };

  const getTitleColor = () => {
    switch (category) {
      case 'validation': return 'text-cyan-400';
      case 'quota': return 'text-amber-400';
      default: return 'text-red-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-[#05070a]/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 ${getGlowColor()} blur-[60px] pointer-events-none`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon in Circle */}
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5 mb-6 shadow-xl">
                {getIcon()}
              </div>

              <h2 className={`text-lg font-black ${getTitleColor()} uppercase tracking-widest mb-3`}>
                {title}
              </h2>
              
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed mb-8 px-4">
                {message}
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={onRetry}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 border border-white/5"
                >
                  {t('common.retry_connection', 'RETRY CONNECTION')}
                </button>
                
                <button
                  onClick={onBack}
                  className="w-full py-4 bg-transparent hover:bg-white/5 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                >
                  {t('common.back_to_dashboard', 'BACK TO DASHBOARD')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
