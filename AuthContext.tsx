import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, testFirestoreConnection, handleFirestoreError, OperationType } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  dbConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
  dbConnected: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  useEffect(() => {
    testFirestoreConnection().then(setDbConnected);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile document
        const userDocPath = `users/${currentUser.uid}`;
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Chalamandra User',
            photoURL: currentUser.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          // Soft handle user profile sync error
          console.warn('Could not sync user profile to Firestore:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (): Promise<User | null> => {
    return await loginWithGoogle();
  };

  const handleSignOut = async (): Promise<void> => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        dbConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
