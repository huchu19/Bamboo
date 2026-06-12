'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * Theme toggle styled for the SiteNav. Reads/writes the shared ThemeContext
 * (single source of truth for data-theme + localStorage). Theme-aware itself,
 * so it looks right in both modes.
 */
export function ThemeToggleButton({ variant = 'light' }: { variant?: 'light' | 'ink' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isInk = variant === 'ink';

  // Before hydration we don't know the stored theme; render a neutral
  // placeholder so the markup matches and there's no icon flash.
  const showDark = mounted && theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      className={`inline-flex items-center justify-center size-9 rounded-lg transition-colors ${
        isInk ? 'hover:bg-white/10' : 'hover:bg-foreground/5'
      }`}
    >
      {showDark ? (
        // Sun — click to go light
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon — click to go dark
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
