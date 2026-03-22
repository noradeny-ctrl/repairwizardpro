
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
  Send,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { 
  db, 
  collection, 
  getDocs, 
  getDoc,
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
  userId?: string;
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
  const [activeTab, setActiveTab] = useState<'applications' | 'partners' | 'users'>('applications');
  const [partners, setPartners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newPartner, setNewPartner] = useState({
    business_name: '',
    specialties: '',
    services_offered: '',
    city: 'Erbil',
    phone: '',
    email: '',
    whatsapp_link: '',
    profile_image: 'https://picsum.photos/seed/garage/400/300',
    description: '',
    subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lat: 36.1901,
    lng: 44.0091
  });

  useEffect(() => {
    fetchApplications();
    fetchPartners();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const u: any[] = [];
      snapshot.forEach((doc) => {
        u.push({ id: doc.id, ...doc.data() });
      });
      setUsers(u);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  };

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
      handleFirestoreError(error, OperationType.LIST, 'partnerApplications');
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
      handleFirestoreError(error, OperationType.LIST, 'partners');
    }
  };

  const handleApprove = async (app: Application) => {
    setProcessingId(app.id);
    try {
      // 1. Update application status
      const appRef = doc(db, 'partnerApplications', app.id);
      await updateDoc(appRef, { status: 'approved' });

      // 2. Update user role if userId exists
      if (app.userId) {
        const userRef = doc(db, 'users', app.userId);
        await updateDoc(userRef, { role: 'partner' })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, 'users'));
      }

      // 3. Create partner entry
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
      handleFirestoreError(error, OperationType.UPDATE, 'partners');
    }
  };

  const handleAddPartner = async () => {
    if (!newPartner.business_name) return;
    setLoading(true);
    try {
      const partnerId = crypto.randomUUID();
      const partnerRef = doc(db, 'partners', partnerId);
      await setDoc(partnerRef, {
        business_name: newPartner.business_name,
        is_verified: true,
        contact: {
          email: newPartner.email,
          phone: newPartner.phone,
          whatsapp_link: newPartner.whatsapp_link || `https://wa.me/${newPartner.phone.replace(/\D/g, '')}`
        },
        location: {
          city: newPartner.city,
          coordinates: { latitude: Number(newPartner.lat), longitude: Number(newPartner.lng) }
        },
        specialties: newPartner.specialties.split(',').map(s => s.trim()).filter(Boolean),
        services_offered: newPartner.services_offered.split(',').map(s => s.trim()).filter(Boolean),
        images: {
          profile: newPartner.profile_image
        },
        policy: {
          fair_price_guarantee: true,
          description: newPartner.description || "Verified Partner"
        },
        subscription_end_date: newPartner.subscription_expiry
      });
      setIsAddingPartner(false);
      setNewPartner({
        business_name: '',
        specialties: '',
        services_offered: '',
        city: 'Erbil',
        phone: '',
        email: '',
        whatsapp_link: '',
        profile_image: 'https://picsum.photos/seed/garage/400/300',
        description: '',
        subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lat: 36.1901,
        lng: 44.0091
      });
      await fetchPartners();
    } catch (error) {
      console.error("Error adding partner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerifiedUser = async (userId: string) => {
    try {
      // 1. Revoke user role
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: 'user' });

      // 2. Find their partner applications
      const q = query(collection(db, 'partnerApplications'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      for (const appDoc of snapshot.docs) {
        // Reject application
        await updateDoc(doc(db, 'partnerApplications', appDoc.id), { status: 'rejected' });
        
        // Soft delete partner profile
        const partnerRef = doc(db, 'partners', appDoc.id);
        await updateDoc(partnerRef, { is_verified: false }).catch(() => {});
      }

      await fetchUsers();
      await fetchPartners();
      await fetchApplications();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    try {
      // 1. Soft delete the partner
      const partnerRef = doc(db, 'partners', partnerId);
      await updateDoc(partnerRef, { is_verified: false });

      // 2. Check if there's a corresponding application to revoke the user's role
      const appRef = doc(db, 'partnerApplications', partnerId);
      const appSnap = await getDoc(appRef);
      
      if (appSnap.exists()) {
        const appData = appSnap.data();
        
        // Update application status
        await updateDoc(appRef, { status: 'rejected' });
        
        // Revoke user role if userId exists
        if (appData.userId) {
          const userRef = doc(db, 'users', appData.userId);
          await updateDoc(userRef, { role: 'user' });
        }
      }

      await fetchPartners();
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'partners');
    }
  };

  const handleReject = async (appId: string) => {
    setProcessingId(appId);
    try {
      const appRef = doc(db, 'partnerApplications', appId);
      await updateDoc(appRef, { status: 'rejected' });
      await fetchApplications();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'partnerApplications');
    } finally {
      setProcessingId(null);
    }
  };

  const sendApprovalEmail = async (app: any) => {
    console.log(`Sending approval notification to ${app.email} and ${app.phone}...`);
    
    try {
      const response = await fetch('/api/notify/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: app.email,
          phone: app.phone,
          companyName: app.companyName
        })
      });

      const results = await response.json();
      
      // Visual feedback for simulation
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-[300] bg-emerald-500 text-black px-6 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest flex flex-col gap-1 animate-bounce';
      
      let statusText = '';
      if (results.email?.success) statusText += '📧 Email Sent ';
      if (results.sms?.success) statusText += '📱 SMS Sent';
      if (!results.email?.success && !results.sms?.success) statusText = '❌ Notification Failed';

      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          ${statusText}
        </div>
        <div class="text-[8px] opacity-70">To: ${app.email}</div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
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
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'users' ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-white'
              }`}
            >
              All Users
            </button>
          </div>
          
          {activeTab === 'partners' && (
            <button
              onClick={() => setIsAddingPartner(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus size={14} />
              Add Partner
            </button>
          )}
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
        ) : activeTab === 'partners' ? (
          <div className="space-y-6">
            {isAddingPartner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <Plus className="text-cyan-400" />
                    New Partner Registration
                  </h2>
                  <button onClick={() => setIsAddingPartner(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Name</label>
                    <input 
                      type="text"
                      value={newPartner.business_name}
                      onChange={(e) => setNewPartner({...newPartner, business_name: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      placeholder="e.g. Erbil Auto Care"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City</label>
                    <input 
                      type="text"
                      value={newPartner.city}
                      onChange={(e) => setNewPartner({...newPartner, city: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      placeholder="+964..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialties (comma separated)</label>
                    <input 
                      type="text"
                      value={newPartner.specialties}
                      onChange={(e) => setNewPartner({...newPartner, specialties: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      placeholder="e.g. Engine, Transmission, Electrical"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Services Offered (comma separated)</label>
                    <input 
                      type="text"
                      value={newPartner.services_offered}
                      onChange={(e) => setNewPartner({...newPartner, services_offered: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      placeholder="e.g. Oil Change, Brake Repair, Diagnostic"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Description</label>
                    <textarea 
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({...newPartner, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all min-h-[100px]"
                      placeholder="Describe the partner's business and policy..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Image URL</label>
                    <input 
                      type="text"
                      value={newPartner.profile_image}
                      onChange={(e) => setNewPartner({...newPartner, profile_image: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription Expiry</label>
                    <input 
                      type="date"
                      value={newPartner.subscription_expiry}
                      onChange={(e) => setNewPartner({...newPartner, subscription_expiry: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latitude</label>
                      <input 
                        type="number"
                        step="any"
                        value={newPartner.lat}
                        onChange={(e) => setNewPartner({...newPartner, lat: parseFloat(e.target.value)})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Longitude</label>
                      <input 
                        type="number"
                        step="any"
                        value={newPartner.lng}
                        onChange={(e) => setNewPartner({...newPartner, lng: parseFloat(e.target.value)})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleAddPartner}
                    className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-cyan-500/20"
                  >
                    Register Partner
                  </button>
                  <button
                    onClick={() => setIsAddingPartner(false)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {partners.filter(p => p.is_verified !== false).map((partner) => (
                <motion.div
                  key={partner.id}
                  layout
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                        {partner.images?.profile ? (
                          <img src={partner.images.profile} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ShieldCheck className="text-emerald-400" size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-white uppercase tracking-tight">{partner.business_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                            {partner.location?.city}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">
                            Expires: {partner.subscription_end_date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => sendApprovalEmail({ email: partner.contact?.email })}
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
                      <button 
                        onClick={() => setConfirmDeleteId(partner.id)}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Partner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {confirmDeleteId === partner.id && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 text-center">
                        Confirm Remove? (Revokes partner role & hides profile)
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeletePartner(partner.id)}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {editingPartnerId === partner.id ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Business Name</label>
                          <input 
                            type="text" 
                            defaultValue={partner.business_name}
                            onBlur={(e) => handleUpdatePartner(partner.id, { business_name: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">City</label>
                          <input 
                            type="text" 
                            defaultValue={partner.location?.city}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'location.city': e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Specialties (comma separated)</label>
                          <input 
                            type="text" 
                            defaultValue={partner.specialties?.join(', ')}
                            onBlur={(e) => handleUpdatePartner(partner.id, { specialties: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Services (comma separated)</label>
                          <input 
                            type="text" 
                            defaultValue={partner.services_offered?.join(', ')}
                            onBlur={(e) => handleUpdatePartner(partner.id, { services_offered: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Description</label>
                          <textarea 
                            defaultValue={partner.policy?.description}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'policy.description': e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none min-h-[60px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Phone</label>
                          <input 
                            type="text" 
                            defaultValue={partner.contact?.phone}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'contact.phone': e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Subscription Expiry</label>
                          <input 
                            type="date" 
                            defaultValue={partner.subscription_end_date}
                            onBlur={(e) => handleUpdatePartner(partner.id, { subscription_end_date: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Latitude</label>
                          <input 
                            type="number" 
                            step="any"
                            defaultValue={partner.location?.coordinates?.latitude}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'location.coordinates.latitude': parseFloat(e.target.value) })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Longitude</label>
                          <input 
                            type="number" 
                            step="any"
                            defaultValue={partner.location?.coordinates?.longitude}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'location.coordinates.longitude': parseFloat(e.target.value) })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Profile Image URL</label>
                          <input 
                            type="text" 
                            defaultValue={partner.images?.profile}
                            onBlur={(e) => handleUpdatePartner(partner.id, { 'images.profile': e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => setEditingPartnerId(null)}
                          className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2"
                        >
                          <Save size={12} />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">About & Policy</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          {partner.policy?.description || "No description provided."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Specialties</span>
                          <div className="flex flex-wrap gap-1">
                            {partner.specialties?.map((s: string) => (
                              <span key={s} className="text-[8px] font-bold px-2 py-0.5 bg-white/5 rounded text-slate-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Contact</span>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                              <Mail size={10} className="text-cyan-500/50" />
                              {partner.contact?.email}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                              <Phone size={10} className="text-cyan-500/50" />
                              {partner.contact?.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      {partner.services_offered && partner.services_offered.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Services Offered</span>
                          <div className="flex flex-wrap gap-1">
                            {partner.services_offered.map((s: string) => (
                              <span key={s} className="text-[8px] font-bold px-2 py-0.5 bg-cyan-500/10 rounded text-cyan-400 border border-cyan-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {users.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 overflow-hidden">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="text-cyan-400" size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-white uppercase tracking-tight">{u.displayName || 'No Name'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    {u.role === 'partner' && (
                      <button
                        onClick={() => handleRemoveVerifiedUser(u.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                        title="Remove Partner Role"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                      <Mail size={10} className="text-cyan-500/50" />
                      {u.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                      <Clock size={10} className="text-cyan-500/50" />
                      Joined: {u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
