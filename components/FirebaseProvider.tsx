import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, FirebaseUser } from '../firebase';

interface FirebaseContextType {
  user: FirebaseUser | null;
  userProfile: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin' || firebaseUser.email === 'noradeny@gmail.com');
          } else {
            // Create new profile
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'noradeny@gmail.com' ? 'admin' : 'user',
              createdAt: Timestamp.now(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setIsAdmin(newProfile.role === 'admin');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, userProfile, loading, isAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
};
