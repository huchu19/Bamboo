'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Floating dev toolbar — only renders when NEXT_PUBLIC_DEV_BYPASS_AUTH is on.
 * Lets us flip between inventor / investor views without logging in.
 */
export function DevRoleSwitcher() {
  const { devBypass, role, setDevRole } = useAuth();
  const pathname = usePathname();

  if (!devBypass) return null;

  const Btn = ({ value, label }: { value: 'inventor' | 'investor'; label: string }) => (
    <button
      onClick={() => {
        if (role === value) return;
        const ok = window.confirm(
          `Switch to ${label} mode?\n\nThis changes what you see across the app. You can switch back any time.`,
        );
        if (ok) setDevRole(value);
      }}
      className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
        role === value
          ? 'bg-[color:var(--gold)] text-black'
          : 'text-white/70 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-[100] flex items-center gap-1 rounded-full bg-black/90 px-2 py-1.5 shadow-2xl backdrop-blur ring-1 ring-white/10">
      <span className="px-2 text-[9px] font-mono uppercase tracking-widest text-white/40">
        Dev
      </span>
      <Btn value="inventor" label="Inventor" />
      <Btn value="investor" label="Investor" />
      <div className="mx-1 h-4 w-px bg-white/10" />
      <Link
        href="/dashboard"
        className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest text-white/70 hover:text-white"
      >
        Dash
      </Link>
      <Link
        href="/discover"
        className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest ${
          pathname?.startsWith('/discover') ? 'text-[color:var(--gold)]' : 'text-white/70 hover:text-white'
        }`}
      >
        Discover
      </Link>
    </div>
  );
}
