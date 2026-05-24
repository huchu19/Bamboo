'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function InventorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
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
            <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition">
              Dashboard
            </Link>
            <Link href="/pitch/new" className="text-gray-700 hover:text-green-600 transition">
              New Pitch
            </Link>
            <Link href="/payments" className="text-gray-700 hover:text-green-600 transition">
              Payments
            </Link>
            <button className="text-gray-700 hover:text-green-600 transition">Sign Out</button>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden border-t border-gray-200 p-4 space-y-2">
            <Link href="/dashboard" className="block text-gray-700 hover:text-green-600">
              Dashboard
            </Link>
            <Link href="/pitch/new" className="block text-gray-700 hover:text-green-600">
              New Pitch
            </Link>
            <Link href="/payments" className="block text-gray-700 hover:text-green-600">
              Payments
            </Link>
            <button className="block w-full text-left text-gray-700 hover:text-green-600">
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
