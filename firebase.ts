import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import 'firebase/analytics'; // Ensure side-effects are loaded for component registration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Use initializeFirestore to force long polling, which is more reliable in some sandboxed environments
// Use the provided database ID or default to '(default)'
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, databaseId);
} catch (e) {
  // If already initialized (e.g. during HMR or module re-evaluation), get the existing instance
  firestoreDb = getFirestore(app, databaseId);
}

export const db = firestoreDb;

// Analytics (only if supported in the environment)
// Export as a promise to ensure it's handled asynchronously
export const analyticsPromise = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null);

export default app;
