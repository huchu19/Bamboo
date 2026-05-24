'use client';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header with logo */}
      <div className="px-4 py-6 border-b border-gray-200 bg-white">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-2xl font-bold text-green-600">
            🎋 Bamboo
          </Link>
        </div>
      </div>

      {/* Auth content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-gray-200 bg-white text-center text-sm text-gray-600">
        <p>© 2026 Bamboo. Plant Your Seed. Build Your Portfolio.</p>
      </div>
    </div>
  );
}
