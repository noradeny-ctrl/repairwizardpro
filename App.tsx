
// Main Application Component
import React, { useState, useRef, memo, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, Ship, AlertTriangle, Activity, ArrowLeft, Camera, Image as ImageIcon, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { RegionMode, AppState, Partner, Coordinates, AnalysisResult } from './types';
import { analyzeProblem, WizardError } from './services/geminiService';
import { formatAppError } from './services/errorService';
import ResultView from './components/ResultView';
import WizardIcon from './components/WizardIcon';
import ErrorModal from './components/ErrorModal';
import ExportTerminal from './components/ExportTerminal';
import ProtocolInitialization from './components/ProtocolInitialization';
import OBDAnalyzer from './components/OBDAnalyzer';
import { AdminDashboard } from './components/AdminDashboard';
import { VerifiedPartnersGrid } from './components/VerifiedPartnersGrid';
import partnersData, { fetchActivePartners } from './partners';
import { db, auth, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useFirebase } from './components/FirebaseProvider';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

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
  const { t, i18n } = useTranslation();
  const { user, userProfile, loading } = useFirebase();
  const isAdmin = userProfile?.role === 'admin';
  const [state, setState] = useState<AppState>({
    userInput: '',
    mode: RegionMode.WESTERN,
    isAnalyzing: false,
    isStarted: false,
    selectedImage: undefined,
  });

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [livePartners, setLivePartners] = useState<Partner[]>(partnersData);
  const [isPartnersLoading, setIsPartnersLoading] = useState(false);
  const [isExportTerminalOpen, setIsExportTerminalOpen] = useState(false);
  const [showOBD, setShowOBD] = useState(false);
  const [detectedOBD, setDetectedOBD] = useState<string | null>(null);
  const [obdInput, setObdInput] = useState('');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  useEffect(() => {
    const testConnection = async (retries = 3) => {
      // Small delay to allow SDK to initialize
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const docRef = doc(db, 'test', 'connection');
        await getDoc(docRef);
        console.log("✅ Firestore connection verified.");
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`⚠️ Firestore connection attempt failed, retrying... (${retries} left)`);
          return testConnection(retries - 1);
        }
        console.error("❌ Firestore connection failed after retries:", err);
        // Don't set a blocking error for the user unless it's a quota issue
        const errorMsg = err.message || String(err);
        if (errorMsg.toLowerCase().includes('rate exceeded') || errorMsg.includes('429')) {
          setState(prev => ({ 
            ...prev, 
            error: t('common.connection_throttled', "The Wizard's connection is currently throttled. Please wait a few seconds and refresh."),
            errorCategory: 'quota'
          }));
        }
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
      setIsPartnersLoading(true);
      fetchActivePartners()
        .then(setLivePartners)
        .catch(console.error)
        .finally(() => setIsPartnersLoading(false));
    }
  }, [state.isStarted]);

  const saveRepairToFirestore = async (userInput: string, analysis: AnalysisResult) => {
    const repairData = {
      id: crypto.randomUUID(),
      userId: 'anonymous',
      issueDescription: userInput,
      aiDiagnosis: analysis.diagnosis,
      status: 'diagnosed',
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'repairs'), repairData)
      .catch(err => handleFirestoreError(err, OperationType.CREATE, 'repairs'));
  };

  const startAnalysis = useCallback(async () => {
    if (!state.userInput.trim() && !state.selectedImage) {
      setState(prev => ({ ...prev, error: t('common.provide_description_or_image', "Please provide a description or an image."), errorCategory: 'validation' }));
      return;
    }
    setState(prev => ({ ...prev, isAnalyzing: true, result: undefined, error: undefined }));
    const startTime = Date.now();
    try {
      const analysis = await analyzeProblem(state.userInput, state.selectedImage, state.mode);
      
      if (!analysis || typeof analysis !== 'object') {
        throw new Error(t('common.invalid_analysis_payload', "Invalid analysis payload received."));
      }

      await saveRepairToFirestore(state.userInput, analysis);

      setState(prev => ({ ...prev, isAnalyzing: false, result: analysis }));
    } catch (err: any) {
      console.error("Analysis Failure:", err);
      const { message, category } = formatAppError(err, state.mode);
      setState(prev => ({ ...prev, isAnalyzing: false, error: message, errorCategory: category }));
    }
  }, [state.userInput, state.mode]);

  const resetApp = useCallback(() => {
    setState(prev => ({ ...prev, isAnalyzing: false, result: undefined, userInput: '', error: undefined }));
  }, []);

  const setInitialMode = useCallback((mode: RegionMode) => {
    const langMap: Record<RegionMode, string> = {
      [RegionMode.WESTERN]: 'en',
      [RegionMode.BADINAN]: 'ku-BA',
      [RegionMode.SORANI]: 'ku-SO',
      [RegionMode.ARABIC]: 'ar'
    };
    i18n.changeLanguage(langMap[mode]);
    setState(prev => ({ ...prev, mode, isStarted: true, error: undefined }));
  }, [i18n]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setState(prev => ({ ...prev, selectedImage: base64Data }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setState(prev => ({ ...prev, selectedImage: undefined }));
  };

  const isRTL = state.mode !== RegionMode.WESTERN;

  const hasImage = !!state.selectedImage;

  const looksLikeVin = useMemo(() => {
    const trimmed = state.userInput.trim();
    return trimmed.length >= 10 && trimmed.length <= 17 && !trimmed.includes(' ') && /^[A-Z0-9]*$/i.test(trimmed);
  }, [state.userInput]);

  const isImagePending = useMemo(() => {
    return !!state.selectedImage && !state.result;
  }, [state.selectedImage, state.result]);

  const isObdInMainInput = useMemo(() => {
    return /[PBUC][0-9]{4}/i.test(state.userInput) && !state.result;
  }, [state.userInput, state.result]);

  const isValidVin = useMemo(() => {
    return /^[A-HJ-NPR-Z0-9]{17}$/i.test(state.userInput.trim());
  }, [state.userInput]);

  const isValidObd = useMemo(() => {
    // Basic OBD-II code pattern: P, B, U, or C followed by 4 digits
    if (obdInput.trim()) {
      return /^[PBUC][0-9]{4}$/i.test(obdInput.trim());
    }
    // For main input, check if it contains a code anywhere
    return /[PBUC][0-9]{4}/i.test(state.userInput);
  }, [state.userInput, obdInput]);

  useEffect(() => {
    if (obdInput.trim()) {
      const match = obdInput.trim().match(/[PBUC][0-9]{4}/i);
      setDetectedOBD(match ? match[0].toUpperCase() : null);
    } else {
      const match = state.userInput.match(/[PBUC][0-9]{4}/i);
      setDetectedOBD(match ? match[0].toUpperCase() : null);
    }
  }, [state.userInput, obdInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    
    // Auto-uppercase if it looks like a VIN (no spaces, alphanumeric)
    if (!val.includes(' ') && !val.includes('\n') && /^[A-Za-z0-9]*$/.test(val)) {
      val = val.toUpperCase();
    }

    let error = undefined;
    const trimmed = val.trim();
    
    // Real-time VIN validation feedback - ONLY if it looks like a VIN attempt
    // (length >= 10, no spaces, alphanumeric)
    if (trimmed.length >= 10 && trimmed.length <= 17 && !trimmed.includes(' ') && /^[A-Z0-9]*$/i.test(trimmed)) {
      if (/[IOQ]/i.test(trimmed)) {
        error = t('common.vin_invalid_chars', "VINs never contain the letters I, O, or Q.");
      } else if (trimmed.length === 17 && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmed)) {
        error = t('common.vin_invalid_format', "Invalid VIN format. Please check for special characters.");
      }
    }

    setState(prev => ({ ...prev, userInput: val, error }));
  }, []);

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
    
    const diagnosis = state.result.diagnosis;
    const partName = state.result.partName;
    const userInput = state.userInput;

    // 1. Initialize Fuse for the entire nearby partners collection
    // This is much more efficient than per-partner initialization
    const fuse = new Fuse(nearbyPartners, {
      keys: [
        { name: 'specialties', weight: 2 },
        { name: 'services_offered', weight: 1 }
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true
    });

    // 2. Perform searches for different context levels
    const partResults = fuse.search(partName);
    const diagResults = fuse.search(diagnosis);
    const inputResults = fuse.search(userInput);

    // 3. Create a map for quick score lookup
    const scoreMap = new Map<string, number>();

    const applyResults = (results: any[], weight: number) => {
      results.forEach(res => {
        const current = scoreMap.get(res.item.id) || 0;
        // Fuse score: 0 is perfect, 1 is no match. We invert it.
        const matchQuality = 1 - (res.score || 0);
        scoreMap.set(res.item.id, current + (matchQuality * weight));
      });
    };

    applyResults(partResults, 20); // Part name is highest priority
    applyResults(diagResults, 12); // Diagnosis is medium priority
    applyResults(inputResults, 5); // User input is lowest priority

    // 4. Final scoring and sorting
    return nearbyPartners
      .map(p => {
        let expertScore = scoreMap.get(p.id) || 0;
        
        // Proximity Bonus: Closer partners get a significant boost
        // Max bonus of 10 points for being right next to the user
        const proximityBonus = p.distance !== undefined ? Math.max(0, (1 - (p.distance / 50)) * 10) : 0;
        
        const totalScore = expertScore + proximityBonus;

        return { ...p, matchScore: totalScore };
      })
      .filter(p => p.matchScore > 3) // Filter out irrelevant matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [nearbyPartners, state.userInput, state.result]);

  // 1. Handle fatal errors first, before any other conditional returns
  if (state.error) {
    const getErrorIcon = () => {
      switch (state.errorCategory) {
        case 'network': return <Globe className="w-10 h-10 text-red-400" />;
        case 'quota': return <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />;
        case 'safety': return <AlertTriangle className="w-10 h-10 text-orange-400" />;
        case 'permission': return <LogOut className="w-10 h-10 text-red-500" />;
        case 'validation': return <Camera className="w-10 h-10 text-cyan-400" />;
        default: return <span className="text-4xl">🧙‍♂️</span>;
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0E14] text-white p-8 text-center animate-fade-in">
        <SunBackground />
        <div className="relative z-10 bg-slate-900/60 border border-red-500/20 rounded-[2.5rem] p-10 max-w-md backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            {getErrorIcon()}
          </div>
          <h2 className="text-xl font-bold mb-4 text-red-400 uppercase tracking-widest">
            {state.errorCategory === 'quota' ? t('common.connection_throttled', 'Connection Throttled') : t('common.error_title')}
          </h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            {state.error}
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              {t('common.retry')}
            </button>
            <button 
              onClick={() => setState(prev => ({ ...prev, error: undefined, errorCategory: undefined }))}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              {t('common.back_to_dashboard', 'Back to Dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isStarted) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full bg-[#0A0E14] text-white p-8 animate-fade-in overflow-hidden safe-area-pt">
        <SunBackground />
        <DraggableLogo />
        <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm animate-slide-up stagger-1">
          {[{ id: RegionMode.BADINAN, label: t('modes.badinan'), flag: <KurdishFlag className="w-10" /> }, { id: RegionMode.SORANI, label: t('modes.sorani'), flag: <KurdishFlag className="w-10" /> }, { id: RegionMode.ARABIC, label: t('modes.arabic'), flag: <ArabicFlag className="w-10" /> }, { id: RegionMode.WESTERN, label: t('modes.western'), flag: <USAFlag className="w-10" /> }].map((m) => (
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
        
        <header className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-white/5 bg-[#0A0E14]/80 backdrop-blur-ultra sticky top-0 z-50 safe-area-pt">
          <div 
            className="flex items-center gap-3 cursor-pointer drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" 
            onClick={() => setState(prev => ({...prev, isStarted: false}))}
          >
            <WizardIcon className="h-14 md:h-16 w-auto object-contain" />
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight leading-none">
                    {userProfile?.displayName || user.displayName}
                  </span>
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mt-1">
                    {userProfile?.role || 'User'}
                  </span>
                </div>
                <div className="relative group">
                  <img 
                    src={user.photoURL || ''} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-cyan-500/50 transition-all cursor-pointer"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={handleLogout}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <LogOut size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all active:scale-95"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
            
            <button 
              onClick={() => setIsExportTerminalOpen(true)}
              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 transition-all active:scale-95 flex items-center gap-2 hover:bg-emerald-500/20 group"
              title={t('common.b2b_terminal', 'B2B Terminal')}
            >
              <Ship size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">{t('common.b2b_terminal', 'B2B Terminal')}</span>
            </button>

            {isAdmin && (
              <button 
                onClick={() => setIsAdminDashboardOpen(true)}
                className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 transition-all active:scale-95 flex items-center gap-2 hover:bg-cyan-500/20 group"
                title="Admin Panel"
              >
                <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Admin</span>
              </button>
            )}

            <div className="hidden sm:block px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase">
              {state.mode}
            </div>
            
            <button 
              onClick={() => setShowOBD(prev => !prev)}
              className={`px-3 py-1.5 border rounded-xl transition-all active:scale-95 flex items-center gap-2 ${showOBD ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/80 border-white/10 text-slate-400 hover:text-cyan-400'}`}
            >
              <Activity size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{t('common.obd_breaker', 'OBD Breaker')}</span>
            </button>
          </div>
        </header>

        {isExportTerminalOpen && (
          <ExportTerminal 
            onClose={() => setIsExportTerminalOpen(false)} 
            mode={state.mode}
          />
        )}

        {isAdminDashboardOpen && (
          <AdminDashboard 
            onClose={() => setIsAdminDashboardOpen(false)} 
          />
        )}

        {showOBD ? (
          <main className="flex-1 ios-scroll hide-scrollbar relative z-10 p-6 min-h-0">
            <div className="max-w-4xl mx-auto">
              <button 
                onClick={() => setShowOBD(false)}
                className="mb-6 py-2 flex items-center gap-2 text-[10px] font-black text-cyan-500/60 hover:text-cyan-400 uppercase tracking-[0.3em] transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {t('common.back_to_dashboard', 'Back to Dashboard')}
              </button>
              <OBDAnalyzer mode={state.mode} initialCode={detectedOBD || ''} />
              <div className="h-40" />
            </div>
          </main>
        ) : (
          <main className="flex-1 ios-scroll p-6 space-y-6 hide-scrollbar relative z-10 min-h-0">
            <div className={`bg-slate-800/40 border rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md relative group transition-all duration-500 
              ${(looksLikeVin || isImagePending) 
                ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                : (isObdInMainInput 
                  ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                  : 'border-white/5')}`}>
            <div className="relative">
              <textarea 
                className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 resize-none min-h-[140px] text-lg font-medium relative z-10" 
                placeholder={t('common.describe_problem')} 
                value={state.userInput} 
                onChange={handleInputChange} 
              />
              {/* Highlight Overlay for Main Textarea */}
              <AnimatePresence>
                {looksLikeVin && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute top-0 right-0 z-20 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                      {isValidVin ? t('common.vin_verified', 'VIN VERIFIED') : t('common.vin_detected', 'VIN DETECTED')}
                    </span>
                  </motion.div>
                )}
                {isObdInMainInput && !looksLikeVin && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute top-0 right-0 z-20 flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      {t('common.code_detected', 'CODE DETECTED')}: {detectedOBD}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dedicated OBD Input Section */}
            <div className="relative group/obd mt-2 mb-4">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Activity size={16} className={`${obdInput.trim() && isValidObd ? 'text-amber-400' : 'text-cyan-500/30'} group-focus-within/obd:text-cyan-400 transition-colors`} />
              </div>
              <input 
                type="text"
                placeholder={t('common.enter_obd_code', 'OR ENTER OBD-II CODE (e.g. P0300)')}
                className={`w-full bg-black/20 border rounded-2xl py-3 pl-12 pr-4 text-sm font-mono transition-all outline-none placeholder-slate-600 ${obdInput.trim() && isValidObd ? 'border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5 text-cyan-400 focus:border-cyan-500/30'}`}
                value={obdInput}
                onChange={(e) => setObdInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidObd) {
                    setShowOBD(true);
                  }
                }}
              />
              <AnimatePresence>
                {obdInput.trim() && isValidObd && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2"
                  >
                    <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[7px] font-black text-amber-400 uppercase tracking-tighter">
                      VALID
                    </div>
                    <button 
                      onClick={() => setShowOBD(true)}
                      className="px-3 py-1 bg-amber-500 text-black rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                      {t('common.analyze_now', 'ANALYZE NOW')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Image Preview */}
            <AnimatePresence>
              {state.selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative mb-6 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-32 h-32 shrink-0">
                      <img 
                        src={`data:image/jpeg;base64,${state.selectedImage}`} 
                        alt="Selected" 
                        className="w-full h-full object-cover rounded-2xl border-2 border-emerald-500/50"
                      />
                      <button 
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                          {t('common.visual_data_ready', 'VISUAL DATA READY')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-3">
                        {t('common.visual_analysis_desc', 'THE WIZARD WILL ANALYZE THIS IMAGE FOR DAMAGE, PARTS, OR WARNING LIGHTS.')}
                      </p>
                      <button 
                        onClick={startAnalysis}
                        className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        {t('common.analyze_photo', 'ANALYZE PHOTO')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Error Message */}
            <AnimatePresence>
              {state.error && !['validation', 'network', 'quota'].includes(state.errorCategory || '') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider leading-tight">
                      {String(state.error)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Input Actions Toolbar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
               <div className="flex gap-2">
                 <input 
                   type="file" 
                   accept="image/*" 
                   id="image-upload" 
                   className="hidden" 
                   onChange={handleImageUpload}
                 />
                 <label 
                   htmlFor="image-upload"
                   className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                 >
                   <Camera size={14} className="text-cyan-400" />
                   <span>{t('common.add_photo', 'ADD PHOTO')}</span>
                 </label>
                 <button 
                   onClick={() => setShowOBD(true)}
                   className="px-4 py-2.5 bg-slate-800/40 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                 >
                   <Activity size={14} />
                   <span>{t('common.obd_breaker', 'OBD BREAKER')}</span>
                 </button>
               </div>

               <div className="flex items-center gap-3">
                 <AnimatePresence>
                   {isValidVin && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       className="flex items-center gap-2 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"
                     >
                       <div className="w-3 h-3 rounded-full bg-cyan-500 flex items-center justify-center">
                         <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                         </svg>
                       </div>
                       <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{t('common.verified', 'VERIFIED')}</span>
                     </motion.div>
                   )}

                   {isValidObd && (
                     <motion.button 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       onClick={() => setShowOBD(true)}
                       className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all group"
                     >
                       <Activity size={12} className="text-amber-400 animate-pulse" />
                       <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest group-hover:text-amber-300">
                         {t('common.obd_detected', 'OBD CODE DETECTED - ANALYZE?')}
                       </span>
                     </motion.button>
                   )}
                 </AnimatePresence>

                 {state.userInput.trim().length > 0 && (
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded-lg">
                       {state.userInput.trim().length}/17
                     </span>
                     <button 
                       onClick={() => setState(prev => ({ ...prev, userInput: '', error: undefined }))}
                       className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors"
                     >
                       {t('common.clear', 'CLEAR')}
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          <div className="mt-8">
            <VerifiedPartnersGrid livePartners={livePartners} />
          </div>

          <div className="h-40" />
          </main>
        )}
        <div className="bg-slate-900/95 backdrop-blur-ultra rounded-t-[3rem] px-8 pt-10 pb-12 border-t border-white/5 shadow-2xl relative z-20 safe-area-pb">
          <button 
            onClick={startAnalysis} 
            disabled={state.isAnalyzing || (!state.userInput.trim() && !state.selectedImage)} 
            className={`w-full py-6 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 transition-all rounded-[2rem] flex items-center justify-center shadow-xl active:scale-95 shadow-cyan-900/20 ${state.isAnalyzing ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center gap-3">
              {state.isAnalyzing && <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />}
              <span className="font-black tracking-[0.2em] uppercase text-xs text-white">
                {state.isAnalyzing 
                  ? `⚡ ${t('common.analyzing')}` 
                  : `🔍 ${t('common.start_analysis')}`}
              </span>
            </div>
          </button>
        </div>
        {state.isAnalyzing && <ProtocolInitialization />}
        {state.result && <div className="fixed inset-0 z-[100] animate-modal-enter bg-[#0a0f1e]"><ResultView result={state.result} mode={state.mode} onReset={resetApp} recommendedPartners={recommendedPartners} isPartnersLoading={isPartnersLoading} user={user} onLogin={handleLogin} /></div>}
        
        <ErrorModal 
          isOpen={!!state.error && (state.errorCategory === 'network' || state.errorCategory === 'quota' || (state.errorCategory === 'validation' && !state.userInput.trim()))}
          title={state.errorCategory === 'validation' ? t('common.input_required', 'INPUT REQUIRED') : "WIZARD CONNECTION ERROR"}
          message={state.error || ''}
          category={state.errorCategory}
          onRetry={() => setState(prev => ({ ...prev, error: undefined, errorCategory: undefined }))}
          onBack={() => {
            setState(prev => ({ ...prev, error: undefined, errorCategory: undefined, isStarted: false }));
            resetApp();
          }}
        />
      </div>
    );
  };

export default App;
