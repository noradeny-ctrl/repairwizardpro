
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, Zap, RefreshCw, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VINScannerProps {
  onScan: (image: string) => void;
  onClose: () => void;
}

const VINScanner: React.FC<VINScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      // Try environment camera first (mobile back camera)
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn("Environment camera failed, trying fallback:", err);
      
      try {
        // Fallback: Try any available video device (useful for laptops/desktops)
        const fallbackConstraints = { 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        console.error("Camera access error:", fallbackErr);
        setError("Unable to access camera. Please ensure you have a camera connected and have granted permission.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onScan(imageData);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-1">VIN SCANNER</h2>
          <p className="text-[8px] font-mono text-slate-400">ALIGN VIN PLATE WITHIN FRAME</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center bg-slate-900 border border-red-500/20 rounded-[2rem] max-w-xs">
            <p className="text-red-400 text-sm font-bold mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-[85%] aspect-[3/1] border-2 border-cyan-500/50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5" />
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-500 rounded-br-xl" />
                
                {/* Scanning Line */}
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="mt-6 text-[10px] font-black text-white/60 uppercase tracking-widest animate-pulse">
                Detecting VIN...
              </p>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-12 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
        <button 
          onClick={captureFrame}
          disabled={isCapturing || !!error}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 ${isCapturing ? 'opacity-50' : ''}`}
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <Scan size={32} className="text-black" />
          </div>
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Auto-Focus Active</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <RefreshCw size={12} className="text-cyan-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HD Resolution</span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VINScanner;
