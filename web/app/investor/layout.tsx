'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <ProtectedRoute requiredRole="investor">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              🎋 Bamboo
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/investor/dashboard" className="text-gray-700 hover:text-green-600 transition font-medium">
                Portfolio
              </Link>
              <Link href="/discover" className="text-gray-700 hover:text-green-600 transition font-medium">
                Discover
              </Link>
              <Link href="/investor/watchlist" className="text-gray-700 hover:text-green-600 transition font-medium">
                Watchlist
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-green-600 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="md:hidden border-t border-gray-200 p-4 space-y-2">
              <Link href="/investor/dashboard" className="block py-2 text-gray-700 hover:text-green-600">
                Portfolio
              </Link>
              <Link href="/discover" className="block py-2 text-gray-700 hover:text-green-600">
                Discover
              </Link>
              <Link href="/investor/watchlist" className="block py-2 text-gray-700 hover:text-green-600">
                Watchlist
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
