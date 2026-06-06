'use client';

/**
 * Auth Context for Bamboo web app
 *
 * Dev mode: when NEXT_PUBLIC_DEV_BYPASS_AUTH=true (default in MVP), this
 * skips Firebase entirely and returns a mock user. The role can be switched
 * at runtime via the dev role switcher in the nav (writes to localStorage).
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, UserRole } from '../types';

const DEV_BYPASS =
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== 'false'; // default ON

const ROLE_STORAGE_KEY = 'bamboo:dev-role';

interface AuthContextType {
  firebaseUser: any | null;
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  /** Dev-only: swap the mocked role. No-op when bypass is off. */
  setDevRole: (role: UserRole) => void;
  devBypass: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeMockUser(role: UserRole): User {
  const now = Date.now();
  return {
    uid: role === 'inventor' ? 'dev-inventor' : 'dev-investor',
    email: `${role}@bamboo.dev`,
    displayName: role === 'inventor' ? 'Maya Chen (Demo)' : 'Demo Investor',
    role,
    createdAt: now,
    updatedAt: now,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!DEV_BYPASS);

  // Dev bypass: hydrate mock user from localStorage on mount.
  useEffect(() => {
    if (!DEV_BYPASS) return;
    const stored =
      (typeof window !== 'undefined' &&
        (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null)) ||
      'investor';
    const mock = makeMockUser(stored);
    setFirebaseUser({ uid: mock.uid, email: mock.email });
    setUser(mock);
    setIsLoading(false);
  }, []);

  // Real Firebase path (only used when bypass is off).
  useEffect(() => {
    if (DEV_BYPASS) return;

    let unsub: (() => void) | undefined;
    import('@/lib/firebase/auth').then(({ onAuthStateChange }) => {
      import('@/lib/firebase/firestore').then(({ getUser }) => {
        unsub = onAuthStateChange(async (authUser) => {
          setIsLoading(true);
          setFirebaseUser(authUser);
          if (authUser) {
            try {
              setUser(await getUser(authUser.uid));
            } catch (err) {
              console.error('Failed to fetch user profile:', err);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });
      });
    });

    return () => unsub?.();
  }, []);

  const handleLogout = async () => {
    if (DEV_BYPASS) {
      // No-op in dev: keep the mock signed in.
      return;
    }
    try {
      const { logoutUser } = await import('@/lib/firebase/auth');
      await logoutUser();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
    setFirebaseUser(null);
    setUser(null);
  };

  const setDevRole = (role: UserRole) => {
    if (!DEV_BYPASS) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
    const mock = makeMockUser(role);
    setFirebaseUser({ uid: mock.uid, email: mock.email });
    setUser(mock);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        role: user?.role || null,
        isLoading,
        isAuthenticated: DEV_BYPASS ? true : !!firebaseUser,
        logout: handleLogout,
        setDevRole,
        devBypass: DEV_BYPASS,
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
