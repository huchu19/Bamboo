'use client';

/**
 * Auth Context for Bamboo web app
 * Provides auth state and user role to child components
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User, UserRole } from '../types';

interface AuthContextType {
  firebaseUser: any | null;
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Import Firebase functions dynamically to avoid server-side initialization
    import('@/lib/firebase/auth')
      .then(({ onAuthStateChange, getCurrentUser: _getCurrentUser, logoutUser }) => {
        import('@/lib/firebase/firestore')
          .then(({ getUser }) => {
            const unsubscribe = onAuthStateChange(async (authUser) => {
              setIsLoading(true);
              setFirebaseUser(authUser);

              if (authUser) {
                try {
                  const userProfile = await getUser(authUser.uid);
                  setUser(userProfile);
                } catch (error) {
                  console.error('Failed to fetch user profile:', error);
                  setUser(null);
                }
              } else {
                setUser(null);
              }

              setIsLoading(false);
            });

            return () => unsubscribe();
          })
          .catch((error) => {
            console.error('Failed to import firestore:', error);
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.error('Failed to import auth:', error);
        setIsLoading(false);
      });
  }, [isInitialized]);

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('@/lib/firebase/auth');
      await logoutUser();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
    setFirebaseUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        role: user?.role || null,
        isLoading: isLoading || !isInitialized,
        isAuthenticated: !!firebaseUser,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
