
import React, { useState, useRef, memo, useCallback, useMemo, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { RegionMode, AppState, Partner, Coordinates } from './types';
import { analyzeProblem, WizardError } from './services/geminiService';
import { formatAppError } from './services/errorService';
import ResultView from './components/ResultView';
import WizardDirectView from './components/WizardDirectView';
import WizardIcon from './components/WizardIcon';
import PartnerBadge from './components/PartnerBadge';
import partnersData, { fetchActivePartners } from './partners';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const KurdishFlag = memo(({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1400 900" xmlns="http://www.w3.org/2000/svg">
    <rect width="1400" height="300" fill="#E31E24"/>
    <rect y="300" width="1400" height="300" fill="#FFF"/>
    <rect y="600" width="1400" height="300" fill="#278E43"/>
    <circle cx="700" cy="450" r="130" fill="#FFD700" />
    <g transform="translate(700, 450)" fill="#FFD700">
      {[...Array(21)].map((_, i) => (
        <path key={i} d="M0 -185 L18 -130 L-18 -130 Z" transform={`rotate(${(i * 360) / 21})`} />
      ))}
    </g>
  </svg>
));

const USAFlag = memo(({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 741 390" xmlns="http://www.w3.org/2000/svg">
    <rect width="741" height="390" fill="#fff"/>
    <rect width="741" height="30" fill="#b22234"/>
    <rect width="741" height="30" y="60" fill="#b22234"/>
    <rect width="741" height="30" y="120" fill="#b22234"/>
    <rect width="741" height="30" y="180" fill="#b22234"/>
    <rect width="741" height="30" y="240" fill="#b22234"/>
    <rect width="741" height="30" y="300" fill="#b22234"/>
    <rect width="741" height="30" y="360" fill="#b22234"/>
    <rect width="296.4" height="210" fill="#3c3b6e"/>
    <g fill="#fff">
      {[...Array(5)].map((_, row) => (
        <g key={`row-even-${row}`} transform={`translate(0, ${row * 42})`}>
          {[...Array(6)].map((_, col) => (
            <circle key={col} cx={16.5 + col * 52.8} cy={21} r="5" />
          ))}
        </g>
      ))}
      {[...Array(4)].map((_, row) => (
        <g key={`row-odd-${row}`} transform={`translate(0, ${row * 42 + 21})`}>
          {[...Array(5)].map((_, col) => (
            <circle key={col} cx={42.9 + col * 52.8} cy={21} r="5" />
          ))}
        </g>
      ))}
    </g>
  </svg>
));

const ArabicFlag = memo(({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#FFFFFF"/>
    <rect y="400" width="900" height="200" fill="#000000"/>
    <g transform="translate(450, 300)" fill="#007A3D" textAnchor="middle" dominantBaseline="middle">
      <text fontSize="64" fontWeight="900" fontFamily="'Noto Sans Arabic', sans-serif">الله أكبر</text>
    </g>
  </svg>
));

export const SunBackground = memo(() => (
  <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none z-0 overflow-hidden">
    <div 
      className="absolute top-[-300px] right-[-300px] w-full h-full opacity-60 blur-[60px]"
      style={{
        background: `radial-gradient(circle at center, rgba(34, 211, 238, 0.2) 0%, rgba(15, 23, 42, 0.1) 40%, transparent 70%)`
      }}
    />
  </div>
));

const DraggableLogo = memo(() => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      setPos({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
    };
    const handleEnd = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div 
      className={`relative z-10 mb-20 flex items-center justify-center w-full max-w-[400px] h-[400px] animate-slide-up cursor-grab active:cursor-grabbing select-none transition-shadow ${isDragging ? 'drop-shadow-[0_20px_50px_rgba(34,211,238,0.4)]' : ''}`}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      onMouseDown={onStart}
      onTouchStart={onStart}
    >
      <WizardIcon size={220} className="relative z-20 pointer-events-none" />
      {isDragging && <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-pulse scale-110" />}
    </div>
  );
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    userInput: '',
    mode: RegionMode.WESTERN,
    isAnalyzing: false,
    isStarted: false,
    isWizardDirectOpen: false,
  });

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [livePartners, setLivePartners] = useState<Partner[]>(partnersData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const testConnection = async (retries = 3) => {
      // Small delay to allow SDK to initialize
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const docRef = doc(db, 'test', 'connection');
        // Use getDoc instead of getDocFromServer for a more resilient initial check
        await getDoc(docRef);
        console.log("✅ Firestore connection verified.");
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`⚠️ Firestore connection attempt failed, retrying... (${retries} left)`);
          return testConnection(retries - 1);
        }
        console.error("❌ Firestore connection failed after retries:", err);
        const errorMsg = err.message || String(err);
        setState(prev => ({ 
          ...prev, 
          error: errorMsg.toLowerCase().includes('rate exceeded') || errorMsg.includes('429')
            ? "The Wizard's connection is currently throttled. Please wait a few seconds and refresh."
            : `Initialization Error: ${errorMsg}` 
        }));
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    if (state.isStarted) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        null,
        { enableHighAccuracy: false, timeout: 5000 }
      );
      // Asynchronously refresh partners list from Firebase
      fetchActivePartners().then(setLivePartners).catch(console.error);
    }
  }, [state.isStarted]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setState(prev => ({ ...prev, image: e.target?.result as string, error: undefined }));
    reader.readAsDataURL(file);
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!state.userInput.trim() && !state.image) {
      setState(prev => ({ ...prev, error: "Please provide a description or an image." }));
      return;
    }
    setState(prev => ({ ...prev, isAnalyzing: true, result: undefined, error: undefined }));
    try {
      const pureBase64 = state.image?.split(',')[1];
      const analysis = await analyzeProblem(state.userInput, pureBase64, state.mode);
      
      if (!analysis || typeof analysis !== 'object') {
        throw new Error("Invalid analysis payload received.");
      }

      // Save to Firestore (Anonymous)
      const repairData = {
        id: crypto.randomUUID(),
        userId: 'anonymous',
        issueDescription: state.userInput,
        aiDiagnosis: analysis.diagnosis,
        status: 'diagnosed',
        createdAt: new Date().toISOString(),
        vehicleInfo: analysis.vinScanData ? {
          make: analysis.vinScanData.make,
          model: analysis.vinScanData.model,
          year: analysis.vinScanData.year
        } : null
      };
      
      await addDoc(collection(db, 'repairs'), repairData)
        .catch(err => handleFirestoreError(err, OperationType.CREATE, 'repairs'));

      setState(prev => ({ ...prev, isAnalyzing: false, result: analysis }));
    } catch (err: any) {
      console.error("Analysis Failure:", err);
      const errorMessage = formatAppError(err, state.mode);
      setState(prev => ({ ...prev, isAnalyzing: false, error: String(errorMessage) }));
    }
  }, [state.userInput, state.image, state.mode]);

  const resetApp = useCallback(() => {
    setState(prev => ({ ...prev, isAnalyzing: false, result: undefined, image: undefined, userInput: '', error: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const setInitialMode = useCallback((mode: RegionMode) => {
    setState(prev => ({ ...prev, mode, isStarted: true, error: undefined }));
  }, []);

  const toggleWizardDirect = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isWizardDirectOpen: open }));
  }, []);

  const isRTL = state.mode !== RegionMode.WESTERN;

  const nearbyPartners = useMemo(() => {
    if (!userLocation) return [];
    return livePartners
      .filter(p => p.location?.coordinates?.latitude !== undefined && p.location?.coordinates?.longitude !== undefined)
      .map(p => ({ 
        ...p, 
        distance: calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          p.location.coordinates.latitude, 
          p.location.coordinates.longitude
        ) 
      }))
      .filter(p => (p.distance ?? 999) <= 65)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, livePartners]);

  const recommendedPartners = useMemo(() => {
    if (!nearbyPartners.length || !state.result) return [];
    const context = `${state.userInput} ${state.result.diagnosis} ${state.result.partName}`.toLowerCase();
    return nearbyPartners.filter(p => 
      p.specialties.some(s => context.includes(s.toLowerCase())) || 
      p.services_offered.some(s => context.includes(s.toLowerCase()))
    ).slice(0, 3);
  }, [nearbyPartners, state.userInput, state.result]);

  const PartnerProgramSection = useMemo(() => (
    <div className="mt-4 bg-slate-900/60 border border-cyan-500/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PartnerBadge size={100} /></div>
      <h3 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-4">💎 VERIFIED PARTNER PROGRAM</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-6">Join our elite network of certified "Ustas" and technical wizards.</p>
      <div className="flex flex-wrap gap-4">
        <a href="https://wa.me/16153392046" target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs font-bold border-b border-emerald-500/40 pb-1 hover:text-emerald-300 transition-colors">Join via WhatsApp</a>
        <a href="https://repairwizard.net" target="_blank" rel="noopener noreferrer" className="text-white text-xs font-bold border-b border-cyan-500/40 pb-1 hover:text-cyan-400 transition-colors">Visit repairwizard.net</a>
      </div>
    </div>
  ), []);

  // 1. Handle fatal errors first, before any other conditional returns
  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0E14] text-white p-8 text-center animate-fade-in">
        <SunBackground />
        <div className="relative z-10 bg-slate-900/60 border border-red-500/20 rounded-[2.5rem] p-10 max-w-md backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-4xl">🧙‍♂️</span>
          </div>
          <h2 className="text-xl font-bold mb-4 text-red-400 uppercase tracking-widest">Wizard Connection Error</h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            {String(state.error)}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!state.isStarted) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full bg-[#0A0E14] text-white p-8 animate-fade-in overflow-hidden">
        <SunBackground />
        <DraggableLogo />
        <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm animate-slide-up stagger-1">
          {[{ id: RegionMode.BADINAN, label: 'Badînî', flag: <KurdishFlag className="w-10" /> }, { id: RegionMode.SORANI, label: 'Soranî', flag: <KurdishFlag className="w-10" /> }, { id: RegionMode.ARABIC, label: 'العربية', flag: <ArabicFlag className="w-10" /> }, { id: RegionMode.WESTERN, label: 'English', flag: <USAFlag className="w-10" /> }].map((m) => (
            <button key={m.id} onClick={() => setInitialMode(m.id)} className="flex flex-col items-center p-5 rounded-[2rem] bg-slate-800/40 border border-white/5 transition-all hover:bg-emerald-500/10 active:scale-95 shadow-xl backdrop-blur-sm">
              <div className="mb-3 rounded overflow-hidden shadow-md">{m.flag}</div>
              <h2 className="text-sm font-bold">{m.label}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0E14] text-white overflow-hidden animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <SunBackground />
        <header className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#0A0E14]/80 backdrop-blur-ultra sticky top-0 z-50">
          <div 
            className="flex items-center gap-3 cursor-pointer drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" 
            onClick={() => setState(prev => ({...prev, isStarted: false}))}
          >
            <WizardIcon className="h-14 md:h-16 w-auto object-contain" />
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase">
              {state.mode}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar relative z-10">
          <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md">
            <textarea 
              className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 resize-none min-h-[140px] text-lg font-medium" 
              placeholder={state.mode === RegionMode.WESTERN ? "Enter VIN or describe problem..." : "ژمارا شاسی یان ئاریشێ بنڤیسە..."} 
              value={state.userInput} 
              onChange={(e) => setState(prev => ({ ...prev, userInput: e.target.value, error: undefined }))} 
            />
          </div>
          <div onClick={() => fileInputRef.current?.click()} className="group aspect-video rounded-[2.5rem] border-2 border-dashed border-slate-700 bg-slate-800/20 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer relative">
            {state.image ? (
              <img src={state.image} className="w-full h-full object-cover" alt="Preview" decoding="async" />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-40"><span className="text-3xl">📸</span><span className="text-[10px] font-bold uppercase">Add Photo</span></div>
            )}
          </div>
          {state.error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center animate-shake">
              <p className="text-red-400 text-xs font-bold leading-relaxed">
                {String(state.error)}
              </p>
            </div>
          )}
          {PartnerProgramSection}
          
          <div className="mt-4 bg-slate-900/60 border border-cyan-500/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:opacity-20 transition-opacity">🇺🇸</div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-4">🇺🇸 WIZARD DIRECT IMPORT</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">Import clean title vehicles directly from the USA to Kurdistan via Mersin & Ibrahim Khalil.</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => toggleWizardDirect(true)}
                className="text-white text-xs font-bold border-b border-cyan-500/40 pb-1 hover:text-cyan-400 transition-colors"
              >
                Learn More
              </button>
              <a 
                href="https://wa.me/16153392046" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 text-xs font-bold border-b border-emerald-500/40 pb-1 hover:text-emerald-300 transition-colors"
              >
                WhatsApp Broker
              </a>
            </div>
          </div>
  
          <div className="h-40" />
        </main>
        <div className="bg-slate-900/95 backdrop-blur-ultra rounded-t-[3rem] px-8 pt-10 pb-12 border-t border-white/5 shadow-2xl relative z-20">
          <button onClick={startAnalysis} disabled={state.isAnalyzing} className="w-full py-6 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 transition-all rounded-[2rem] flex items-center justify-center shadow-xl active:scale-95 shadow-cyan-900/20">
            <span className="font-black tracking-[0.2em] uppercase text-xs text-white">
              {state.isAnalyzing ? '⚡ SCANNING...' : '🔍 INITIALIZE SCAN'}
            </span>
          </button>
        </div>
        {state.result && <div className="fixed inset-0 z-[100] animate-modal-enter bg-[#0a0f1e]"><ResultView result={state.result} mode={state.mode} onReset={resetApp} onOpenWizardDirect={() => toggleWizardDirect(true)} recommendedPartners={recommendedPartners} /></div>}
        {state.isWizardDirectOpen && <div className="fixed inset-0 z-[100] animate-modal-enter bg-[#0a0f1e]"><WizardDirectView mode={state.mode} onClose={() => toggleWizardDirect(false)} /></div>}
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      </div>
    );
  };

export default App;
