type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

export function BambooLeaf({ size = 12, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M2 14 C 6 12, 10 8, 14 2" />
      <path
        d="M14 2 C 11 3, 8 5, 6 9 C 8 9, 11 7, 14 2 Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M2 14 C 5 13, 8 11, 10 8" opacity="0.5" />
    </svg>
  );
}

export function BambooNode({ size = 14, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect x="5" y="2" width="6" height="12" rx="1.2" />
      <line x1="4" y1="6" x2="12" y2="6" />
      <line x1="4" y1="10" x2="12" y2="10" />
      <circle cx="8" cy="2" r="1" fill="var(--gold, currentColor)" stroke="none" />
    </svg>
  );
}

export function BambooGrowth({
  size = 80,
  progress = 0,
  className,
  ...props
}: IconProps & { progress?: number }) {
  const segments = 5;
  const filledSegments = Math.max(0, Math.min(segments, Math.round((progress / 100) * segments)));
  const segmentHeight = 100 / segments;
  return (
    <svg
      width={size}
      height={size * 4}
      viewBox="0 0 24 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const y = 100 - (i + 1) * segmentHeight;
        const filled = i < filledSegments;
        return (
          <g key={i}>
            <rect
              x="8"
              y={y + 2}
              width="8"
              height={segmentHeight - 4}
              rx="2"
              fill={filled ? "var(--gold)" : "transparent"}
              stroke={filled ? "var(--gold)" : "currentColor"}
              strokeOpacity={filled ? 1 : 0.25}
            />
            <line
              x1="6"
              y1={y + 2}
              x2="18"
              y2={y + 2}
              stroke={filled ? "var(--primary)" : "currentColor"}
              strokeOpacity={filled ? 1 : 0.4}
              strokeWidth="1.2"
            />
          </g>
        );
      })}
      {/* sprouting leaf at top when fully grown */}
      {filledSegments === segments && (
        <path
          d="M12 2 C 16 4, 20 6, 22 2 C 20 6, 16 8, 12 8 Z"
          fill="var(--gold)"
          stroke="var(--gold)"
        />
      )}
    </svg>
  );
}

export function VerifiedLeafBadge({ size = 14, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* leaf-shaped badge */}
      <path
        d="M3 17 C 3 9, 9 3, 17 3 C 17 11, 11 17, 3 17 Z"
        fill="currentColor"
      />
      {/* mid-rib */}
      <path
        d="M5 15 C 9 12, 12 9, 15 5"
        stroke="var(--gold-foreground)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* check */}
      <path
        d="M7 10 L 9.5 12.5 L 14 7"
        stroke="var(--gold-foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RootGlyph({ size = 80, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <line x1="100" y1="0" x2="100" y2="50" />
      <circle cx="100" cy="50" r="4" fill="currentColor" />
      <path d="M100 50 C 80 65, 50 75, 20 110" />
      <path d="M100 50 C 120 65, 150 75, 180 110" />
      <path d="M100 50 C 90 70, 70 90, 50 115" opacity="0.6" />
      <path d="M100 50 C 110 70, 130 90, 150 115" opacity="0.6" />
      <path d="M100 50 C 100 75, 100 95, 100 118" opacity="0.4" />
    </svg>
  );
}
