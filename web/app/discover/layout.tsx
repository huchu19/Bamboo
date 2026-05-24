'use client';

import Link from 'next/link';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            🎋 Bamboo
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/discover" className="text-gray-700 hover:text-green-600 transition">
              Discover
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-green-600 transition">
              Login
            </Link>
            <Link
              href="/register?role=investor"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
