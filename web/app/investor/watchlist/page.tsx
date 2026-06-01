'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PitchCard from '@/components/pitch/PitchCard';
import type { Pitch } from '@/types';

export default function WatchlistPage() {
  const { firebaseUser } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const loadWatchlist = async () => {
      const { getWatchlistPitches } = await import('@/lib/firebase/firestore');
      const data = await getWatchlistPitches(firebaseUser.uid);
      setPitches(data);
      setLoading(false);
    };

    loadWatchlist();
  }, [firebaseUser?.uid]);

  const handleRemove = async (pitchId: string) => {
    if (!firebaseUser?.uid) return;
    const { removeFromWatchlist } = await import('@/lib/firebase/firestore');
    await removeFromWatchlist(firebaseUser.uid, pitchId);
    setPitches((prev) => prev.filter((p) => p.id !== pitchId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Watchlist</h1>
        <p className="text-gray-600 mt-2">Pitches you've saved to review later</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading watchlist...</p>
          </div>
        </div>
      ) : pitches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">♡</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Browse pitches and click "Watchlist" to save ones you want to track.
          </p>
          <Link
            href="/discover"
            className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
          >
            Browse Pitches
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{pitches.length} saved pitch{pitches.length !== 1 ? 'es' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div key={pitch.id} className="relative">
                <PitchCard pitch={pitch} />
                <button
                  onClick={() => handleRemove(pitch.id)}
                  className="absolute top-3 right-3 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition text-xs shadow-sm"
                  title="Remove from watchlist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
