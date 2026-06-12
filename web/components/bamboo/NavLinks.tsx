'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * Auth-aware primary nav links. Inventors get a direct "My Pitches" +
 * "Plant a Pitch" entry; investors get "Your Grove". Signed-out visitors see
 * only the public links.
 */
export function NavLinks() {
  const { isAuthenticated, role } = useAuth();

  const linkCls =
    'hover:text-[color:var(--gold)] transition-colors cursor-pointer';

  return (
    <>
      <Link href="/discover" className={linkCls}>
        Walk the Grove
      </Link>

      {isAuthenticated && role === 'inventor' && (
        <>
          <Link href="/dashboard" className={linkCls}>
            Command Deck
          </Link>
          <Link href="/pitch/new" className={linkCls}>
            Plant a Pitch
          </Link>
        </>
      )}

      {isAuthenticated && role === 'investor' && (
        <Link href="/investor/dashboard" className={linkCls}>
          Command Deck
        </Link>
      )}

      <Link href="/#pricing" className={linkCls}>
        Harvest
      </Link>
    </>
  );
}
