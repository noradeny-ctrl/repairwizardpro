import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History as HistoryIcon, Activity, Wrench, Clock, ChevronRight, Search, Filter, Trash2, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
import { db, collection, query, where, getDocs, orderBy, deleteDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from './FirebaseProvider';
import { useTranslation } from 'react-i18next';

interface PartnerDashboardProps {
  onClose: () => void;
}

export const UserDashboard: React.FC<PartnerDashboardProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user, userProfile, isAdmin } = useFirebase();
  const [scans, setScans] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scans' | 'repairs' | 'history'>('scans');

  const isPartner = userProfile?.role === 'partner' || isAdmin;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Scans
        const scansQuery = query(
          collection(db, 'scans'),
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const scansSnapshot = await getDocs(scansQuery);
        setScans(scansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Repairs
        const repairsQuery = query(
          collection(db, 'repairs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const repairsSnapshot = await getDocs(repairsQuery);
        setRepairs(repairsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Status History (Only for partners or admins)
        if (isPartner) {
          const historyQuery = query(
            collection(db, 'partners', user.uid, 'statusHistory'),
            orderBy('timestamp', 'desc')
          );
          const historySnapshot = await getDocs(historyQuery);
          setStatusHistory(historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'scans/repairs');
        } catch (fsErr: any) {
          setError(fsErr.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(err => console.error("Failed to fetch dashboard data:", err));
  }, [user, isPartner]);

  const handleDelete = async (collectionName: string, id: string) => {
    if (!window.confirm(t('common.confirm_delete', 'Are you sure you want to delete this record?'))) return;
    
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName === 'scans') {
        setScans(prev => prev.filter(s => s.id !== id));
      } else {
        setRepairs(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, collectionName);
      } catch (fsErr: any) {
        setError(fsErr.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl h-[80vh] bg-[#0d1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <HistoryIcon className="text-cyan-400" />
              {t('common.history_dashboard', 'History Dashboard')}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
              {t('common.manage_history', 'Manage your diagnostic & repair history')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 pt-4 gap-4 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('scans')}
            className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'scans' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t('common.obd_scans', 'OBD Scans')}
            {activeTab === 'scans' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
          </button>
          <button 
            onClick={() => setActiveTab('repairs')}
            className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'repairs' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t('common.repair_history', 'Repair History')}
            {activeTab === 'repairs' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
          </button>
          {isPartner && (
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t('common.status_history', 'Status History')}
              {activeTab === 'history' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 hide-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 mb-4">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Activity className="text-cyan-400 animate-spin" size={40} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                {t('common.loading_history', 'Loading History...')}
              </p>
            </div>
          ) : activeTab === 'scans' ? (
            scans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scans.map((scan) => (
                  <div key={scan.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-cyan-500/20 rounded-lg text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                        {scan.code}
                      </div>
                      <button 
                        onClick={() => handleDelete('scans', scan.id)}
                        className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{scan.partName}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mb-4">{scan.translation}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase">
                        <Clock size={10} />
                        {new Date(scan.timestamp?.toDate()).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {scan.estimatedCost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <HistoryIcon size={60} className="text-slate-700" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {t('common.no_scans_found', 'No OBD scans found')}
                </p>
              </div>
            )
          ) : activeTab === 'repairs' ? (
            repairs.length > 0 ? (
              <div className="space-y-4">
                {repairs.map((repair) => (
                  <div key={repair.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                          <Activity size={20} />
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {new Date(repair.createdAt).toLocaleDateString()}
                          </div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            {repair.status}
                          </h3>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete('repairs', repair.id)}
                        className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2">Issue Description</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{repair.issueDescription}</p>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">AI Diagnosis</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{repair.aiDiagnosis}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <HistoryIcon size={60} className="text-slate-700" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {t('common.no_repairs_found', 'No repair history found')}
                </p>
              </div>
            )
          ) : (
            statusHistory.length > 0 ? (
              <div className="space-y-4">
                {statusHistory.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Just now'}
                          </div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            {item.status ? 'Verified' : 'Unverified'}
                          </h3>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Admin: {item.adminEmail}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{item.reason || 'No reason provided'}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <HistoryIcon size={60} className="text-slate-700" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {t('common.no_status_history', 'No status history found')}
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Scans</span>
              <span className="text-sm font-black text-white">{scans.length}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Repairs</span>
              <span className="text-sm font-black text-white">{repairs.length}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95"
          >
            {t('common.done', 'Done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
