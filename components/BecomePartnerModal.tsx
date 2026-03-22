
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Send, Building2, User, Mail, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db, collection, setDoc, doc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from './FirebaseProvider';

interface BecomePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomePartnerModal: React.FC<BecomePartnerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, login } = useFirebase();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    fullName: '',
    email: '',
    phone: ''
  });

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const applicationRef = doc(collection(db, 'partnerApplications'));
      const applicationData = {
        ...formData,
        userId: user?.uid || null,
        status: 'pending',
        submittedAt: Timestamp.now()
      };
      
      await setDoc(applicationRef, applicationData);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Partner Application Error:", err);
      setError(t('common.submission_error', 'Failed to submit application. Please try again.'));
      // We don't re-throw here to avoid unhandled rejections in the UI
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
            {/* Header Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <ShieldCheck className="text-cyan-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      {t('common.partner_form_title')}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Wizard Elite Network
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {!submitted ? (
                <div className="space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {t('common.partner_form_desc')}
                  </p>

                  {!user ? (
                    <div className="p-8 bg-black/40 border border-white/5 rounded-3xl text-center space-y-4">
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                        <User className="text-cyan-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Login Required</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Please login to apply for partnership</p>
                      </div>
                      <button
                        onClick={login}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                      >
                        Login with Google
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                          <p className="text-xs text-red-400 font-medium">{error}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                          <input
                            required
                            type="text"
                            placeholder={t('common.company_name')}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          />
                        </div>

                        <div className="relative group">
                          <select
                            required
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-sm text-white focus:border-cyan-500/50 focus:ring-0 transition-all appearance-none"
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          >
                            <option value="" disabled>{t('common.business_type')}</option>
                            <option value="auction">{t('common.auction_house')}</option>
                            <option value="logistics">{t('common.logistics_provider')}</option>
                            <option value="technical">{t('common.technical_expert')}</option>
                            <option value="oem">{t('common.oem_partner')}</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                              required
                              type="text"
                              placeholder={t('common.full_name')}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                          </div>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                              required
                              type="tel"
                              placeholder={t('common.phone_number')}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                          <input
                            required
                            type="email"
                            placeholder={t('common.email_address')}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group mt-4 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        )}
                        <span className="uppercase tracking-tighter">
                          {isSubmitting ? t('common.analyzing', 'Analyzing...') : t('common.submit_application')}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="text-emerald-400" size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase mb-2">
                      {t('common.application_sent')}
                    </h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                      {t('common.application_sent_desc')}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    {t('common.close')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )}
  </AnimatePresence>
);
};
