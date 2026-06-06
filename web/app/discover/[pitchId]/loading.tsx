import { SiteNav } from "@/components/bamboo/SiteNav";

export default function PitchDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <span className="block h-3 w-64 bamboo-shimmer rounded" />
      </div>

      <div
        aria-busy="true"
        className="max-w-7xl mx-auto px-6 pt-6 pb-32 grid lg:grid-cols-12 gap-10"
      >
        <main className="lg:col-span-8 space-y-10">
          <header className="space-y-4">
            <div className="flex gap-2">
              <span className="h-5 w-24 bamboo-shimmer rounded-full" />
              <span className="h-5 w-16 bamboo-shimmer rounded-full" />
              <span className="h-3 w-32 bamboo-shimmer rounded mt-1" />
            </div>
            <span className="block h-20 w-3/4 bamboo-shimmer rounded" />
            <span className="block h-5 w-full bamboo-shimmer rounded" />
            <span className="block h-5 w-5/6 bamboo-shimmer rounded" />
            <div className="flex items-center gap-3 mt-5">
              <span className="size-10 rounded-full bamboo-shimmer" />
              <div className="space-y-2">
                <span className="block h-3 w-28 bamboo-shimmer rounded" />
                <span className="block h-2 w-20 bamboo-shimmer rounded" />
              </div>
            </div>
          </header>

          <div className="aspect-video bamboo-shimmer rounded-3xl" />

          <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-6">
            <span className="size-40 rounded-full bamboo-shimmer" />
            <div className="space-y-3">
              <span className="block h-3 w-40 bamboo-shimmer rounded" />
              <span className="block h-16 w-full bamboo-shimmer rounded" />
              <div className="grid grid-cols-3 gap-px">
                <span className="h-14 bamboo-shimmer rounded" />
                <span className="h-14 bamboo-shimmer rounded" />
                <span className="h-14 bamboo-shimmer rounded" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block h-8 w-40 bamboo-shimmer rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="block h-16 w-full bamboo-shimmer rounded-xl" />
            ))}
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[color:var(--ink)] rounded-3xl p-6 ring-1 ring-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="h-16 bamboo-shimmer rounded" />
              ))}
            </div>
            <span className="block h-1.5 w-full bamboo-shimmer rounded-full" />
            <span className="block h-14 w-full bamboo-shimmer rounded-lg" />
            <span className="block h-12 w-full bamboo-shimmer rounded-lg" />
          </div>
        </aside>
      </div>
    </div>
  );
}
