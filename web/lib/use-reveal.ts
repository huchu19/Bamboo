'use client';

import { useEffect, useRef, useState } from 'react';

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.12,
  rootMargin = '0px 0px -60px 0px',
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
