import Link from "next/link";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { RootGlyph, BambooLeaf } from "@/components/bamboo/BambooIcons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            404 · Lost in the rows
          </p>

          <div className="my-8 flex justify-center">
            <RootGlyph size={140} className="text-[color:var(--primary)]/60" />
          </div>

          <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tighter leading-[0.9]">
            This Grove
            <br />
            Is Empty.
          </h1>

          <p className="text-base md:text-lg text-foreground/70 mt-6 max-w-md mx-auto leading-snug">
            The seed you’re looking for hasn’t been planted here — or it’s grown
            into something with a different name.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/discover"
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
            >
              <BambooLeaf size={12} className="text-[color:var(--gold)]" />
              Walk the Grove
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[color:var(--input)] rounded-lg hover:bg-secondary transition-all"
            >
              Back to Start
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
