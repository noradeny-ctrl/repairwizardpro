import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, ShieldAlert, ChevronRight, Info } from 'lucide-react';

/**
 * INTERFACE: PinData
 * Defines the structure for each PCM terminal pin.
 */
interface PinData {
  pinNumber: number;
  wireColor: string;
  cssColor: string;
  functionDesc: string;
  expectedVoltage: string;
  isRelevant: boolean;
}

/**
 * MOCK DATA: Hyundai 2.4L Throttle Body PCM Mapping
 */
const HYUNDAI_PCM_DATA: PinData[] = [
  {
    pinNumber: 101,
    wireColor: 'Yellow',
    cssColor: '#fbbf24', // Warning Gold/Yellow
    functionDesc: 'ETC Motor Power (+)',
    expectedVoltage: '5.0V (Key On)',
    isRelevant: true,
  },
  {
    pinNumber: 100,
    wireColor: 'Black',
    cssColor: '#4b5563', // Dark Gray/Black
    functionDesc: 'TPS Signal 1',
    expectedVoltage: '0.5V - 4.5V',
    isRelevant: true,
  },
  {
    pinNumber: 59,
    wireColor: 'Orange',
    cssColor: '#f97316', // Orange
    functionDesc: 'Sensor Ground',
    expectedVoltage: '0.02V Max',
    isRelevant: true,
  },
  {
    pinNumber: 98,
    wireColor: 'Pink',
    cssColor: '#ec4899',
    functionDesc: 'TPS Signal 2',
    expectedVoltage: '4.5V - 0.5V (Inverted)',
    isRelevant: true,
  },
  {
    pinNumber: 102,
    wireColor: 'Green',
    cssColor: '#22c55e',
    functionDesc: 'ETC Motor Power (-)',
    expectedVoltage: 'PWM Signal',
    isRelevant: true,
  },
];

const WiringTerminal: React.FC = () => {
  const [selectedPinNumber, setSelectedPinNumber] = useState<number | null>(101);

  // Generate the 50-pin grid (105 down to 56)
  const gridPins = useMemo(() => {
    const pins = [];
    for (let i = 105; i >= 56; i--) {
      const data = HYUNDAI_PCM_DATA.find((p) => p.pinNumber === i);
      pins.push({
        num: i,
        data: data || null,
      });
    }
    return pins;
  }, []);

  const selectedPin = useMemo(() => 
    HYUNDAI_PCM_DATA.find(p => p.pinNumber === selectedPinNumber), 
    [selectedPinNumber]
  );

  return (
    <div className="min-h-screen bg-[#010409] text-[#00f3ff] p-4 md:p-8 font-sans selection:bg-[#00f3ff]/30">
      {/* Global Style for Orbitron Font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
          .font-orbitron { font-family: 'Orbitron', sans-serif; }
          .cyber-glow { text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
          .pin-glow { filter: drop-shadow(0 0 5px currentColor); }
        `}
      </style>

      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-12 border-b border-[#00f3ff]/20 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="text-[#fbbf24] animate-pulse" size={20} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#fbbf24]">
                System: Powertrain Control Module
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-orbitron uppercase tracking-tighter italic cyber-glow">
              Terminal <span className="text-white">Matrix</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vehicle Profile</p>
            <p className="text-sm font-bold text-white uppercase tracking-tight">Hyundai 2.4L GDI / Theta II</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: The Harness Block */}
        <section className="lg:col-span-7 bg-black/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={120} />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f3ff]/10 flex items-center justify-center border border-[#00f3ff]/20">
                <Activity size={20} />
              </div>
              <h2 className="font-orbitron text-lg uppercase tracking-tight">Harness Connector C10-A</h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00f3ff]" /> Live
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/20" /> Inactive
              </div>
            </div>
          </div>

          {/* 50-Pin Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {gridPins.map((pin) => (
              <motion.button
                key={pin.num}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => pin.data && setSelectedPinNumber(pin.num)}
                className={`
                  relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all
                  ${pin.data 
                    ? 'cursor-pointer border-[#00f3ff]/40 bg-[#00f3ff]/5 hover:bg-[#00f3ff]/20 hover:border-[#00f3ff]' 
                    : 'cursor-default border-white/5 bg-white/2 opacity-30'}
                  ${selectedPinNumber === pin.num ? 'ring-2 ring-[#00f3ff] ring-offset-2 ring-offset-[#010409] !opacity-100' : ''}
                `}
                style={{ color: pin.data?.cssColor || 'inherit' }}
              >
                <span className="text-[8px] font-black absolute top-1 left-1 opacity-50 text-white">
                  {pin.num}
                </span>
                {pin.data && (
                  <div 
                    className="w-3 h-3 rounded-full pin-glow" 
                    style={{ backgroundColor: pin.data.cssColor }} 
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
            <Info className="text-[#00f3ff] shrink-0" size={16} />
            <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wide">
              Terminal view from wire-insertion side. Ensure probe is correctly seated to avoid pin deformation. 
              Reference Hyundai TSB #21-BE-004 for specific pin tension specifications.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Live Diagnostic Feed */}
        <section className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedPin ? (
              <motion.div
                key={selectedPin.pinNumber}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col gap-6"
              >
                {/* HUD Card */}
                <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden flex-1 shadow-2xl">
                  {/* Decorative Scanline */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          Selected Node
                        </span>
                      </div>
                      <ShieldAlert className="text-[#fbbf24]" size={24} />
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pin Identification</p>
                      <h3 
                        className="text-9xl font-black font-orbitron italic tracking-tighter leading-none"
                        style={{ 
                          color: selectedPin.cssColor,
                          filter: `drop-shadow(0 0 20px ${selectedPin.cssColor}44)`
                        }}
                      >
                        {selectedPin.pinNumber}
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Wire Color</p>
                          <p className="text-sm font-bold text-white uppercase">{selectedPin.wireColor}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Voltage Spec</p>
                          <p className="text-sm font-bold text-[#fbbf24] uppercase">{selectedPin.expectedVoltage}</p>
                        </div>
                      </div>

                      <div className="p-6 bg-[#00f3ff]/5 rounded-3xl border border-[#00f3ff]/20">
                        <p className="text-[9px] font-black text-[#00f3ff] uppercase tracking-widest mb-2">Circuit Function</p>
                        <p className="text-lg font-bold text-white leading-tight uppercase font-orbitron">
                          {selectedPin.functionDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Signal Active</span>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black text-white hover:text-[#00f3ff] transition-colors uppercase tracking-widest group">
                      Scope Trace <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Secondary Info Card */}
                <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert className="text-[#fbbf24]" size={18} />
                    <h4 className="text-xs font-black text-[#fbbf24] uppercase tracking-widest">Diagnostic Advisory</h4>
                  </div>
                  <p className="text-[11px] text-[#fbbf24]/80 leading-relaxed uppercase font-bold">
                    If voltage deviates by more than 0.5V from spec, inspect harness for high resistance or short to ground. 
                    Do not back-probe without proper terminal adapters.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center">
                <div>
                  <Info className="mx-auto mb-4 text-slate-600" size={48} />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Select a highlighted pin to view diagnostic data
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-black text-xs">RW</span>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
            RepairWizard<span className="text-[#00f3ff]">.net</span>
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          &copy; 2026 Automotive Intelligence Systems / v4.2.0-Matrix
        </p>
      </footer>
    </div>
  );
};

export default WiringTerminal;
