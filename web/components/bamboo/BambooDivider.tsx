type BambooDividerProps = {
  className?: string;
  label?: string;
};

export function BambooDivider({ className = "", label }: BambooDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`relative flex items-center justify-center my-12 ${className}`}
    >
      <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[color:var(--border)] to-transparent" />
      <span className="relative inline-flex items-center gap-2 bg-background px-4">
        <span className="size-1 rounded-full bg-[color:var(--gold)]/60" />
        <span className="size-2 rounded-full bg-[color:var(--gold)] ring-2 ring-background" />
        <span className="size-1 rounded-full bg-[color:var(--gold)]/60" />
        {label && (
          <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        )}
      </span>
    </div>
  );
}
