'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'inventor' | 'investor';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role, devBypass, emailVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (devBypass) return; // MVP: skip all gating, just render.
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    // Hard block: unverified email can't reach protected pages.
    if (!emailVerified) {
      router.replace('/verify-email');
      return;
    }
    if (requiredRole && role !== requiredRole) {
      router.replace('/dashboard');
    }
  }, [devBypass, isAuthenticated, isLoading, role, requiredRole, emailVerified, router]);

  if (devBypass) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (!emailVerified) return null;
  if (requiredRole && role !== requiredRole) return null;

  return <>{children}</>;
}
