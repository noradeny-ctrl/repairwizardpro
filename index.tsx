
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { FirebaseProvider } from './components/FirebaseProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

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
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
