
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Building2, 
  User,
  ArrowLeft,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  MailCheck,
  Loader2,
  Edit2,
  Send
} from 'lucide-react';
import { 
  db, 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  setDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { useTranslation } from 'react-i18next';

interface Application {
  id: string;
  companyName: string;
  businessType: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'partners'>('applications');
  const [partners, setPartners] = useState<any[]>([]);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchApplications();
    fetchPartners();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'partnerApplications'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const apps: Application[] = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const q = query(collection(db, 'partners'));
      const snapshot = await getDocs(q);
      const p: any[] = [];
      snapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() });
      });
      setPartners(p);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const handleApprove = async (app: Application) => {
    setProcessingId(app.id);
    try {
      // 1. Update application status
      const appRef = doc(db, 'partnerApplications', app.id);
      await updateDoc(appRef, { status: 'approved' });

      // 2. Create partner entry
      const partnerRef = doc(db, 'partners', app.id);
      await setDoc(partnerRef, {
        business_name: app.companyName,
        is_verified: true,
        contact: {
          email: app.email,
          phone: app.phone,
          whatsapp_link: `https://wa.me/${app.phone.replace(/\D/g, '')}`
        },
        location: {
          city: 'Erbil', // Default for now
          coordinates: { latitude: 36.1901, longitude: 44.0091 }
        },
        specialties: [app.businessType],
        services_offered: [],
        policy: {
          fair_price_guarantee: true,
          description: "Verified Partner"
        },
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year
      });

      // 3. Send Email (Simulated)
      await sendApprovalEmail(app);

      // Refresh lists
      await fetchApplications();
      await fetchPartners();
    } catch (error) {
      console.error("Error approving application:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdatePartner = async (partnerId: string, data: any) => {
    try {
      const partnerRef = doc(db, 'partners', partnerId);
      await updateDoc(partnerRef, data);
      await fetchPartners();
      setEditingPartnerId(null);
    } catch (error) {
      console.error("Error updating partner:", error);
    }
  };

  const handleReject = async (appId: string) => {
    setProcessingId(appId);
    try {
      const appRef = doc(db, 'partnerApplications', appId);
      await updateDoc(appRef, { status: 'rejected' });
      await fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const sendApprovalEmail = async (app: any) => {
    console.log(`Sending approval email to ${app.email}...`);
    // Visual feedback for simulation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[300] bg-emerald-500 text-black px-6 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest flex items-center gap-3 animate-bounce';
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
      Email Sent to ${app.email}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const filteredApps = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  return (
    <div className="fixed inset-0 z-[200] bg-[#05070a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-cyan-400" size={24} />
                Admin Terminal
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Partner Network Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'applications' ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-white'
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'partners' ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-white'
              }`}
            >
              Active Partners
            </button>
          </div>
        </div>

        {activeTab === 'applications' && (
          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5 self-start">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Accessing Secure Records...</p>
          </div>
        ) : activeTab === 'applications' ? (
          filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
              <Clock className="w-12 h-12 text-slate-600" />
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">No Applications Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                          <Building2 className="text-cyan-400" size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-white uppercase tracking-tight">{app.companyName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                              {app.businessType}
                            </span>
                            <span className="text-[8px] font-mono text-slate-600">
                              {app.submittedAt?.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        app.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        app.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {app.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contact Person</span>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <User size={12} className="text-cyan-500/50" />
                          {app.fullName}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Email Address</span>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Mail size={12} className="text-cyan-500/50" />
                          {app.email}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Phone Number</span>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Phone size={12} className="text-cyan-500/50" />
                          {app.phone}
                        </div>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={!!processingId}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve & Notify
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={!!processingId}
                          className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}

                    {app.status === 'approved' && (
                      <div className="flex items-center justify-between bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          <MailCheck size={14} />
                          Confirmation Email Sent
                        </div>
                        <button 
                          onClick={() => sendApprovalEmail(app)}
                          className="text-[8px] font-black text-emerald-500 hover:text-emerald-400 uppercase underline"
                        >
                          Resend
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                layout
                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <ShieldCheck className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tight">{partner.business_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                          {partner.location.city}
                        </span>
                        <span className="text-[8px] font-mono text-slate-600">
                          Expires: {partner.subscription_end_date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => sendApprovalEmail({ email: partner.contact.email })}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-emerald-400 transition-colors"
                      title="Send Test Email"
                    >
                      <Send size={16} />
                    </button>
                    <button 
                      onClick={() => setEditingPartnerId(partner.id === editingPartnerId ? null : partner.id)}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
                      title="Edit Partner"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>

                {editingPartnerId === partner.id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">City</label>
                        <input 
                          type="text" 
                          defaultValue={partner.location.city}
                          onBlur={(e) => handleUpdatePartner(partner.id, { 'location.city': e.target.value })}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Specialties (comma separated)</label>
                        <input 
                          type="text" 
                          defaultValue={partner.specialties.join(', ')}
                          onBlur={(e) => handleUpdatePartner(partner.id, { specialties: e.target.value.split(',').map((s: string) => s.trim()) })}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setEditingPartnerId(null)}
                        className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Specialties</span>
                      <div className="flex flex-wrap gap-1">
                        {partner.specialties.map((s: string) => (
                          <span key={s} className="text-[8px] font-bold px-2 py-0.5 bg-white/5 rounded text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contact</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <Mail size={10} className="text-cyan-500/50" />
                        {partner.contact.email}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
