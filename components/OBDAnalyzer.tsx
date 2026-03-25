
import React from 'react';
import { RegionMode } from '../types';

interface OBDAnalyzerProps {
  userInput: string;
  setUserInput: (val: string) => void;
  vin: string;
  setVin: (val: string) => void;
  isDeepScan: boolean;
  setIsDeepScan: (val: boolean) => void;
  isAnalyzing: boolean;
  isRTL: boolean;
}

const OBDAnalyzer: React.FC<OBDAnalyzerProps> = ({ 
  userInput, 
  setUserInput, 
  vin, 
  setVin, 
  isDeepScan, 
  setIsDeepScan, 
  isAnalyzing, 
  isRTL 
}) => {
  return (
    <section className="animate-slide-up relative space-y-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-cyan-500 animate-ping' : 'bg-cyan-500'}`}></div>
          <h2 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">
            {isRTL ? "پشکنینا ئۆتۆمبێلێ" : "OBD ANALYZER"}
          </h2>
        </div>
        <div className="flex gap-1.5">
          <span className={`w-1 h-1 rounded-full bg-cyan-500/40 ${isAnalyzing ? 'animate-bounce' : ''}`}></span>
          <span className={`w-1 h-1 rounded-full bg-cyan-500/30 ${isAnalyzing ? 'animate-bounce [animation-delay:0.2s]' : ''}`}></span>
          <span className={`w-1 h-1 rounded-full bg-cyan-500/20 ${isAnalyzing ? 'animate-bounce [animation-delay:0.4s]' : ''}`}></span>
        </div>
      </div>
      
      <div className={`relative bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md transition-all duration-500 ${isAnalyzing ? 'ring-2 ring-cyan-500/20 bg-slate-800/60' : ''}`}>
        {isAnalyzing && (
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 animate-scan-line"></div>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              {isRTL ? "کۆدێ OBD یان ئاریشە" : "OBD CODE OR PROBLEM"}
            </label>
            <textarea 
              className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 resize-none min-h-[100px] text-lg font-medium" 
              placeholder={isRTL ? "کۆدێ OBD بنڤیسە یان ئاریشێ وەسف بکە..." : "Enter OBD code or describe car problem..."} 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                {isRTL ? "کۆدێ VIN (نەچار نینە)" : "VIN NUMBER (OPTIONAL)"}
              </label>
              <input 
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="17-character VIN..."
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                disabled={isAnalyzing}
                maxLength={17}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setIsDeepScan(!isDeepScan)}
                disabled={isAnalyzing}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border transition-all active:scale-95 ${isDeepScan ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isDeepScan ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isRTL ? "پشکنینا کویر" : "DEEP SCAN"}
                  </span>
                </div>
                <span className="text-[8px] opacity-50">
                  {isDeepScan ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OBDAnalyzer;
