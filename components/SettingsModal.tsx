
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, ShieldCheck, Clock, Save, Loader2, Camera, Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { db, collection, query, where, getDocs, doc, getDoc, handleFirestoreError, OperationType } from '../firebase';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, userProfile, updateUserProfile } = useFirebase();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    setFetchingData(true);
    try {
      // 1. Fetch Application Status
      const q = query(collection(db, 'partnerApplications'), where('userId', '==', user?.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setApplication(snapshot.docs[0].data());
      }

      // 2. Fetch Partner Data (if approved)
      if (userProfile?.role === 'partner') {
        const partnerRef = doc(db, 'partners', user?.uid || '');
        const partnerDoc = await getDoc(partnerRef);
        if (partnerDoc.exists()) {
          setPartnerData(partnerDoc.data());
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'partnerApplications/partners');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await updateUserProfile({ displayName, photoURL });
      setMessage({ type: 'success', text: t('settings.profile_updated', 'Profile updated successfully!') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: t('settings.update_failed', 'Failed to update profile.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[310]"
          >
            <div className="p-8 max-h-[80vh] overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-cyan-400" />
                  {t('settings.title', 'Account Settings')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Profile Section */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                    {t('settings.profile_info', 'Profile Information')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                        {t('settings.display_name', 'Display Name')}
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                        {t('settings.photo_url', 'Photo URL')}
                      </label>
                      <div className="relative group">
                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                          value={photoURL}
                          onChange={(e) => setPhotoURL(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-500" size={18} />
                      <span className="text-sm text-slate-300">{user?.email}</span>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {t('settings.save_changes', 'Save Changes')}
                    </button>
                  </div>
                </section>

                {/* Status Section */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                    {t('settings.application_status', 'Partner Status')}
                  </h3>

                  {fetchingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="text-cyan-500 animate-spin" />
                    </div>
                  ) : application ? (
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                            <Building2 className="text-cyan-400" size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-white uppercase tracking-tight">{application.companyName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{application.businessType}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                          application.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          application.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {application.status === 'pending' && <Clock size={10} />}
                          {application.status === 'approved' && <CheckCircle2 size={10} />}
                          {application.status === 'rejected' && <XCircle size={10} />}
                          {application.status}
                        </div>
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                          <AlertCircle size={14} className="text-amber-500" />
                          <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest">
                            {t('settings.pending_notice', 'Your application is currently under review by our team.')}
                          </p>
                        </div>
                      )}

                      {partnerData && (
                        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('settings.subscription_expiry', 'Subscription Expiry')}</span>
                            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                              <Clock size={12} />
                              {partnerData.subscription_end_date}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('settings.verification_status', 'Verification')}</span>
                            <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                              <ShieldCheck size={12} />
                              {partnerData.is_verified ? 'Verified Partner' : 'Pending Verification'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                        {t('settings.no_application', 'You haven\'t applied to be a partner yet.')}
                      </p>
                    </div>
                  )}
                </section>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
