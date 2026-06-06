import { SiteNav } from "@/components/bamboo/SiteNav";
import { PitchCardSkeleton } from "@/components/bamboo/PitchCardSkeleton";

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="bg-[color:var(--ink)] border-b border-white/5 h-8" />

      <header className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div aria-busy="true" className="space-y-3">
          <span className="block h-3 w-48 bamboo-shimmer rounded" />
          <span className="block h-16 w-2/3 bamboo-shimmer rounded" />
          <span className="block h-3 w-1/2 bamboo-shimmer rounded mt-2" />
        </div>
        <div className="mt-8 flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-7 w-20 bamboo-shimmer rounded-full" />
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PitchCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
