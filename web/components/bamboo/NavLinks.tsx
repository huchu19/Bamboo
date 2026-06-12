'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export type NavItem = { href: string; label: string };

/**
 * Single source of truth for the primary nav. Roles are unified — every
 * signed-in user gets the same links. Both the desktop bar and the mobile
 * menu render from this list so they can never drift apart.
 */
export function useNavItems(): NavItem[] {
  const { isAuthenticated, role } = useAuth();

  const items: NavItem[] = [{ href: '/discover', label: 'Discover' }];

  if (isAuthenticated) {
    items.push(
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/pitch/new', label: 'Plant Your Pitch' },
      { href: '/investor/watchlist', label: 'Watchlist' },
    );
  }

  if (role === 'admin') {
    items.push({ href: '/admin', label: 'Admin' });
  }

  items.push(
    { href: '/#pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  );

  return items;
}

/** Inline desktop link row. */
export function NavLinks() {
  const items = useNavItems();
  const linkCls =
    'hover:text-[color:var(--gold)] transition-colors cursor-pointer';

  return (
    <>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={linkCls}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
