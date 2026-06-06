export function PitchCardSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading pitch"
      className="relative bg-card rounded-2xl ring-1 ring-[color:var(--border)] overflow-hidden flex flex-col"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/30 to-transparent z-10"
      />

      {/* Video poster placeholder */}
      <div className="relative aspect-video bamboo-shimmer">
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="h-4 w-16 rounded-full bg-background/40" />
          <span className="h-4 w-12 rounded-full bg-background/40" />
        </div>
        <div className="absolute -bottom-5 left-5 size-11 rounded-full bamboo-shimmer ring-2 ring-card z-10" />
      </div>

      <div className="p-5 pt-7 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <span className="h-2.5 w-28 rounded bamboo-shimmer" />
          <span className="h-2.5 w-12 rounded bamboo-shimmer" />
        </div>
        <span className="h-7 w-3/4 rounded bamboo-shimmer mt-1" />
        <span className="h-2.5 w-1/3 rounded bamboo-shimmer" />
        <span className="h-3 w-full rounded bamboo-shimmer mt-2" />
        <span className="h-3 w-5/6 rounded bamboo-shimmer" />

        <div className="border-y border-dashed border-[color:var(--border)] py-3 mt-2">
          <span className="block h-8 w-full rounded bamboo-shimmer" />
        </div>

        <div className="flex items-stretch gap-3">
          <span className="flex-1 h-8 rounded bamboo-shimmer" />
          <span className="flex-1 h-8 rounded bamboo-shimmer" />
          <span className="flex-1 h-8 rounded bamboo-shimmer" />
        </div>
        <span className="h-1.5 w-full rounded-full bamboo-shimmer mt-2" />
        <div className="flex gap-2 mt-2">
          <span className="flex-1 h-10 rounded-lg bamboo-shimmer" />
          <span className="flex-1 h-10 rounded-lg bamboo-shimmer" />
        </div>
      </div>
    </article>
  );
}
