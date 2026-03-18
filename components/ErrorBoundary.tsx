import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error (${parsed.operationType}): ${parsed.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error, use the raw message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#010409] flex items-center justify-center p-6 font-orbitron">
          <div className="max-w-md w-full bg-[#0d1117] border border-red-500/30 rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">System Error Detected</h2>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Neural Link Interrupted</p>
            </div>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-xs text-red-400 font-mono break-words">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw size={18} />
              <span className="uppercase tracking-tighter">Reboot System</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
