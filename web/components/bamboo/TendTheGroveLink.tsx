'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function TendTheGroveLink() {
  const { role } = useAuth();
  const href = role === 'inventor' ? '/dashboard' : '/investor/dashboard';
  const label = role === 'inventor' ? 'Tend the Grove' : 'Your Grove';
  return (
    <Link href={href} className="hover:text-[color:var(--gold)] transition-colors cursor-pointer">
      {label}
    </Link>
  );
}
