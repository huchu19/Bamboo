import Link from "next/link";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooStalk } from "@/components/bamboo/BambooStalk";
import { BambooLeaf, RootGlyph } from "@/components/bamboo/BambooIcons";
import { BambooDivider } from "@/components/bamboo/BambooDivider";
import { HeroFeaturedVideo } from "@/components/bamboo/HeroFeaturedVideo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[color:var(--gold)]/40 relative">
      <SiteNav />
      <BambooStalk />

      {/* Hero — Plant Your Seed */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--ink)] text-[color:var(--ink-foreground)] mb-8 animate-reveal">
              <BambooLeaf size={11} className="text-[color:var(--gold)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest">
                The Grove · Q1 2026 · $42M planted last quarter
              </span>
            </div>
            <h1 className="font-display text-[clamp(4rem,12vw,9rem)] leading-[0.85] uppercase tracking-tighter mb-4 animate-reveal">
              Plant <span className="text-[color:var(--gold)]">Your</span> Seed.
            </h1>
            <p className="font-display text-3xl md:text-4xl uppercase tracking-tighter text-foreground/60 mb-8 animate-reveal [animation-delay:100ms]">
              Grow Your Portfolio.
            </p>
            <p className="max-w-lg text-lg text-pretty leading-relaxed text-foreground/70 animate-reveal [animation-delay:200ms]">
              Bamboo is the fastest-growing organism on earth — and the grove where inventors
              plant their pitch and investors grow connected portfolios. Seed becomes
              business. Roots become network. Everyone grows together.
            </p>
            <div className="flex flex-wrap gap-4 mt-12 animate-reveal [animation-delay:300ms]">
              <Link
                href="/discover"
                className="group relative bg-gradient-to-br from-primary to-[color:var(--primary-deep)] text-primary-foreground px-8 py-4 rounded-xl font-bold flex flex-col items-start gap-1 hover:opacity-90 transition-all"
              >
                <span className="text-[10px] uppercase tracking-widest text-[color:var(--gold)]">Investors</span>
                <span className="text-lg flex items-center gap-2">
                  Walk the Grove
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="border-2 border-foreground/15 hover:border-primary px-8 py-4 rounded-xl font-bold flex flex-col items-start gap-1 transition-all"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Inventors</span>
                <span className="text-lg">Plant Your Pitch</span>
              </Link>
            </div>

          </div>

          {/* Featured Pitch Card */}
          <div className="col-span-12 lg:col-span-5 relative mt-12 lg:mt-0 animate-reveal [animation-delay:400ms]">
            <div className="bg-card rounded-[2rem] p-4 shadow-2xl shadow-primary/20 ring-1 ring-primary/10 rotate-2 hover:rotate-0 transition-transform duration-700">
              <HeroFeaturedVideo />
            </div>
          </div>
        </div>
      </header>

      {/* How It Works — Take Root */}
      <section className="py-24 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] bamboo-grain relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16 flex flex-col md:flex-row md:items-end gap-8">
            <div className="flex-1">
              <span className="font-mono text-[color:var(--gold)] text-xs uppercase tracking-widest">The Grove · 02</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mt-4">
                Take Root.
              </h2>
              <p className="text-white/60 mt-3 max-w-lg">
                Bamboo grows in connected groves through shared root systems. Every investor
                and every inventor feeds the same network. From seed to bloom in 12 days.
              </p>
            </div>
            <RootGlyph size={120} className="text-[color:var(--gold)]/60 shrink-0" />
          </div>
          <div className="grid md:grid-cols-3 gap-0 border-x border-white/10">
            {[
              {
                step: "01 / PLANT",
                title: "The 60s Seed",
                copy: "Inventors plant a 60-second pitch. Zero decks, zero fluff. Just the idea, ready to germinate.",
              },
              {
                step: "02 / ROOT",
                title: "The Vault",
                copy: "Financials, cap tables, and term sheets feed the root system. Root-Verified status unlocks priority.",
              },
              {
                step: "03 / GROW",
                title: "The Bloom",
                copy: "Accredited investors commit via Stripe-backed escrow. Capital flows through the grove, audit-trailed.",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className={`p-12 group hover:bg-white/5 transition-colors ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-white/10" : ""
                }`}
              >
                <span className="font-mono text-[color:var(--gold)] text-sm mb-8 block">{s.step}</span>
                <h3 className="font-display text-4xl uppercase tracking-tighter mb-4">{s.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual audience strip */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-px bg-[color:var(--border)]">
          <div className="bg-background p-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--gold)]">For Inventors</span>
            <h3 className="font-display text-5xl uppercase tracking-tighter mt-4 mb-6">
              Skip the warm intro.
            </h3>
            <ul className="space-y-3 text-sm text-foreground/80 mb-10">
              {[
                "Plant a 60-second pitch, no decks needed",
                "Upload your data room to a SOC-2 vault",
                "Earn Root-Verified for top-of-grove priority",
                "Receive offers directly — your inbox, your terms",
              ].map((t) => (
                <li key={t} className="flex gap-3 items-start">
                  <BambooLeaf size={13} className="text-[color:var(--gold)] mt-1 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground px-6 py-3 rounded-full hover:opacity-90 transition-all"
            >
              Plant your pitch →
            </Link>
          </div>
          <div className="bg-background p-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--gold)]">For Investors</span>
            <h3 className="font-display text-5xl uppercase tracking-tighter mt-4 mb-6">
              Conviction in 60 seconds.
            </h3>
            <ul className="space-y-3 text-sm text-foreground/80 mb-10">
              {[
                "Curated grove of Root-Verified inventors",
                "Watch the pitch before opening the vault",
                "Financials, cap tables, term sheets — one click",
                "Wire through Stripe escrow with audit trail",
              ].map((t) => (
                <li key={t} className="flex gap-3 items-start">
                  <BambooLeaf size={13} className="text-[color:var(--gold)] mt-1 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm font-semibold border-2 border-primary text-primary px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Walk the grove →
            </Link>
          </div>
        </div>
      </section>

      <BambooDivider label="For Investors" />

      {/* Accreditation callout */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto bg-card ring-1 ring-[color:var(--border)] rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--gold)]">Root-Verified Investors</span>
            <h3 className="font-display text-4xl uppercase tracking-tighter mt-3 mb-4">
              Trust grows in the roots.
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Every investor in the grove is gated through accreditation before they can
              commit capital. ID, income, and KYC verified — so inventors only meet serious
              backers and capital only meets compliant deals.
            </p>
          </div>
          <div className="shrink-0 grid grid-cols-2 gap-4 font-mono text-xs">
            {[
              ["ID", "Verified"],
              ["Income", "Verified"],
              ["KYC", "Cleared"],
            ].map(([k, v]) => (
              <div key={k} className="bg-background ring-1 ring-[color:var(--border)] rounded-xl p-4">
                <p className="text-foreground/50 uppercase tracking-widest text-[10px]">{k}</p>
                <p className="font-bold mt-1">{v}</p>
              </div>
            ))}
            <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-xl p-4 bamboo-grain">
              <p className="uppercase tracking-widest text-[10px] text-[color:var(--gold)]">Status</p>
              <p className="font-bold mt-1">Rooted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — Harvest */}
      <section id="pricing" className="py-32 px-6 bg-secondary/40">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--gold)]">The Harvest</span>
          <h2 className="font-display text-6xl uppercase tracking-tighter mt-4 mb-4">
            Harvest what you grow.
          </h2>
          <p className="text-muted-foreground">
            Flat fees, zero carry. We take zero percent of your raise — you keep your cap table clean.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-card p-10 rounded-[2rem] ring-1 ring-[color:var(--border)] flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Standard Seed
              </h3>
              <p className="text-4xl font-display uppercase mb-6">Plant Your Pitch</p>
              <ul className="space-y-4 text-sm mb-12">
                {[
                  "60s pitch video hosting",
                  "Public Grove discovery feed",
                  "Investor inbox + inquiries",
                  "Document vault (500 MB)",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <BambooLeaf size={13} className="text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/contact"
              className="block w-full py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all text-center"
            >
              Contact Us
            </Link>
          </div>
          <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] p-10 rounded-[2rem] flex flex-col justify-between relative overflow-hidden bamboo-grain">
            <div className="absolute -top-12 -right-12 font-display text-[10rem] text-[color:var(--gold)]/10 uppercase pointer-events-none select-none">
              Rooted
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[10px] font-bold rounded-full uppercase tracking-tighter mb-4">
                <BambooLeaf size={10} /> Recommended
              </div>
              <p className="text-4xl font-display uppercase mb-6 text-[color:var(--gold)]">Root-Verified</p>
              <ul className="space-y-4 text-sm mb-12 text-white/80">
                {[
                  "ID & financial verification",
                  "SOC-2 vault (5 GB)",
                  "Top-of-grove priority placement",
                  "Trust signal on every surface",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <BambooLeaf size={13} className="text-[color:var(--gold)]" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/contact"
              className="block w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] font-bold rounded-xl shadow-lg shadow-[color:var(--gold)]/20 hover:opacity-90 transition-all text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] border-t border-white/5 pt-24 pb-12 bamboo-grain">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
            <div className="max-w-sm">
              <span className="font-display text-4xl tracking-tighter uppercase flex items-center gap-2">
                <BambooLeaf size={22} className="text-[color:var(--gold)] -rotate-12" />
                Bamboo
              </span>
              <p className="mt-4 text-white/60 text-sm leading-relaxed">
                The capital grove for serious inventors and investors. Plant your seed.
                Grow your portfolio.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] flex items-center gap-1.5">
                  <BambooLeaf size={10} /> Grove
                </p>
                <Link href="/discover" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Walk the Grove</Link>
                <Link href="/dashboard" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Tend the Grove</Link>
                <Link href="#pricing" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Harvest</Link>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] flex items-center gap-1.5">
                  <BambooLeaf size={10} /> Company
                </p>
                <a href="#" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Manifesto</a>
                <a href="#" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Security</a>
                <a href="#" className="text-sm hover:text-[color:var(--gold)] transition-colors text-white/60">Contact</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-12 border-t border-white/10">
            <p className="text-[10px] font-mono text-white/40">
              © 2026 BAMBOO ASSET CORP. — Past growth is not indicative of future bloom.
            </p>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-[color:var(--gold)] animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/60">Grove Open · Network Online</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
