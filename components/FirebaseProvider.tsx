import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, Timestamp, FirebaseUser, signInWithPopup, signOut, googleProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, handleFirestoreError, OperationType } from '../firebase';

interface FirebaseContextType {
  user: FirebaseUser | null;
  userProfile: any | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  logout: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed:", error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create profile in Firestore immediately
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const newProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: null,
        role: userCredential.user.email === 'noradeny@gmail.com' ? 'admin' : 'user',
        createdAt: Timestamp.now(),
      };
      await setDoc(userDocRef, newProfile).catch(err => {
        try {
          handleFirestoreError(err, OperationType.CREATE, 'users');
        } catch (fsErr: any) {
          console.error("Firestore Error:", fsErr.message);
        }
      });
      setUserProfile(newProfile);
      setIsAdmin(newProfile.role === 'admin');
    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please login instead.");
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      if (error.code === 'auth/user-not-found') {
        throw new Error("No user found with this email address.");
      }
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) return;
    try {
      // Update Auth profile
      await updateProfile(user, data);
      
      // Update Firestore profile
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
      
      // Update local state
      setUserProfile((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

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
          handleFirestoreError(error, OperationType.GET, 'users');
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
    <FirebaseContext.Provider value={{ user, userProfile, loading, isAdmin, login, loginWithEmail, registerWithEmail, resetPassword, updateUserProfile, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
};
