'use client';

import { ReactNode, CSSProperties } from 'react';
import { useRevealOnScroll } from '@/lib/use-reveal';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
};

export function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const style: CSSProperties = delay ? { animationDelay: `${delay}ms` } : {};
  const cls = `reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`.trim();
  const Tag = as as 'div';
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={cls} style={style}>
      {children}
    </Tag>
  );
}
