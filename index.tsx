
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#0A0E14] text-white p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold mb-4">System Anomaly Detected</h1>
          <p className="text-slate-400 text-sm mb-8 max-w-xs">
            The Wizard's interface encountered a critical fault. We've logged the error and are ready to restart.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Re-Initialize Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Browser environment check
if (typeof window !== "undefined") {
  console.log("Wizard_Engine: Online");
  
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("☢️ CRITICAL_FAULT:", message, error);
    // We don't want to infinite loop, but we want to log it
  };

  window.onunhandledrejection = (event) => {
    console.error("☢️ UNHANDLED_REJECTION:", event.reason);
    if (event.reason?.message?.toLowerCase().includes('rate exceeded')) {
      // This might be a platform-level 429
      console.warn("Rate limit detected at platform level.");
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
