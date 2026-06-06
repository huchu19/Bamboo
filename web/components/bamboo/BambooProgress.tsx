/**
 * Segmented progress bar that fills node-by-node like a bamboo stalk.
 * `value` is 0–100. `segments` controls node count.
 */
export function BambooProgress({
  value,
  segments = 10,
  className,
}: {
  value: number;
  segments?: number;
  className?: string;
}) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div
      className={`flex gap-1 ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const isFilled = i < filled;
        const isTip = i === filled - 1;
        return (
          <div
            key={i}
            className={`relative flex-1 h-3 rounded-sm transition-colors duration-500 ${
              isFilled
                ? "bg-gradient-to-b from-primary to-[color:var(--primary-deep)]"
                : "bg-white/10"
            }`}
            style={{ transitionDelay: isFilled ? `${i * 40}ms` : "0ms" }}
          >
            {isTip && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
