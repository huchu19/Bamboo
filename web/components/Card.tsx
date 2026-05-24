'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-[var(--bg-primary)] border border-[var(--border-light)]',
    elevated: 'bg-[var(--bg-primary)] shadow-[var(--shadow-md)]',
    bordered: 'bg-[var(--bg-secondary)] border-2 border-[var(--accent-green)]',
  };

  return (
    <div className={`rounded-lg p-6 transition-all ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
