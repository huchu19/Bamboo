'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * Primary nav links. Roles are unified — every signed-in user gets the same
 * links (one dashboard for pitches + portfolio). Signed-out visitors see only
 * the public links.
 */
export function NavLinks() {
  const { isAuthenticated } = useAuth();

  const linkCls =
    'hover:text-[color:var(--gold)] transition-colors cursor-pointer';

  return (
    <>
      <Link href="/discover" className={linkCls}>
        Discover
      </Link>

      {isAuthenticated && (
        <Link href="/dashboard" className={linkCls}>
          Dashboard
        </Link>
      )}

      <Link href="/#pricing" className={linkCls}>
        Pricing
      </Link>
    </>
  );
}
