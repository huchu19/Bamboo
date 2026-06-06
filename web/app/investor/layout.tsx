'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteNav } from '@/components/bamboo/SiteNav';

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const tabs = [
    { href: '/investor/dashboard', label: 'Portfolio' },
    { href: '/investor/watchlist', label: 'Watchlist' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="inline-flex gap-1 p-1 bg-secondary rounded-xl ring-1 ring-[color:var(--border)]">
          {tabs.map((t) => {
            const active = path === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-5 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${
                  active
                    ? 'bg-[color:var(--ink)] text-[color:var(--ink-foreground)] shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-24 pt-8">{children}</div>
    </div>
  );
}
