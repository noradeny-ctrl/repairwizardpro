import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { SunBackground } from '../App';
import { Globe, LogOut, Package, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const PartnerDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [partName, setPartName] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("partnerUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        partnerEmail: user.email,
        partnerUid: user.uid,
        partName,
        amazonUrl,
        status: 'pending_review',
        createdAt: serverTimestamp(),
        btcAddress: "35U5Nxtudvx7RvKQ6E1RdreBt1THJXCxih"
      });
      setPartName('');
      setAmazonUrl('');
    } catch (err: any) {
      alert("SYSTEM_ERROR: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0E14] z-[200] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0A0E14] z-[200] flex flex-col items-center justify-center p-8 text-center">
        <SunBackground />
        <div className="relative z-10 bg-slate-900/60 border border-cyan-500/20 rounded-[2.5rem] p-10 max-w-md backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Globe className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black mb-4 text-white uppercase tracking-widest">Partner Portal</h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Access the elite Repair Wizard partner network. Submit part requests and track fulfillments.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-cyan-700 hover:bg-cyan-600 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
          >
            Authenticate via Google
          </button>
          <button 
            onClick={onClose}
            className="mt-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest hover:text-slate-300 transition-colors"
          >
            Back to Scanner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0A0E14] z-[200] flex flex-col overflow-hidden animate-fade-in">
      <SunBackground />
      
      <header className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#0A0E14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-white">Partner_Portal</h1>
            <p className="text-[9px] text-cyan-500 font-mono uppercase tracking-widest">Verified: {user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => auth.signOut()}
            className="p-2 hover:bg-red-500/10 rounded-full transition-colors group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 hide-scrollbar">
        {/* New Request Form */}
        <section className="bg-slate-900/60 border border-cyan-500/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">01_New_Request</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Part Name / Model</label>
              <input 
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none" 
                placeholder="e.g. iPhone 15 Pro Max Display Assembly"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Amazon / Source URL</label>
              <input 
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none" 
                placeholder="https://amazon.com/..."
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
            >
              {loading ? 'UPLOADING...' : 'SUBMIT_TO_WIZARD'}
            </button>
          </form>
        </section>

        {/* Settlement Info */}
        <section className="bg-black border border-yellow-500/20 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-yellow-500" />
            </div>
            <h2 className="text-[10px] font-black tracking-[0.4em] text-yellow-500 uppercase">02_Settlement_Info</h2>
          </div>
          <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest">Official BTC Address for all fulfillments:</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group">
            <code className="text-[11px] text-yellow-500/80 font-mono break-all">
              35U5Nxtudvx7RvKQ6E1RdreBt1THJXCxih
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText("35U5Nxtudvx7RvKQ6E1RdreBt1THJXCxih")}
              className="text-[9px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest ml-4"
            >
              Copy
            </button>
          </div>
        </section>

        {/* Order History */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">03_Order_History</h2>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/20 rounded-[2rem] border border-dashed border-slate-800">
                <p className="text-xs text-slate-600 uppercase tracking-widest">No requests logged yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/60 transition-all">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{order.partName}</h4>
                    <a href={order.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-500 hover:underline truncate block max-w-[200px]">
                      {order.amazonUrl}
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-mono uppercase">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {order.status === 'pending_review' && <Clock className="w-3 h-3 text-yellow-500" />}
                        {order.status === 'approved' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        {order.status === 'shipped' && <Package className="w-3 h-3 text-cyan-500" />}
                        {order.status === 'completed' && <CheckCircle className="w-3 h-3 text-blue-500" />}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          order.status === 'pending_review' ? 'text-yellow-500' :
                          order.status === 'approved' ? 'text-emerald-500' :
                          order.status === 'shipped' ? 'text-cyan-500' :
                          'text-blue-500'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="h-20" />
      </main>
    </div>
  );
};

export default PartnerDashboard;
