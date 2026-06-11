import Link from "next/link";
import { BambooLeaf } from "./BambooIcons";
import { TendTheGroveLink } from "./TendTheGroveLink";
import { SiteNavActions } from "./SiteNavActions";

export function SiteNav({ variant = "light" }: { variant?: "light" | "ink" }) {
  const isInk = variant === "ink";
  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isInk
          ? "bg-[color:var(--ink)]/80 border-white/10 text-[color:var(--ink-foreground)]"
          : "bg-background/80 border-[color:var(--border)] text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <BambooLeaf size={18} className="text-[color:var(--gold)] -rotate-12" />
            <span
              className={`font-display text-2xl tracking-tighter uppercase ${
                isInk ? "text-[color:var(--ink-foreground)]" : "text-foreground"
              }`}
            >
              Bamboo
            </span>
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-mono uppercase tracking-widest opacity-80">
            <Link href="/discover" className="hover:text-[color:var(--gold)] transition-colors cursor-pointer">
              Walk the Grove
            </Link>
            <TendTheGroveLink />
            <Link href="/#pricing" className="hover:text-[color:var(--gold)] transition-colors cursor-pointer">
              Harvest
            </Link>
          </div>
        </div>
        <SiteNavActions variant={variant} />
      </div>
    </nav>
  );
}
