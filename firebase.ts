import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, enableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import 'firebase/analytics'; 
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// The "Wizard" Connection Shield - Optimized for repairwizardpro
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    // @ts-ignore - "Wizard Shield" optimization for specific network environments
    useFetchStreams: false,
    host: 'firestore.googleapis.com',
    ssl: true,
  }, databaseId);
} catch (e) {
  firestoreDb = getFirestore(app, databaseId);
}

// Explicitly ensure network is enabled
enableNetwork(firestoreDb).catch(err => {
  console.warn("Failed to enable Firestore network:", err);
});

export const db = firestoreDb;

// Analytics
export const analyticsPromise = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null);

export default app;
