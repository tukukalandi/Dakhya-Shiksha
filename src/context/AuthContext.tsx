import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, PRIMARY_ADMIN_EMAIL, loginWithGoogle, logoutUser, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  simulateAdminLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  simulateAdminLogin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulatedAdmin, setIsSimulatedAdmin] = useState<boolean>(() => {
    return localStorage.getItem('dakshya_simulated_admin') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isPrimary = (currentUser.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
        if (isPrimary) {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists() && adminDoc.data()?.isActive) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(isSimulatedAdmin);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSimulatedAdmin]);

  const handleLoginGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.warn('Google sign-in popup notice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('dakshya_simulated_admin');
      setIsSimulatedAdmin(false);
      setIsAdmin(false);
      await logoutUser();
    } finally {
      setLoading(false);
    }
  };

  const simulateAdminLogin = () => {
    localStorage.setItem('dakshya_simulated_admin', 'true');
    setIsSimulatedAdmin(true);
    setIsAdmin(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: isAdmin || isSimulatedAdmin,
        loading,
        loginWithGoogle: handleLoginGoogle,
        logout: handleLogout,
        simulateAdminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
