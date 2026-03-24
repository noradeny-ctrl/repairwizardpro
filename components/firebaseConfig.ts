import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzmmMPD5BDzeolncRicHl6S0qMPsfq9gs",
  authDomain: "repairwizard-db.firebaseapp.com",
  projectId: "repairwizard-db",
  storageBucket: "repairwizard-db.firebasestorage.app",
  messagingSenderId: "614298841525",
  appId: "1:614298841525:web:c49e2e60fa2c9da79869fc"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
