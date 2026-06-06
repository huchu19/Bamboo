'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Decorative bamboo stalk that grows as the user scrolls the page.
 */
export function BambooStalk() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed right-6 top-0 z-40 hidden lg:block h-screen w-20"
    >
      <svg
        viewBox="0 0 80 800"
        preserveAspectRatio="xMidYMax meet"
        className="h-full w-full text-primary"
      >
        <motion.path
          d="M40 800 L40 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          style={{ pathLength: scrollYProgress }}
        />
        {[720, 600, 480, 360, 240, 120].map((y, i) => (
          <Node
            key={y}
            y={y}
            progress={scrollYProgress}
            index={i}
            side={i % 2 === 0 ? "left" : "right"}
          />
        ))}
        <Crown progress={scrollYProgress} />
      </svg>
    </div>
  );
}

function Node({
  y,
  progress,
  index,
  side,
}: {
  y: number;
  progress: MotionValue<number>;
  index: number;
  side: "left" | "right";
}) {
  const threshold = (6 - index) / 7;
  const opacity = useTransform(progress, [threshold - 0.05, threshold + 0.02], [0, 1]);
  const scale = useTransform(progress, [threshold - 0.05, threshold + 0.05], [0.4, 1]);
  const leafX = side === "left" ? -28 : 28;

  return (
    <motion.g style={{ opacity }}>
      <motion.circle
        cx="40"
        cy={y}
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ scale, transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx="40" cy={y} r="2" fill="var(--gold)" />
      <motion.path
        d={`M40 ${y} Q ${40 + leafX / 2} ${y - 10}, ${40 + leafX} ${y - 18}`}
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <motion.path
        d={`M40 ${y} Q ${40 + leafX / 2} ${y - 14}, ${
          40 + leafX + (side === "left" ? -4 : 4)
        } ${y - 24}`}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        fill="none"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function Crown({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.88, 1], [0, 1]);
  return (
    <motion.g style={{ opacity }}>
      <path
        d="M40 20 Q 28 8, 14 4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 20 Q 52 8, 66 4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 20 Q 34 4, 30 -4"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="40" cy="20" r="2.5" fill="var(--gold)" />
    </motion.g>
  );
}
