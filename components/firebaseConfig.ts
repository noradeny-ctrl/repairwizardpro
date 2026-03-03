import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Minimal placeholder config - replace with actual credentials in .env
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
